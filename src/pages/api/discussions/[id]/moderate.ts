import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * PUT /api/discussions/[id]/moderate
 * Moderate a discussion or forum post (pin/unpin, lock/unlock)
 * Teachers only
 * Body:
 *   - type: 'lesson' | 'forum' (required)
 *   - action: 'pin' | 'unpin' | 'lock' | 'unlock' (required)
 *
 * Permissions:
 *   - Only course teachers can moderate discussions
 *   - Students can pin/unpin their own posts (lesson discussions only)
 *   - Only teachers can lock/unlock forum posts
 */
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create supabase client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get discussion/forum post ID from URL params
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Discussion/Forum post ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, action } = body;

    // Validation
    const errors: string[] = [];

    if (!type || (type !== 'lesson' && type !== 'forum')) {
      errors.push('type is required and must be "lesson" or "forum"');
    }

    if (!action || !['pin', 'unpin', 'lock', 'unlock'].includes(action)) {
      errors.push('action is required and must be one of: pin, unpin, lock, unlock');
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle lesson discussion moderation
    if (type === 'lesson') {
      // Get discussion post
      const { data: discussion, error: discussionError } = await supabase
        .from('lesson_discussions')
        .select('id, user_id, cohort_id, lesson_id, is_pinned')
        .eq('id', id)
        .single();

      if (discussionError || !discussion) {
        return new Response(
          JSON.stringify({ error: 'Discussion not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Lock/unlock is not supported for lesson discussions (only forum posts)
      if (action === 'lock' || action === 'unlock') {
        return new Response(
          JSON.stringify({ error: 'Lock/unlock actions are only available for forum posts' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check permissions for pin/unpin
      // Users can pin their own posts, teachers can pin any post
      const isOwnPost = discussion.user_id === user.id;

      // Check if user is a teacher
      const { data: cohort } = await supabase
        .from('cohorts')
        .select('course_id')
        .eq('id', discussion.cohort_id)
        .single();

      let isTeacher = false;
      if (cohort) {
        const { data: course } = await supabase
          .from('courses')
          .select('created_by')
          .eq('id', cohort.course_id)
          .single();

        isTeacher = course?.created_by === user.id;
      }

      // Authorization check
      if (!isOwnPost && !isTeacher) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Only post authors or course teachers can moderate' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Update discussion
      const isPinned = action === 'pin';
      const { data: updated, error: updateError } = await supabase
        .from('lesson_discussions')
        .update({ is_pinned: isPinned })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating discussion:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to moderate discussion: ' + updateError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          discussion: updated,
          message: `Discussion ${action}ned successfully`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle forum post moderation
    if (type === 'forum') {
      // Get forum post
      const { data: forumPost, error: forumError } = await supabase
        .from('course_forums')
        .select('id, user_id, cohort_id, course_id, is_pinned, is_locked')
        .eq('id', id)
        .single();

      if (forumError || !forumPost) {
        return new Response(
          JSON.stringify({ error: 'Forum post not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if user is a teacher
      const { data: course } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', forumPost.course_id)
        .single();

      const isTeacher = course?.created_by === user.id;

      // For lock/unlock actions, only teachers are allowed
      if ((action === 'lock' || action === 'unlock') && !isTeacher) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Only course teachers can lock/unlock forum posts' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // For pin/unpin, users can pin their own posts or teachers can pin any
      const isOwnPost = forumPost.user_id === user.id;
      if ((action === 'pin' || action === 'unpin') && !isOwnPost && !isTeacher) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Only post authors or course teachers can pin/unpin' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Prepare update data
      const updateData: any = {};
      if (action === 'pin') {
        updateData.is_pinned = true;
      } else if (action === 'unpin') {
        updateData.is_pinned = false;
      } else if (action === 'lock') {
        updateData.is_locked = true;
      } else if (action === 'unlock') {
        updateData.is_locked = false;
      }

      // Update forum post
      const { data: updated, error: updateError } = await supabase
        .from('course_forums')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating forum post:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to moderate forum post: ' + updateError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          forumPost: updated,
          message: `Forum post ${action}ed successfully`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

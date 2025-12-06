import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'isomorphic-dompurify';
import type { LessonDiscussion, CourseForumPost } from '@/types';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/discussions
 * List discussions - supports both lesson discussions and forum posts
 * Query params:
 *   - type: 'lesson' | 'forum' (required)
 *   - lesson_id: number (required if type=lesson)
 *   - course_id: number (required if type=forum)
 *   - cohort_id: string (optional, filters by cohort)
 *   - limit: number (optional, default 20, max 100)
 *   - offset: number (optional, default 0)
 *   - order_by: 'created_at' | 'is_pinned' (optional, default 'created_at')
 */
export const GET: APIRoute = async ({ request, url }) => {
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

    // Get query parameters
    const type = url.searchParams.get('type');
    const lessonId = url.searchParams.get('lesson_id');
    const courseId = url.searchParams.get('course_id');
    const cohortId = url.searchParams.get('cohort_id');
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    const orderBy = url.searchParams.get('order_by') || 'created_at';

    // Validate type
    if (!type || (type !== 'lesson' && type !== 'forum')) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing type parameter. Must be "lesson" or "forum"' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse pagination params
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid pagination parameters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle lesson discussions
    if (type === 'lesson') {
      if (!lessonId || isNaN(parseInt(lessonId))) {
        return new Response(
          JSON.stringify({ error: 'lesson_id is required for lesson discussions' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Build query
      let query = supabase
        .from('lesson_discussions')
        .select('*', { count: 'exact' })
        .eq('lesson_id', parseInt(lessonId));

      // Filter by cohort if provided
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }

      // Order by pinned first, then by created_at
      if (orderBy === 'is_pinned') {
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: discussions, error: discussionsError, count } = await query;

      if (discussionsError) {
        console.error('Error fetching discussions:', discussionsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch discussions: ' + discussionsError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          discussions,
          count,
          limit,
          offset,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle forum posts
    if (type === 'forum') {
      if (!courseId || isNaN(parseInt(courseId))) {
        return new Response(
          JSON.stringify({ error: 'course_id is required for forum posts' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Build query
      let query = supabase
        .from('course_forums')
        .select('*', { count: 'exact' })
        .eq('course_id', parseInt(courseId));

      // Filter by cohort if provided
      if (cohortId) {
        query = query.eq('cohort_id', cohortId);
      }

      // Order by pinned first, then by created_at
      if (orderBy === 'is_pinned') {
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: forumPosts, error: forumError, count } = await query;

      if (forumError) {
        console.error('Error fetching forum posts:', forumError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch forum posts: ' + forumError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          forumPosts,
          count,
          limit,
          offset,
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

/**
 * POST /api/discussions
 * Create a new discussion post (lesson discussion or forum post)
 * Body:
 *   - type: 'lesson' | 'forum' (required)
 *   For lesson discussions:
 *     - lesson_id: number (required)
 *     - cohort_id: string (required)
 *     - content: string (required, max 2000 chars)
 *     - parent_id?: string (optional, for replies)
 *   For forum posts:
 *     - course_id: number (required)
 *     - cohort_id: string (required)
 *     - title: string (required, max 200 chars)
 *     - content: string (required, max 5000 chars)
 */
export const POST: APIRoute = async ({ request }) => {
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

    // Parse request body
    const body = await request.json();
    const { type, lesson_id, course_id, cohort_id, content, title, parent_id } = body;

    // Validate type
    if (!type || (type !== 'lesson' && type !== 'forum')) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing type. Must be "lesson" or "forum"' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Common validations
    const errors: string[] = [];

    if (!cohort_id) {
      errors.push('cohort_id is required');
    }

    if (!content || typeof content !== 'string') {
      errors.push('content is required and must be a string');
    } else if (content.trim().length === 0) {
      errors.push('content cannot be empty');
    }

    // Handle lesson discussions
    if (type === 'lesson') {
      if (!lesson_id || !Number.isInteger(lesson_id) || lesson_id < 0) {
        errors.push('lesson_id is required and must be a positive integer');
      }

      if (content && content.length > 2000) {
        errors.push('content must not exceed 2000 characters');
      }

      if (parent_id && typeof parent_id !== 'number') {
        errors.push('parent_id must be a number if provided');
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

      // Verify user is enrolled in the cohort
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('cohort_enrollments')
        .select('id, status')
        .eq('cohort_id', cohort_id)
        .eq('user_id', user.id)
        .single();

      if (enrollmentError || !enrollment || enrollment.status !== 'active') {
        return new Response(
          JSON.stringify({ error: 'You must be enrolled in this cohort to post' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify lesson exists
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id')
        .eq('id', lesson_id)
        .single();

      if (lessonError || !lesson) {
        return new Response(
          JSON.stringify({ error: 'Lesson not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // If parent_id is provided, verify it exists
      if (parent_id) {
        const { data: parentPost, error: parentError } = await supabase
          .from('lesson_discussions')
          .select('id')
          .eq('id', parent_id)
          .single();

        if (parentError || !parentPost) {
          return new Response(
            JSON.stringify({ error: 'Parent discussion not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }

      // Sanitize content
      const sanitizedContent = DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS: [] });

      // Check if user is a teacher (course creator)
      const { data: cohort } = await supabase
        .from('cohorts')
        .select('course_id')
        .eq('id', cohort_id)
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

      // Create discussion post
      const discussionData: Partial<LessonDiscussion> = {
        lesson_id,
        cohort_id,
        user_id: user.id,
        content: sanitizedContent,
        parent_id: parent_id || null,
        is_teacher_response: isTeacher,
        is_pinned: false,
      };

      const { data: discussion, error: discussionError } = await supabase
        .from('lesson_discussions')
        .insert([discussionData])
        .select()
        .single();

      if (discussionError) {
        console.error('Error creating discussion:', discussionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create discussion: ' + discussionError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Update last_activity_at in cohort_enrollments
      await supabase
        .from('cohort_enrollments')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('cohort_id', cohort_id)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({
          success: true,
          discussion,
          message: 'Discussion created successfully',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle forum posts
    if (type === 'forum') {
      if (!course_id || !Number.isInteger(course_id) || course_id < 0) {
        errors.push('course_id is required and must be a positive integer');
      }

      if (!title || typeof title !== 'string') {
        errors.push('title is required and must be a string');
      } else if (title.trim().length === 0) {
        errors.push('title cannot be empty');
      } else if (title.length > 200) {
        errors.push('title must not exceed 200 characters');
      }

      if (content && content.length > 5000) {
        errors.push('content must not exceed 5000 characters');
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

      // Verify user is enrolled in the cohort
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('cohort_enrollments')
        .select('id, status')
        .eq('cohort_id', cohort_id)
        .eq('user_id', user.id)
        .single();

      if (enrollmentError || !enrollment || enrollment.status !== 'active') {
        return new Response(
          JSON.stringify({ error: 'You must be enrolled in this cohort to post' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify course exists
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('id', course_id)
        .single();

      if (courseError || !course) {
        return new Response(
          JSON.stringify({ error: 'Course not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Sanitize content and title
      const sanitizedTitle = DOMPurify.sanitize(title.trim(), { ALLOWED_TAGS: [] });
      const sanitizedContent = DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS: [] });

      // Create forum post
      const forumData: Partial<CourseForumPost> = {
        course_id,
        cohort_id,
        user_id: user.id,
        title: sanitizedTitle,
        content: sanitizedContent,
        is_pinned: false,
        is_locked: false,
      };

      const { data: forumPost, error: forumError } = await supabase
        .from('course_forums')
        .insert([forumData])
        .select()
        .single();

      if (forumError) {
        console.error('Error creating forum post:', forumError);
        return new Response(
          JSON.stringify({ error: 'Failed to create forum post: ' + forumError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Update last_activity_at in cohort_enrollments
      await supabase
        .from('cohort_enrollments')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('cohort_id', cohort_id)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({
          success: true,
          forumPost,
          message: 'Forum post created successfully',
        }),
        {
          status: 201,
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

/**
 * DELETE /api/discussions
 * Delete a discussion post or forum post
 * Query params:
 *   - type: 'lesson' | 'forum' (required)
 *   - id: string (required)
 */
export const DELETE: APIRoute = async ({ request, url }) => {
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

    // Get query parameters
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    if (!type || (type !== 'lesson' && type !== 'forum')) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing type parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id parameter is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle lesson discussion deletion
    if (type === 'lesson') {
      // RLS policies will handle permissions (users can delete own posts, teachers can delete any)
      const { error: deleteError } = await supabase
        .from('lesson_discussions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting discussion:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete discussion: ' + deleteError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Discussion deleted successfully',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle forum post deletion
    if (type === 'forum') {
      // RLS policies will handle permissions
      const { error: deleteError } = await supabase
        .from('course_forums')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting forum post:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete forum post: ' + deleteError.message }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Forum post deleted successfully',
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

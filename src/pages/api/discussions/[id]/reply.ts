import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { stripHTML } from '../../../../lib/security';
import type { ForumReply } from '@/types';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/discussions/[id]/reply
 * Reply to a forum post
 * Body:
 *   - content: string (required, max 2000 chars)
 *
 * Note: For lesson discussion replies, use POST /api/discussions with parent_id
 * This endpoint is specifically for forum_replies table
 */
export const POST: APIRoute = async ({ request, params }) => {
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

    // Get forum post ID from URL params
    const forumPostId = params.id;
    if (!forumPostId) {
      return new Response(
        JSON.stringify({ error: 'Forum post ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validation
    const errors: string[] = [];

    if (!content || typeof content !== 'string') {
      errors.push('content is required and must be a string');
    } else if (content.trim().length === 0) {
      errors.push('content cannot be empty');
    } else if (content.length > 2000) {
      errors.push('content must not exceed 2000 characters');
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

    // Verify forum post exists and get its cohort_id
    const { data: forumPost, error: forumError } = await supabase
      .from('course_forums')
      .select('id, cohort_id, is_locked, course_id')
      .eq('id', forumPostId)
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

    // Check if forum post is locked
    if (forumPost.is_locked) {
      return new Response(
        JSON.stringify({ error: 'This forum post is locked and cannot receive new replies' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify user is enrolled in the cohort
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('cohort_enrollments')
      .select('id, status')
      .eq('cohort_id', forumPost.cohort_id)
      .eq('user_id', user.id)
      .single();

    if (enrollmentError || !enrollment || enrollment.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'You must be enrolled in this cohort to reply' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is a teacher (course creator)
    const { data: course } = await supabase
      .from('courses')
      .select('created_by')
      .eq('id', forumPost.course_id)
      .single();

    const isTeacher = course?.created_by === user.id;

    // Sanitize content
    const sanitizedContent = stripHTML(content.trim());

    // Create forum reply
    const replyData: Partial<ForumReply> = {
      forum_post_id: forumPostId,
      user_id: user.id,
      content: sanitizedContent,
      is_teacher_response: isTeacher,
    };

    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .insert([replyData])
      .select()
      .single();

    if (replyError) {
      console.error('Error creating reply:', replyError);
      return new Response(
        JSON.stringify({ error: 'Failed to create reply: ' + replyError.message }),
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
      .eq('cohort_id', forumPost.cohort_id)
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        message: 'Reply created successfully',
      }),
      {
        status: 201,
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
 * GET /api/discussions/[id]/reply
 * Get all replies for a forum post
 * Query params:
 *   - limit: number (optional, default 50, max 100)
 *   - offset: number (optional, default 0)
 */
export const GET: APIRoute = async ({ request, params, url }) => {
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

    // Get forum post ID from URL params
    const forumPostId = params.id;
    if (!forumPostId) {
      return new Response(
        JSON.stringify({ error: 'Forum post ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse pagination params
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50;
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

    // Verify forum post exists
    const { data: forumPost, error: forumError } = await supabase
      .from('course_forums')
      .select('id')
      .eq('id', forumPostId)
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

    // Get replies (RLS will handle access control)
    const { data: replies, error: repliesError, count } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact' })
      .eq('forum_post_id', forumPostId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch replies: ' + repliesError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        replies,
        count,
        limit,
        offset,
      }),
      {
        status: 200,
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

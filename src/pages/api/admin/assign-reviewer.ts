/**
 * Reviewer Assignment API
 * POST /api/admin/assign-reviewer - Assign/reassign reviewer to application(s)
 * GET /api/admin/assign-reviewer?application_id=xxx - Get current assignment
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const prerender = false;

function checkConfiguration(): { valid: boolean; error?: string } {
  if (!supabaseUrl) {
    console.error('[assign-reviewer] Missing PUBLIC_SUPABASE_URL');
    return { valid: false, error: 'Server configuration error' };
  }
  if (!supabaseServiceKey) {
    console.error('[assign-reviewer] Missing SUPABASE_SERVICE_ROLE_KEY');
    return { valid: false, error: 'Server configuration error' };
  }
  return { valid: true };
}

async function verifyAdminAccess(supabase: any, userId: string) {
  const { data: application } = await supabase
    .from('applications')
    .select('role')
    .eq('user_id', userId)
    .single();

  return application && application.role === 'admin';
}

// GET - Get current assignment for an application
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Configuration sanity check
    const configCheck = checkConfiguration();
    if (!configCheck.valid) {
      return new Response(JSON.stringify({ error: configCheck.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const cookies = request.headers.get('cookie') || '';
    const authCookieMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (authCookieMatch) {
      try {
        const decoded = decodeURIComponent(authCookieMatch[1]);
        let tokenData;
        try {
          tokenData = JSON.parse(decoded);
        } catch {
          tokenData = JSON.parse(atob(decoded));
        }
        accessToken = tokenData.access_token || tokenData[0];
        refreshToken = tokenData.refresh_token || tokenData[1];
      } catch (e) {
        console.error('[assign-reviewer GET] Failed to parse auth cookie', e);
      }
    }

    if (!accessToken) {
      console.warn('[assign-reviewer GET] Auth failed: No access token found in cookies');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { session }, error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (authError || !session) {
      console.warn('[assign-reviewer GET] Auth failed: setSession error', {
        errorCode: authError?.code,
        errorMessage: authError?.message
      });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = session.user;

    const isAdmin = await verifyAdminAccess(supabase, user.id);
    if (!isAdmin) {
      console.warn('[assign-reviewer GET] Auth failed: Admin role check failed', {
        userId: user.id
      });
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const applicationId = url.searchParams.get('application_id');
    if (!applicationId) {
      return new Response(JSON.stringify({ error: 'application_id parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: application, error } = await supabase
      .from('applications')
      .select('id, assigned_reviewer_id, assignment_date')
      .eq('id', applicationId)
      .single();

    if (error) throw error;

    if (!application) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get reviewer info if assigned
    let reviewer = null;
    if (application.assigned_reviewer_id) {
      const { data: reviewerApp } = await supabase
        .from('applications')
        .select('name, email, role')
        .eq('user_id', application.assigned_reviewer_id)
        .single();

      reviewer = reviewerApp;
    }

    return new Response(JSON.stringify({
      application_id: application.id,
      assigned_reviewer_id: application.assigned_reviewer_id,
      assignment_date: application.assignment_date,
      reviewer
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error getting assignment:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST - Assign/reassign reviewer(s) to application(s)
export const POST: APIRoute = async ({ request }) => {
  try {
    // Configuration sanity check
    const configCheck = checkConfiguration();
    if (!configCheck.valid) {
      return new Response(JSON.stringify({ error: configCheck.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const cookies = request.headers.get('cookie') || '';
    const authCookieMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (authCookieMatch) {
      try {
        const decoded = decodeURIComponent(authCookieMatch[1]);
        let tokenData;
        try {
          tokenData = JSON.parse(decoded);
        } catch {
          tokenData = JSON.parse(atob(decoded));
        }
        accessToken = tokenData.access_token || tokenData[0];
        refreshToken = tokenData.refresh_token || tokenData[1];
      } catch (e) {
        console.error('[assign-reviewer POST] Failed to parse auth cookie', e);
      }
    }

    if (!accessToken) {
      console.warn('[assign-reviewer POST] Auth failed: No access token found in cookies');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { session }, error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (authError || !session) {
      console.warn('[assign-reviewer POST] Auth failed: setSession error', {
        errorCode: authError?.code,
        errorMessage: authError?.message
      });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = session.user;

    const isAdmin = await verifyAdminAccess(supabase, user.id);
    if (!isAdmin) {
      console.warn('[assign-reviewer POST] Auth failed: Admin role check failed', {
        userId: user.id
      });
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { application_ids, reviewer_id } = body;

    if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'application_ids array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If reviewer_id is null, we're unassigning
    const updateData: any = {
      assigned_reviewer_id: reviewer_id || null,
      assignment_date: reviewer_id ? new Date().toISOString() : null
    };

    // Update assignments
    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .in('id', application_ids);

    if (error) throw error;

    // Get reviewer info if assigned
    let reviewer = null;
    if (reviewer_id) {
      const { data: reviewerApp } = await supabase
        .from('applications')
        .select('name, email, role')
        .eq('user_id', reviewer_id)
        .single();

      reviewer = reviewerApp;
    }

    return new Response(JSON.stringify({
      success: true,
      assigned_count: application_ids.length,
      reviewer,
      message: reviewer_id
        ? `Successfully assigned ${application_ids.length} application(s) to ${reviewer?.name || 'reviewer'}`
        : `Successfully unassigned ${application_ids.length} application(s)`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error assigning reviewer:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

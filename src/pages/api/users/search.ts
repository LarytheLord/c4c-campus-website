/**
 * User Search API
 *
 * GET - Search for users by name or email
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query too short' }),
        { status: 400 }
      );
    }

    // Search users
    const { data, error } = await supabase
      .from('applications')
      .select('user_id, name, email')
      .neq('user_id', user.id)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        users: (data || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          email: u.email,
        })),
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/users/search:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      { status: 500 }
    );
  }
};

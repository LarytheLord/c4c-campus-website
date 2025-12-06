import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Fetch review notes for an application
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('application_id');

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: 'application_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if review_notes table exists, if not return empty array
    const { data: notes, error } = await supabaseAdmin
      .from('review_notes')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, just return empty array
      if (error.code === '42P01') {
        return new Response(
          JSON.stringify({ notes: [] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      console.error('Error fetching notes:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notes' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ notes: notes || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get review notes error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST - Add a review note
export const POST: APIRoute = async ({ request }) => {
  try {
    const { application_id, note, is_internal, reviewer_name } = await request.json();

    if (!application_id || !note) {
      return new Response(
        JSON.stringify({ error: 'application_id and note are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Try to insert the note - if table doesn't exist, create it
    const { data, error } = await supabaseAdmin
      .from('review_notes')
      .insert({
        application_id,
        note,
        is_internal: is_internal ?? true,
        reviewer_name: reviewer_name || 'Admin',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, try to create it
      if (error.code === '42P01') {
        // Create the table
        await supabaseAdmin.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS review_notes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
              note TEXT NOT NULL,
              is_internal BOOLEAN DEFAULT true,
              reviewer_name TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        });

        // Retry the insert
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('review_notes')
          .insert({
            application_id,
            note,
            is_internal: is_internal ?? true,
            reviewer_name: reviewer_name || 'Admin',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (retryError) {
          console.error('Retry insert error:', retryError);
          return new Response(
            JSON.stringify({ error: 'Failed to add note' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, note: retryData }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.error('Insert note error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to add note' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, note: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Add review note error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

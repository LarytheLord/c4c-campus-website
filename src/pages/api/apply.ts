import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { validatePassword } from '../../lib/password-validation';
import { sendApplicationReceivedEmail } from '../../lib/email-notifications';

// Enable server-side rendering for this API route
export const prerender = false;

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Log request details for debugging
    console.log('[API /apply] Received POST request');
    console.log('[API /apply] Content-Type:', request.headers.get('content-type'));

    const formData = await request.json();
    console.log('[API /apply] Successfully parsed JSON');
    console.log('[API /apply] Email:', formData.email);
    console.log('[API /apply] Program:', formData.program);

    const { email, password, confirmPassword, program, ...applicationData } = formData;

    // Normalize and validate scholarship fields
    let scholarshipRequested = Boolean(applicationData.scholarshipRequested);
    let scholarshipCategory: string | null = applicationData.scholarshipCategory?.trim() ?? null;
    if (!scholarshipCategory) {
      scholarshipCategory = null;
    }

    // If scholarship is requested but category is missing, reject the request
    if (scholarshipRequested && !scholarshipCategory) {
      return new Response(
        JSON.stringify({ error: 'Scholarship category is required when requesting a scholarship' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Passwords do not match' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength (VULN-002 fix)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.warn('[API /apply] Weak password rejected:', passwordValidation.errors);
      return new Response(
        JSON.stringify({
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a regular Supabase client for signUp (this triggers verification email)
    const supabaseClient = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );

    // Use signUp instead of admin.createUser - this sends verification email automatically
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: applicationData.name,
          program,
          status: 'pending'
        },
        emailRedirectTo: `${import.meta.env.SITE_URL || 'https://codeforcompassion.com'}/login?verified=true`
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store application data in applications table (using admin client - bypasses RLS)
    const { error: dbError } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: authData.user.id,
        program,
        status: 'pending',
        role: 'student', // All new signups are students by default
        name: applicationData.name,
        email,
        whatsapp: applicationData.whatsapp,
        location: applicationData.location,
        discord: applicationData.discord,
        // Bootcamp specific fields
        interests: applicationData.interests,
        motivation: applicationData.motivation,
        technical_experience: applicationData.technicalExperience,
        commitment: applicationData.commitment,
        // Scholarship fields (using normalized values)
        scholarship_requested: scholarshipRequested,
        scholarship_category: scholarshipCategory,
        // Accelerator specific fields
        track: applicationData.track,
        project_name: applicationData.projectName,
        project_description: applicationData.projectDescription,
        prototype_link: applicationData.prototypeLink,
        tech_stack: applicationData.techStack,
        target_users: applicationData.targetUsers,
        production_needs: applicationData.productionNeeds,
        team_size: applicationData.teamSize ? parseInt(applicationData.teamSize) : null,
        current_stage: applicationData.currentStage,
        funding: applicationData.funding
      });

    if (dbError) {
      console.error('Supabase database error:', dbError);
      return new Response(
        JSON.stringify({
          error: 'Account created but failed to save application. Please contact info@codeforcompassion.com with your email to complete your application.',
          details: dbError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send admin notification email (non-blocking)
    sendApplicationReceivedEmail({
      name: applicationData.name,
      email,
      program,
      location: applicationData.location,
      discord: applicationData.discord,
      motivation: applicationData.motivation,
      projectName: applicationData.projectName,
      projectDescription: applicationData.projectDescription,
    }).catch(err => console.error('Failed to send admin notification:', err));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Application submitted successfully! Check your email to verify your account.',
        userId: authData.user.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Application error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit application' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

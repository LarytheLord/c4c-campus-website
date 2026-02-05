/**
 * Reviewers List API
 * GET /api/admin/reviewers - Get list of all admins who can review applications
 * Includes statistics for each reviewer
 */

import type { APIRoute } from 'astro';
import {
  authenticateRequest,
  verifyAdminAccess,
  createServiceClient,
} from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Authenticate: verify JWT signature + extract user
    const authResult = await authenticateRequest(request);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const supabase = createServiceClient();

    const isAdmin = await verifyAdminAccess(supabase, user.id);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all admins
    const { data: admins, error } = await supabase
      .from('applications')
      .select('user_id, name, email, role')
      .eq('role', 'admin');

    if (error) throw error;

    // Get stats for each reviewer
    const reviewersWithStats = await Promise.all(
      (admins || []).map(async (admin) => {
        // Get assignment counts
        const { data: assignments } = await supabase
          .from('applications')
          .select('id, status, assignment_date, reviewed_at')
          .eq('assigned_reviewer_id', admin.user_id);

        const total = assignments?.length || 0;
        const pending = assignments?.filter(a => a.status === 'pending').length || 0;
        const approved = assignments?.filter(a => a.status === 'approved').length || 0;
        const rejected = assignments?.filter(a => a.status === 'rejected').length || 0;
        const waitlisted = assignments?.filter(a => a.status === 'waitlisted').length || 0;

        // Calculate average review time
        const completedReviews = assignments?.filter(
          a => a.reviewed_at && a.assignment_date
        ) || [];

        let avgReviewTimeHours = 0;
        if (completedReviews.length > 0) {
          const totalHours = completedReviews.reduce((sum, a) => {
            const assignedTime = new Date(a.assignment_date).getTime();
            const reviewedTime = new Date(a.reviewed_at).getTime();
            const hours = (reviewedTime - assignedTime) / (1000 * 60 * 60);
            return sum + hours;
          }, 0);
          avgReviewTimeHours = Math.round((totalHours / completedReviews.length) * 10) / 10;
        }

        return {
          user_id: admin.user_id,
          name: admin.name,
          email: admin.email,
          stats: {
            total_assigned: total,
            pending: pending,
            approved: approved,
            rejected: rejected,
            waitlisted: waitlisted,
            avg_review_time_hours: avgReviewTimeHours
          }
        };
      })
    );

    return new Response(JSON.stringify({ reviewers: reviewersWithStats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching reviewers:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

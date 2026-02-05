/**
 * Teacher Cohort Analytics API
 * GET /api/teacher/cohort-analytics?cohortId=123
 *
 * Returns comprehensive analytics for a cohort including:
 * - Overall statistics (students, completion rates, etc.)
 * - Individual student progress
 * - Progress over time (for charts)
 * - Struggling students
 * - Leaderboard
 */

import type { APIRoute } from 'astro';
import type {
  CohortAnalytics,
  StudentWithProgress,
  ProgressOverTime,
  LeaderboardEntry
} from '../../../types';
import {
  authenticateRequest,
  verifyTeacherOrAdminAccess,
  createServiceClient,
} from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Authenticate: verify JWT signature + extract user
    const authResult = await authenticateRequest(request);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const supabase = createServiceClient();

    // Verify teacher role
    const isTeacherOrAdmin = await verifyTeacherOrAdminAccess(supabase, user.id);
    if (!isTeacherOrAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Teacher access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Need the role for admin bypass check below
    const { data: application } = await supabase
      .from('applications')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Get cohort ID from query params
    const cohortId = url.searchParams.get('cohortId');
    if (!cohortId) {
      return new Response(JSON.stringify({ error: 'cohortId parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify teacher owns this cohort
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*, courses!inner(title, created_by)')
      .eq('id', cohortId)
      .single();

    if (cohortError || !cohort) {
      return new Response(JSON.stringify({ error: 'Cohort not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (cohort.courses.created_by !== user.id && application?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Not your cohort' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get total lessons in the course - two-step approach to avoid subquery issues
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', cohort.course_id);

    const moduleIds = modules?.map(m => m.id) || [];

    let totalLessons = 0;
    if (moduleIds.length > 0) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds);

      totalLessons = lessons?.length || 0;
    }

    // Get all enrollments for this cohort (no join — cohort_enrollments has no FK to applications)
    const { data: enrollments, error: enrollError } = await supabase
      .from('cohort_enrollments')
      .select('user_id, enrolled_at, status, completed_lessons, last_activity_at')
      .eq('cohort_id', cohortId);

    if (enrollError) {
      console.error('Error fetching enrollments:', enrollError);
      return new Response(JSON.stringify({ error: 'Failed to fetch enrollment data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const studentsList = enrollments || [];
    const userIds = studentsList.map(e => e.user_id);

    // Fetch student names/emails from applications table separately
    let appsByUserId: Record<string, { name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: apps } = await supabase
        .from('applications')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (apps) {
        for (const a of apps) {
          appsByUserId[a.user_id] = { name: a.name, email: a.email };
        }
      }
    }

    // Get lesson progress for all students in this cohort
    // Include lesson_id, completed, completed_at, last_accessed_at for accurate cohort-scoped aggregation
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('user_id, lesson_id, time_spent_seconds, completed, completed_at, last_accessed_at')
      .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']) // Avoid empty array
      .eq('cohort_id', cohortId);

    // Calculate progress metrics for each student using lesson_progress data directly
    // This provides accurate cohort-scoped progress instead of relying solely on enrollment.completed_lessons
    const now = new Date();
    const students: StudentWithProgress[] = studentsList.map((enrollment: any) => {
      const userProgress = progressData?.filter(p => p.user_id === enrollment.user_id) || [];

      // Derive completed_lessons from lesson_progress rows (count distinct lesson_id where completed=true)
      const completedLessonIds = new Set(
        userProgress.filter(p => p.completed).map(p => p.lesson_id)
      );
      const derivedCompletedLessons = completedLessonIds.size;

      // Use derived value, fallback to enrollment field if no progress rows exist
      const completedLessons = userProgress.length > 0 ? derivedCompletedLessons : (enrollment.completed_lessons || 0);

      const timeSpentSeconds = userProgress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
      const timeSpentHours = Math.round((timeSpentSeconds / 3600) * 10) / 10;
      const completionPercentage = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      // Determine last activity from lesson_progress (most recent completed_at or last_accessed_at)
      // Fall back to enrollment.last_activity_at if no progress data
      let lastActivityAt = enrollment.last_activity_at;
      if (userProgress.length > 0) {
        const progressTimestamps = userProgress
          .map(p => p.completed_at || p.last_accessed_at)
          .filter(Boolean)
          .map(ts => new Date(ts).getTime());
        if (progressTimestamps.length > 0) {
          const mostRecent = Math.max(...progressTimestamps);
          lastActivityAt = new Date(mostRecent).toISOString();
        }
      }

      const lastActivity = new Date(lastActivityAt);
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      const isStruggling = completionPercentage < 20 || daysSinceActivity > 7;

      return {
        user_id: enrollment.user_id,
        name: appsByUserId[enrollment.user_id]?.name || 'Unknown',
        email: appsByUserId[enrollment.user_id]?.email || '',
        enrolled_at: enrollment.enrolled_at,
        status: enrollment.status,
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        completion_percentage: completionPercentage,
        last_activity_at: lastActivityAt,
        time_spent_hours: timeSpentHours,
        is_struggling: isStruggling,
        days_since_activity: daysSinceActivity
      };
    });

    // Calculate aggregate analytics
    const activeStudents = students.filter(s => s.status === 'active').length;
    const completedStudents = students.filter(s => s.status === 'completed').length;
    const droppedStudents = students.filter(s => s.status === 'dropped').length;
    const strugglingStudents = students.filter(s => s.is_struggling && s.status === 'active');
    const recentlyActive = students.filter(s => s.days_since_activity <= 7).length;

    const avgCompletion = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.completion_percentage, 0) / students.length)
      : 0;

    const avgTimeSpent = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.time_spent_hours, 0) / students.length * 10) / 10
      : 0;

    const engagementRate = students.length > 0
      ? Math.round((recentlyActive / students.length) * 100)
      : 0;

    const analytics: CohortAnalytics = {
      cohort_id: cohortId, // UUID string, not parsed as number
      cohort_name: cohort.name,
      course_name: cohort.courses.title,
      total_students: students.length,
      active_students: activeStudents,
      completed_students: completedStudents,
      dropped_students: droppedStudents,
      average_completion_percentage: avgCompletion,
      average_time_spent_hours: avgTimeSpent,
      struggling_students_count: strugglingStudents.length,
      engagement_rate: engagementRate,
      total_lessons: totalLessons,
      most_completed_lesson_id: null, // Could be calculated with more complex query
      least_completed_lesson_id: null, // Could be calculated with more complex query
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      status: cohort.status
    };

    // Generate progress over time data (last 30 days)
    const progressOverTime: ProgressOverTime[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Count completions on this day
      const completionsOnDay = progressData?.filter(p =>
        p.completed && p.completed_at &&
        p.completed_at.startsWith(dateStr)
      ).length || 0;

      // Count active students on this day
      const activeOnDay = studentsList.filter((e: any) => {
        const enrolledDate = new Date(e.enrolled_at);
        return enrolledDate <= date;
      }).length;

      // Count new enrollments on this day
      const newEnrollmentsOnDay = studentsList.filter((e: any) =>
        e.enrolled_at.startsWith(dateStr)
      ).length;

      progressOverTime.push({
        date: dateStr,
        completed_lessons: completionsOnDay,
        active_students: activeOnDay,
        new_enrollments: newEnrollmentsOnDay,
        average_completion_rate: activeOnDay > 0 ? Math.round((completionsOnDay / activeOnDay) * 100) : 0
      });
    }

    // Generate leaderboard (top 10 performers)
    const leaderboard: LeaderboardEntry[] = students
      .filter(s => s.status === 'active' || s.status === 'completed')
      .sort((a, b) => {
        // Sort by completion percentage, then by time spent
        if (b.completion_percentage !== a.completion_percentage) {
          return b.completion_percentage - a.completion_percentage;
        }
        return b.completed_lessons - a.completed_lessons;
      })
      .slice(0, 10)
      .map((student, index) => ({
        rank: index + 1,
        user_id: student.user_id,
        name: student.name,
        completed_lessons: student.completed_lessons,
        completion_percentage: student.completion_percentage,
        time_spent_hours: student.time_spent_hours,
        last_activity_at: student.last_activity_at
      }));

    // Return comprehensive analytics
    return new Response(JSON.stringify({
      analytics,
      students,
      struggling_students: strugglingStudents,
      leaderboard,
      progress_over_time: progressOverTime
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in cohort-analytics API:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

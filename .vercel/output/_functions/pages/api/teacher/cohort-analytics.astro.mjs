import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../../renderers.mjs";
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseKey = "***REMOVED***";
const GET = async ({ request, url }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: request.headers.get("Authorization") || ""
        }
      }
    });
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: Authorization header required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: application } = await supabase.from("applications").select("role").eq("user_id", user.id).single();
    if (!application || application.role !== "teacher" && application.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Teacher access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const cohortId = url.searchParams.get("cohortId");
    if (!cohortId) {
      return new Response(JSON.stringify({ error: "cohortId parameter required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: cohort, error: cohortError } = await supabase.from("cohorts").select("*, courses!inner(name, created_by)").eq("id", cohortId).single();
    if (cohortError || !cohort) {
      return new Response(JSON.stringify({ error: "Cohort not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (cohort.courses.created_by !== user.id && application.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Not your cohort" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: lessons, error: lessonsError } = await supabase.from("lessons").select("id, module_id").in(
      "module_id",
      supabase.from("modules").select("id").eq("course_id", cohort.course_id)
    );
    const totalLessons = lessons?.length || 0;
    const { data: enrollments, error: enrollError } = await supabase.from("cohort_enrollments").select(`
        user_id,
        enrolled_at,
        status,
        completed_lessons,
        last_activity_at,
        applications!inner(name, email)
      `).eq("cohort_id", cohortId);
    if (enrollError) {
      console.error("Error fetching enrollments:", enrollError);
      return new Response(JSON.stringify({ error: "Failed to fetch enrollment data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const studentsList = enrollments || [];
    const userIds = studentsList.map((e) => e.user_id);
    const { data: progressData } = await supabase.from("lesson_progress").select("user_id, time_spent_seconds, completed, completed_at").in("user_id", userIds).eq("cohort_id", cohortId);
    const now = /* @__PURE__ */ new Date();
    const students = studentsList.map((enrollment) => {
      const userProgress = progressData?.filter((p) => p.user_id === enrollment.user_id) || [];
      const timeSpentSeconds = userProgress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
      const timeSpentHours = Math.round(timeSpentSeconds / 3600 * 10) / 10;
      const completionPercentage = totalLessons > 0 ? Math.round(enrollment.completed_lessons / totalLessons * 100) : 0;
      const lastActivity = new Date(enrollment.last_activity_at);
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1e3 * 60 * 60 * 24));
      const isStruggling = completionPercentage < 20 || daysSinceActivity > 7;
      return {
        user_id: enrollment.user_id,
        name: enrollment.applications.name,
        email: enrollment.applications.email,
        enrolled_at: enrollment.enrolled_at,
        status: enrollment.status,
        completed_lessons: enrollment.completed_lessons,
        total_lessons: totalLessons,
        completion_percentage: completionPercentage,
        last_activity_at: enrollment.last_activity_at,
        time_spent_hours: timeSpentHours,
        is_struggling: isStruggling,
        days_since_activity: daysSinceActivity
      };
    });
    const activeStudents = students.filter((s) => s.status === "active").length;
    const completedStudents = students.filter((s) => s.status === "completed").length;
    const droppedStudents = students.filter((s) => s.status === "dropped").length;
    const strugglingStudents = students.filter((s) => s.is_struggling && s.status === "active");
    const recentlyActive = students.filter((s) => s.days_since_activity <= 7).length;
    const avgCompletion = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.completion_percentage, 0) / students.length) : 0;
    const avgTimeSpent = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.time_spent_hours, 0) / students.length * 10) / 10 : 0;
    const engagementRate = students.length > 0 ? Math.round(recentlyActive / students.length * 100) : 0;
    const analytics = {
      cohort_id: parseInt(cohortId),
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
      most_completed_lesson_id: null,
      // Could be calculated with more complex query
      least_completed_lesson_id: null,
      // Could be calculated with more complex query
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      status: cohort.status
    };
    const progressOverTime = [];
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const completionsOnDay = progressData?.filter(
        (p) => p.completed && p.completed_at && p.completed_at.startsWith(dateStr)
      ).length || 0;
      const activeOnDay = studentsList.filter((e) => {
        const enrolledDate = new Date(e.enrolled_at);
        return enrolledDate <= date;
      }).length;
      const newEnrollmentsOnDay = studentsList.filter(
        (e) => e.enrolled_at.startsWith(dateStr)
      ).length;
      progressOverTime.push({
        date: dateStr,
        completed_lessons: completionsOnDay,
        active_students: activeOnDay,
        new_enrollments: newEnrollmentsOnDay,
        average_completion_rate: activeOnDay > 0 ? Math.round(completionsOnDay / activeOnDay * 100) : 0
      });
    }
    const leaderboard = students.filter((s) => s.status === "active" || s.status === "completed").sort((a, b) => {
      if (b.completion_percentage !== a.completion_percentage) {
        return b.completion_percentage - a.completion_percentage;
      }
      return b.completed_lessons - a.completed_lessons;
    }).slice(0, 10).map((student, index) => ({
      rank: index + 1,
      user_id: student.user_id,
      name: student.name,
      completed_lessons: student.completed_lessons,
      completion_percentage: student.completion_percentage,
      time_spent_hours: student.time_spent_hours,
      last_activity_at: student.last_activity_at
    }));
    return new Response(JSON.stringify({
      analytics,
      students,
      struggling_students: strugglingStudents,
      leaderboard,
      progress_over_time: progressOverTime
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in cohort-analytics API:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};

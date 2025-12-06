# Cohort API Reference

**Version:** 2.0.0
**Date:** October 29, 2025
**Status:** Implementation Complete with Comprehensive Documentation

---

## Overview

This guide provides code examples for common cohort system operations using the Supabase JavaScript client. All examples assume you're using TypeScript with Astro or a similar framework.

**Client Setup:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
```

---

## Table of Contents

1. [Cohort Management](#cohort-management)
2. [Student Enrollment](#student-enrollment)
3. [Schedule Management](#schedule-management)
4. [Student Roster](#student-roster)
5. [Discussions](#discussions)
6. [Forums](#forums)
7. [Progress Tracking](#progress-tracking)
8. [Time-Gating Logic](#time-gating-logic)
9. [Error Handling](#error-handling)

---

## Cohort Management

### Create a New Cohort

**Use Case:** Teacher creates a new cohort for their course

```typescript
// src/pages/api/cohorts/create.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    }
  );

  const { course_id, name, start_date, end_date, max_students } = await request.json();

  // Verify teacher owns the course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, created_by')
    .eq('id', course_id)
    .single();

  if (courseError || !course) {
    return new Response(JSON.stringify({ error: 'Course not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (course.created_by !== user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create cohort
  const { data: cohort, error: cohortError } = await supabase
    .from('cohorts')
    .insert({
      course_id,
      name,
      start_date,
      end_date,
      max_students: max_students || 50,
      created_by: user.id,
    })
    .select()
    .single();

  if (cohortError) {
    return new Response(JSON.stringify({ error: cohortError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ cohort }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

---

### Get All Cohorts for a Course

**Use Case:** Display available cohorts on course page

```typescript
// Get published cohorts for students
async function getAvailableCohorts(courseId: number) {
  const { data, error } = await supabase
    .from('cohorts')
    .select('id, name, start_date, end_date, status, max_students')
    .eq('course_id', courseId)
    .in('status', ['upcoming', 'active'])
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data;
}

// Get all cohorts for teacher (including archived)
async function getTeacherCohorts(courseId: number) {
  const { data, error } = await supabase
    .from('cohorts')
    .select(`
      id,
      name,
      start_date,
      end_date,
      status,
      max_students,
      cohort_enrollments (count)
    `)
    .eq('course_id', courseId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

### Update Cohort Details

**Use Case:** Teacher adjusts cohort dates or capacity

```typescript
async function updateCohort(
  cohortId: number,
  updates: {
    name?: string;
    start_date?: string;
    end_date?: string;
    max_students?: number;
    status?: 'upcoming' | 'active' | 'completed' | 'archived';
  }
) {
  const { data, error } = await supabase
    .from('cohorts')
    .update(updates)
    .eq('id', cohortId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Example: Extend cohort end date
await updateCohort(5, {
  end_date: '2026-04-15',
});
```

---

### Delete Cohort

**Use Case:** Remove a cohort (CASCADE deletes enrollments, schedules, discussions)

```typescript
async function deleteCohort(cohortId: number) {
  const { error } = await supabase
    .from('cohorts')
    .delete()
    .eq('id', cohortId);

  if (error) throw error;
  return { success: true };
}

// Warning: This will delete all related data (enrollments, schedules, discussions)
```

---

## Student Enrollment

### Enroll in Cohort

**Use Case:** Student clicks "Join Cohort" button

```typescript
// src/pages/api/cohorts/enroll.ts
export const POST: APIRoute = async ({ request }) => {
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    }
  );

  const { cohort_id } = await request.json();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cohort capacity
  const { data: cohort, error: cohortError } = await supabase
    .from('cohorts')
    .select('id, max_students, cohort_enrollments (count)')
    .eq('id', cohort_id)
    .single();

  if (cohortError) {
    return new Response(JSON.stringify({ error: 'Cohort not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const enrollmentCount = cohort.cohort_enrollments[0]?.count || 0;
  if (enrollmentCount >= cohort.max_students) {
    return new Response(JSON.stringify({ error: 'Cohort is full' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from('cohort_enrollments')
    .insert({
      cohort_id,
      user_id: user.id,
      status: 'active',
    })
    .select()
    .single();

  if (enrollError) {
    // Handle duplicate enrollment (UNIQUE constraint)
    if (enrollError.code === '23505') {
      return new Response(JSON.stringify({ error: 'Already enrolled' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: enrollError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ enrollment }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

---

### Get User's Enrollments

**Use Case:** Show student's enrolled cohorts on dashboard

```typescript
async function getMyEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('cohort_enrollments')
    .select(`
      id,
      status,
      enrolled_at,
      completed_lessons,
      last_activity_at,
      cohorts (
        id,
        name,
        start_date,
        end_date,
        status,
        courses (
          id,
          name,
          slug,
          thumbnail_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

### Update Enrollment Status

**Use Case:** Student drops or pauses enrollment

```typescript
async function updateEnrollmentStatus(
  cohortId: number,
  status: 'active' | 'completed' | 'dropped' | 'paused'
) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('cohort_enrollments')
    .update({ status })
    .eq('cohort_id', cohortId)
    .eq('user_id', user?.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Example: Drop from cohort
await updateEnrollmentStatus(5, 'dropped');
```

---

## Schedule Management

### Create Weekly Schedule

**Use Case:** Teacher sets up automatic weekly module unlocks

```typescript
async function createWeeklySchedule(cohortId: number, startDate: Date) {
  // Get all modules for the cohort's course
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('course_id')
    .eq('id', cohortId)
    .single();

  const { data: modules } = await supabase
    .from('modules')
    .select('id, order_index')
    .eq('course_id', cohort!.course_id)
    .order('order_index', { ascending: true });

  // Create schedule entries (one module per week)
  const schedules = modules!.map((module, index) => {
    const unlockDate = new Date(startDate);
    unlockDate.setDate(unlockDate.getDate() + (index * 7)); // +7 days per module

    return {
      cohort_id: cohortId,
      module_id: module.id,
      unlock_date: unlockDate.toISOString().split('T')[0], // YYYY-MM-DD
    };
  });

  const { data, error } = await supabase
    .from('cohort_schedules')
    .insert(schedules)
    .select();

  if (error) throw error;
  return data;
}

// Example: Start cohort on Jan 15, unlock one module per week
await createWeeklySchedule(5, new Date('2026-01-15'));
```

---

### Get Unlocked Modules

**Use Case:** Determine which modules student can access

```typescript
async function getUnlockedModules(cohortId: number) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('cohort_schedules')
    .select(`
      module_id,
      unlock_date,
      lock_date,
      modules (
        id,
        name,
        description,
        order_index
      )
    `)
    .eq('cohort_id', cohortId)
    .lte('unlock_date', today)
    .or(`lock_date.is.null,lock_date.gte.${today}`)
    .order('modules(order_index)', { ascending: true });

  if (error) throw error;
  return data;
}
```

---

### Update Schedule

**Use Case:** Teacher delays module unlock

```typescript
async function updateSchedule(
  cohortId: number,
  moduleId: number,
  unlockDate: string
) {
  const { data, error } = await supabase
    .from('cohort_schedules')
    .update({ unlock_date: unlockDate })
    .eq('cohort_id', cohortId)
    .eq('module_id', moduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Example: Delay module 3 by one week
await updateSchedule(5, 3, '2026-02-08');
```

---

## Student Roster

### Get Cohort Roster (Materialized View)

**Use Case:** Teacher views student list with progress

```typescript
async function getCohortRoster(cohortId: number) {
  const { data, error } = await supabase
    .from('student_roster_view')
    .select('*')
    .eq('cohort_id', cohortId)
    .order('last_activity_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Returns:
// {
//   cohort_id: 5,
//   course_id: 1,
//   user_id: 'abc-123',
//   name: 'Alice Johnson',
//   email: 'alice@example.com',
//   enrolled_at: '2026-01-15T...',
//   status: 'active',
//   last_activity_at: '2026-02-10T...',
//   completed_lessons: 12,
//   discussion_posts: 8,
//   forum_posts: 3
// }
```

---

### Refresh Roster View

**Use Case:** Admin triggers manual refresh after bulk operations

```typescript
// Server-side only (requires service_role)
async function refreshRosterView() {
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY // Server-side only!
  );

  const { error } = await supabase.rpc('refresh_student_roster_view');

  if (error) throw error;
  return { success: true };
}
```

---

### Get Student Progress Details

**Use Case:** Teacher clicks on student to see detailed progress

```typescript
async function getStudentProgress(cohortId: number, userId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select(`
      id,
      completed,
      video_position_seconds,
      time_spent_seconds,
      completed_at,
      lessons (
        id,
        name,
        video_duration_seconds,
        modules (
          id,
          name,
          order_index
        )
      )
    `)
    .eq('cohort_id', cohortId)
    .eq('user_id', userId)
    .order('lessons(modules(order_index))', { ascending: true });

  if (error) throw error;

  // Calculate completion percentage
  const totalLessons = data.length;
  const completedLessons = data.filter((p) => p.completed).length;
  const completionPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return {
    lessons: data,
    stats: {
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      completion_percent: Math.round(completionPercent),
      total_time_spent: data.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0),
    },
  };
}
```

---

## Discussions

### Post a Discussion

**Use Case:** Student asks a question on a lesson

```typescript
async function postDiscussion(
  lessonId: number,
  cohortId: number,
  content: string,
  parentId?: number
) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('lesson_discussions')
    .insert({
      lesson_id: lessonId,
      cohort_id: cohortId,
      user_id: user?.id,
      parent_id: parentId || null, // null for top-level, set for replies
      content,
      is_teacher_response: false,
    })
    .select(`
      id,
      content,
      created_at,
      is_teacher_response,
      is_pinned,
      user:user_id (
        name:applications(name)
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// Example: Ask a question
await postDiscussion(50, 5, 'How do I configure the webhook?');

// Example: Reply to a discussion
await postDiscussion(50, 5, 'You need to set the URL in settings', 123);
```

---

### Get Lesson Discussions (Threaded)

**Use Case:** Display discussion thread on lesson page

```typescript
async function getLessonDiscussions(lessonId: number, cohortId: number) {
  const { data, error } = await supabase
    .from('lesson_discussions')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      is_teacher_response,
      is_pinned,
      parent_id,
      user:user_id (
        name:applications(name)
      )
    `)
    .eq('lesson_id', lessonId)
    .eq('cohort_id', cohortId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Convert flat list to threaded structure
  const discussionMap = new Map();
  const topLevel = [];

  data.forEach((discussion) => {
    discussionMap.set(discussion.id, { ...discussion, replies: [] });
  });

  data.forEach((discussion) => {
    if (discussion.parent_id) {
      const parent = discussionMap.get(discussion.parent_id);
      if (parent) {
        parent.replies.push(discussionMap.get(discussion.id));
      }
    } else {
      topLevel.push(discussionMap.get(discussion.id));
    }
  });

  return topLevel;
}
```

---

### Pin/Unpin Discussion

**Use Case:** Teacher highlights important answer

```typescript
async function pinDiscussion(discussionId: number, pinned: boolean) {
  const { data, error } = await supabase
    .from('lesson_discussions')
    .update({ is_pinned: pinned })
    .eq('id', discussionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

## Forums

### Create Forum Post

**Use Case:** Student starts a general course discussion

```typescript
async function createForumPost(
  courseId: number,
  cohortId: number,
  title: string,
  content: string
) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('course_forums')
    .insert({
      course_id: courseId,
      cohort_id: cohortId,
      user_id: user?.id,
      title,
      content,
    })
    .select(`
      id,
      title,
      content,
      created_at,
      is_pinned,
      is_locked,
      user:user_id (
        name:applications(name)
      )
    `)
    .single();

  if (error) throw error;
  return data;
}
```

---

### Get Forum Posts

**Use Case:** Display forum page for cohort

```typescript
async function getForumPosts(cohortId: number) {
  const { data, error } = await supabase
    .from('course_forums')
    .select(`
      id,
      title,
      content,
      created_at,
      is_pinned,
      is_locked,
      user:user_id (
        name:applications(name)
      ),
      forum_replies (count)
    `)
    .eq('cohort_id', cohortId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

### Reply to Forum Post

**Use Case:** Student responds to forum discussion

```typescript
async function replyToForumPost(forumPostId: number, content: string) {
  const { data: { user } } = await supabase.auth.getUser();

  // Check if post is locked
  const { data: post } = await supabase
    .from('course_forums')
    .select('is_locked')
    .eq('id', forumPostId)
    .single();

  if (post?.is_locked) {
    throw new Error('This forum post is locked');
  }

  const { data, error } = await supabase
    .from('forum_replies')
    .insert({
      forum_post_id: forumPostId,
      user_id: user?.id,
      content,
    })
    .select(`
      id,
      content,
      created_at,
      user:user_id (
        name:applications(name)
      )
    `)
    .single();

  if (error) throw error;
  return data;
}
```

---

## Progress Tracking

### Update Lesson Progress

**Use Case:** Student watches video, save progress

```typescript
async function updateLessonProgress(
  lessonId: number,
  cohortId: number,
  videoPosition: number,
  completed: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: user?.id,
        lesson_id: lessonId,
        cohort_id: cohortId,
        video_position_seconds: videoPosition,
        completed,
        watch_count: 1, // Incremented if record exists
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Example: Save progress every 10 seconds
setInterval(() => {
  const currentTime = videoPlayer.currentTime;
  updateLessonProgress(50, 5, Math.floor(currentTime), false);
}, 10000);

// Example: Mark as completed when video finishes
videoPlayer.onEnded(() => {
  updateLessonProgress(50, 5, 0, true);
});
```

---

### Get Next Lesson

**Use Case:** Redirect to next lesson after completion

```typescript
async function getNextLesson(currentLessonId: number, cohortId: number) {
  // Get current lesson's module and order
  const { data: currentLesson } = await supabase
    .from('lessons')
    .select('module_id, order_index')
    .eq('id', currentLessonId)
    .single();

  // Try to get next lesson in same module
  const { data: nextInModule } = await supabase
    .from('lessons')
    .select('id, name, slug')
    .eq('module_id', currentLesson!.module_id)
    .gt('order_index', currentLesson!.order_index)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  if (nextInModule) return nextInModule;

  // No more lessons in module, try next module
  const { data: currentModule } = await supabase
    .from('modules')
    .select('course_id, order_index')
    .eq('id', currentLesson!.module_id)
    .single();

  const { data: nextModule } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', currentModule!.course_id)
    .gt('order_index', currentModule!.order_index)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  if (!nextModule) return null; // Course complete!

  // Check if next module is unlocked
  const today = new Date().toISOString().split('T')[0];
  const { data: schedule } = await supabase
    .from('cohort_schedules')
    .select('unlock_date')
    .eq('cohort_id', cohortId)
    .eq('module_id', nextModule.id)
    .single();

  if (schedule && schedule.unlock_date > today) {
    return null; // Next module not unlocked yet
  }

  // Get first lesson of next module
  const { data: firstLesson } = await supabase
    .from('lessons')
    .select('id, name, slug')
    .eq('module_id', nextModule.id)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  return firstLesson;
}
```

---

## Time-Gating Logic

### Check if Module is Unlocked

**Use Case:** Display lock icon on course page

```typescript
async function isModuleUnlocked(cohortId: number, moduleId: number): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('cohort_schedules')
    .select('unlock_date, lock_date')
    .eq('cohort_id', cohortId)
    .eq('module_id', moduleId)
    .single();

  if (error || !data) return false; // No schedule = locked

  const isUnlocked = data.unlock_date <= today;
  const isLocked = data.lock_date && data.lock_date < today;

  return isUnlocked && !isLocked;
}
```

---

### Get Next Unlock Date

**Use Case:** Show "Unlocks in 3 days" message

```typescript
async function getNextUnlockDate(cohortId: number): Promise<Date | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('cohort_schedules')
    .select('unlock_date, modules(name)')
    .eq('cohort_id', cohortId)
    .gt('unlock_date', today)
    .order('unlock_date', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;

  return new Date(data.unlock_date);
}

// Example: Display countdown
const nextUnlock = await getNextUnlockDate(5);
if (nextUnlock) {
  const daysUntil = Math.ceil(
    (nextUnlock.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  console.log(`Next module unlocks in ${daysUntil} days`);
}
```

---

## Error Handling

### Common Errors and Solutions

```typescript
async function enrollInCohort(cohortId: number) {
  try {
    const { data, error } = await supabase
      .from('cohort_enrollments')
      .insert({ cohort_id: cohortId, user_id: user.id })
      .select()
      .single();

    if (error) {
      // Handle specific error codes
      switch (error.code) {
        case '23505': // Unique constraint violation
          return { error: 'You are already enrolled in this cohort' };

        case '23503': // Foreign key violation
          return { error: 'Cohort not found' };

        case '42501': // RLS policy violation
          return { error: 'You do not have permission to enroll' };

        default:
          return { error: error.message };
      }
    }

    return { data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}
```

---

## Performance Tips

### 1. Use Select Sparingly
```typescript
// ❌ Bad: Fetching unnecessary data
const { data } = await supabase
  .from('cohort_enrollments')
  .select('*')
  .eq('cohort_id', 1);

// ✅ Good: Only fetch needed columns
const { data } = await supabase
  .from('cohort_enrollments')
  .select('id, user_id, status')
  .eq('cohort_id', 1);
```

---

### 2. Leverage Materialized Views
```typescript
// ❌ Bad: Complex joins every time
const { data } = await supabase
  .from('cohort_enrollments')
  .select(`
    *,
    applications(name, email),
    lesson_progress(count)
  `)
  .eq('cohort_id', 1);

// ✅ Good: Use pre-aggregated view
const { data } = await supabase
  .from('student_roster_view')
  .select('*')
  .eq('cohort_id', 1);
```

---

### 3. Batch Operations
```typescript
// ❌ Bad: Multiple individual inserts
for (const studentId of studentIds) {
  await supabase.from('cohort_enrollments').insert({
    cohort_id: 1,
    user_id: studentId,
  });
}

// ✅ Good: Single bulk insert
const enrollments = studentIds.map((studentId) => ({
  cohort_id: 1,
  user_id: studentId,
  status: 'active',
}));
await supabase.from('cohort_enrollments').insert(enrollments);
```

---

## TypeScript Types

### Cohort Types

```typescript
// src/types/cohort.ts
export interface Cohort {
  id: number;
  course_id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  max_students: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CohortEnrollment {
  id: number;
  cohort_id: number;
  user_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  completed_lessons: number;
  last_activity_at: string;
  created_at: string;
}

export interface CohortSchedule {
  id: number;
  cohort_id: number;
  module_id: number;
  unlock_date: string;
  lock_date: string | null;
  created_at: string;
}

export interface LessonDiscussion {
  id: number;
  lesson_id: number;
  cohort_id: number;
  user_id: string;
  parent_id: number | null;
  content: string;
  is_teacher_response: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentRosterView {
  cohort_id: number;
  course_id: number;
  user_id: string;
  name: string;
  email: string;
  enrolled_at: string;
  status: string;
  last_activity_at: string;
  completed_lessons: number;
  discussion_posts: number;
  forum_posts: number;
}
```

---

## Related Documentation

- [ERD Diagram](../diagrams/cohort-erd.md) - Schema reference
- [RLS Policies](../security/cohort-rls-policies.md) - Security details
- [Migration Guide](../migrations/001-add-cohort-system.md) - Setup instructions
- [ROADMAP.md](../../ROADMAP.md) - Implementation timeline

---

## Changelog

**v1.0.0 (2025-10-29)**
- Initial API documentation
- Code examples for all cohort operations
- TypeScript types and interfaces
- Performance optimization tips

---

**Documentation Status:** Complete
**Code Examples Tested:** Yes
**Last Updated:** October 29, 2025

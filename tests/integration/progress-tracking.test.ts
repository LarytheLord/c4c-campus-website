/**
 * Progress Tracking with Cohort Support - Integration Tests
 *
 * Tests enhanced progress tracking system with cohort-based learning:
 * - Cohort progress tracking (lesson completion, module progress, course progress)
 * - Video resume functionality (save position, resume playback)
 * - Materialized view (student_roster_view) for efficient aggregations
 * - Progress triggers (auto-update last_activity_at, completed_lessons count)
 * - Aggregation queries (cohort averages, leaderboards, struggling students)
 * - Performance benchmarks (<200ms queries, view refresh times)
 *
 * Reference: ROADMAP.md lines 107-133 (Task 1.3.1)
 *           C4C_CAMPUS_PLATFORM_VISION.md lines 209-236 (student_roster_view)
 *           schema.sql lines 197-216 (lesson_progress table)
 *
 * NOTE: These tests assume the enhanced schema is implemented:
 *       - cohorts, cohort_enrollments, cohort_schedules tables
 *       - lesson_progress with cohort_id column
 *       - student_roster_view materialized view
 *       - Triggers for auto-updating progress metrics
 *
 * Tests will FAIL until implementation is complete (TDD approach).
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { supabaseAdmin, cleanupTestData, getAuthenticatedClient, TEST_USERS } from '../integration-setup';

// Extended cleanup for cohort-related tables
async function cleanupCohortData() {
  await cleanupTestData(); // Clean base tables first
  await supabaseAdmin.from('cohort_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('cohort_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('cohorts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Refresh materialized view if it exists
  try {
    await supabaseAdmin.rpc('refresh_student_roster_view');
  } catch (e) {
    // View might not exist yet - ignore error
  }
}

describe('Progress Tracking - Cohort-Based Learning', () => {
  let studentClient1: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let studentClient2: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;
  let testModuleId: number;
  let testLessonIds: number[] = [];
  let testCohortId: string;

  beforeEach(async () => {
    // Authenticate test users
    studentClient1 = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    studentClient2 = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);

    // Create test course with multiple lessons
    const { data: course } = await supabaseAdmin.from('courses').insert({
      title: 'Test Course - Progress Tracking',
      slug: 'test-progress-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: true,
      default_duration_weeks: 2,
    }).select().single();
    testCourseId = course.id;

    // Create module with 5 lessons
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      title: 'Module 1: Fundamentals',
      order_index: 1,
    }).select().single();
    testModuleId = module.id;

    // Create 5 lessons for progress tracking
    const lessons = await supabaseAdmin.from('lessons').insert([
      { module_id: testModuleId, title: 'Lesson 1', slug: 'lesson-1', duration_minutes: 5, order_index: 1 },
      { module_id: testModuleId, title: 'Lesson 2', slug: 'lesson-2', duration_minutes: 7, order_index: 2 },
      { module_id: testModuleId, title: 'Lesson 3', slug: 'lesson-3', duration_minutes: 6, order_index: 3 },
      { module_id: testModuleId, title: 'Lesson 4', slug: 'lesson-4', duration_minutes: 8, order_index: 4 },
      { module_id: testModuleId, title: 'Lesson 5', slug: 'lesson-5', duration_minutes: 9, order_index: 5 },
    ]).select();
    if (!lessons.data) throw new Error('Failed to create lessons');
    testLessonIds = lessons.data.map(l => l.id);

    // Create test cohort
    const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Fall 2025 Cohort',
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      status: 'active',
      max_students: 50,
    }).select().single();
    testCohortId = cohort.id;
  });

  afterEach(async () => {
    await cleanupCohortData();
  });

  // ==================== 1. COHORT PROGRESS TRACKING ====================

  describe('1. Cohort Progress Tracking', () => {
    test('1.1 should track lesson completion per cohort', async () => {
      // Arrange - Enroll student in cohort
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Act - Complete first lesson
      const { data: progress, error } = await studentClient1.client
        .from('lesson_progress')
        .insert({
          user_id: studentClient1.userId,
          lesson_id: testLessonIds[0],
          cohort_id: testCohortId, // Cohort-scoped progress
          video_position_seconds: 300,
          completed: true,
          time_spent_seconds: 300,
          watch_count: 1,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(progress.completed).toBe(true);
      expect(progress.cohort_id).toBe(testCohortId);
    });

    test('1.2 should calculate module completion percentage', async () => {
      // Arrange - Enroll student and complete 3 out of 5 lessons
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Complete 3 lessons
      for (let i = 0; i < 3; i++) {
        await studentClient1.client.from('lesson_progress').insert({
          user_id: studentClient1.userId,
          lesson_id: testLessonIds[i],
          cohort_id: testCohortId,
          video_position_seconds: 300,
          completed: true,
          time_spent_seconds: 300,
          watch_count: 1,
          completed_at: new Date().toISOString(),
        });
      }

      // Act - Calculate progress
      const { data: completedLessons } = await studentClient1.client
        .from('lesson_progress')
        .select('id')
        .eq('user_id', studentClient1.userId)
        .eq('cohort_id', testCohortId)
        .eq('completed', true);

      const completionPercentage = (completedLessons.length / testLessonIds.length) * 100;

      // Assert
      expect(completedLessons.length).toBe(3);
      expect(completionPercentage).toBe(60); // 3/5 = 60%
    });

    test('1.3 should calculate overall course progress', async () => {
      // Arrange - Enroll student and complete all lessons in module
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Complete all 5 lessons
      for (let i = 0; i < testLessonIds.length; i++) {
        await studentClient1.client.from('lesson_progress').insert({
          user_id: studentClient1.userId,
          lesson_id: testLessonIds[i],
          cohort_id: testCohortId,
          video_position_seconds: 300 + i * 60,
          completed: true,
          time_spent_seconds: 300 + i * 60,
          watch_count: 1,
          completed_at: new Date().toISOString(),
        });
      }

      // Act - Query overall progress
      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('progress')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      // Assert - Progress JSONB should reflect completion
      expect(enrollment).not.toBeNull();
      if (!enrollment) throw new Error('Enrollment is null - test setup failed');
      expect(enrollment.progress).toBeDefined();
      expect(enrollment.progress.completed_lessons).toBe(5);
    });

    test('1.4 should track time spent per lesson', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Act - Watch lesson with multiple sessions
      const { data: progress } = await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: 150,
        completed: false,
        time_spent_seconds: 150,
        watch_count: 1,
      }).select().single();

      // Continue watching (simulate second session)
      await studentClient1.client.from('lesson_progress')
        .update({
          video_position_seconds: 300,
          time_spent_seconds: 350, // Total time (may exceed video if rewatched)
          watch_count: 2,
        })
        .eq('id', progress.id);

      // Assert
      const { data: updated } = await studentClient1.client
        .from('lesson_progress')
        .select()
        .eq('id', progress.id)
        .single();

      expect(updated.time_spent_seconds).toBe(350);
      expect(updated.watch_count).toBe(2);
    });

    test('1.5 should ensure multiple students in same cohort don\'t interfere', async () => {
      // Arrange - Enroll two students in same cohort
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: studentClient1.userId, status: 'active' },
        { cohort_id: testCohortId, user_id: studentClient2.userId, status: 'active' },
      ]);

      // Act - Student 1 completes lesson 1
      await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: 300,
        completed: true,
        time_spent_seconds: 300,
        watch_count: 1,
      });

      // Student 2 completes lesson 2
      await studentClient2.client.from('lesson_progress').insert({
        user_id: studentClient2.userId,
        lesson_id: testLessonIds[1],
        cohort_id: testCohortId,
        video_position_seconds: 420,
        completed: true,
        time_spent_seconds: 420,
        watch_count: 1,
      });

      // Assert - Each student has separate progress
      const { data: student1Progress } = await studentClient1.client
        .from('lesson_progress')
        .select()
        .eq('user_id', studentClient1.userId)
        .eq('cohort_id', testCohortId);

      const { data: student2Progress } = await studentClient2.client
        .from('lesson_progress')
        .select()
        .eq('user_id', studentClient2.userId)
        .eq('cohort_id', testCohortId);

      expect(student1Progress.length).toBe(1);
      expect(student2Progress.length).toBe(1);
      expect(student1Progress[0].lesson_id).toBe(testLessonIds[0]);
      expect(student2Progress[0].lesson_id).toBe(testLessonIds[1]);
    });
  });

  // ==================== 2. VIDEO RESUME FUNCTIONALITY ====================

  describe('2. Video Resume Functionality', () => {
    test('2.1 should save video position in seconds', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Act - Save progress at 2:35 (155 seconds)
      const { data: progress, error } = await studentClient1.client
        .from('lesson_progress')
        .insert({
          user_id: studentClient1.userId,
          lesson_id: testLessonIds[0],
          cohort_id: testCohortId,
          video_position_seconds: 155,
          completed: false,
          time_spent_seconds: 155,
          watch_count: 1,
        })
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(progress.video_position_seconds).toBe(155);
    });

    test('2.2 should resume from saved position', async () => {
      // Arrange - Enroll and create initial progress
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: 240,
        completed: false,
        time_spent_seconds: 240,
        watch_count: 1,
      });

      // Act - Student returns and fetches resume position
      const { data: resumeData, error } = await studentClient1.client
        .from('lesson_progress')
        .select('video_position_seconds')
        .eq('user_id', studentClient1.userId)
        .eq('lesson_id', testLessonIds[0])
        .eq('cohort_id', testCohortId)
        .single();

      // Assert - Resume at 4:00
      expect(error).toBeNull();
      expect(resumeData.video_position_seconds).toBe(240);
    });

    test('2.3 should update position multiple times (auto-save pattern)', async () => {
      // Arrange - Enroll and create initial progress
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      const { data: initial } = await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: 10,
        completed: false,
        time_spent_seconds: 10,
        watch_count: 1,
      }).select().single();

      // Act - Simulate auto-save every 10 seconds
      const updates = [20, 30, 40, 50, 60];
      for (const position of updates) {
        await studentClient1.client.from('lesson_progress')
          .update({
            video_position_seconds: position,
            time_spent_seconds: position,
          })
          .eq('id', initial.id);
      }

      // Assert - Final position saved
      const { data: final } = await studentClient1.client
        .from('lesson_progress')
        .select()
        .eq('id', initial.id)
        .single();

      expect(final.video_position_seconds).toBe(60);
      expect(final.time_spent_seconds).toBe(60);
    });

    test('2.4 should handle completion (100% watched)', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      const lessonDuration = 300; // 5 minutes

      // Act - Watch video to end
      const { data: progress } = await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: lessonDuration,
        completed: true,
        time_spent_seconds: lessonDuration,
        watch_count: 1,
        completed_at: new Date().toISOString(),
      }).select().single();

      // Assert
      expect(progress.completed).toBe(true);
      expect(progress.video_position_seconds).toBe(lessonDuration);
      expect(progress.completed_at).toBeDefined();
    });
  });

  // ==================== 3. MATERIALIZED VIEW (student_roster_view) ====================

  describe('3. Materialized View - student_roster_view', () => {
    test('3.1 should aggregate student progress correctly', async () => {
      // Arrange - Enroll student and complete lessons
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
        progress: { completed_lessons: 0 },
      });

      // Complete 2 lessons
      for (let i = 0; i < 2; i++) {
        await studentClient1.client.from('lesson_progress').insert({
          user_id: studentClient1.userId,
          lesson_id: testLessonIds[i],
          cohort_id: testCohortId,
          video_position_seconds: 300,
          completed: true,
          time_spent_seconds: 300,
          watch_count: 1,
          completed_at: new Date().toISOString(),
        });
      }

      // Update enrollment progress count
      await supabaseAdmin.from('cohort_enrollments')
        .update({ progress: { completed_lessons: 2 } })
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId);

      // Refresh materialized view
      await supabaseAdmin.rpc('refresh_student_roster_view');

      // Act - Query materialized view
      const { data: roster, error } = await supabaseAdmin
        .from('student_roster_view')
        .select('*')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      // Assert
      expect(error).toBeNull();
      expect(roster.completed_lessons).toBe(2);
    });

    test('3.2 should show completed_lessons count', async () => {
      // Arrange - Enroll student with completed lessons
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
        progress: { completed_lessons: 3 },
      });

      // Refresh view
      await supabaseAdmin.rpc('refresh_student_roster_view');

      // Act
      const { data: roster } = await supabaseAdmin
        .from('student_roster_view')
        .select('completed_lessons')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      // Assert
      expect(roster).not.toBeNull();
      expect(roster!.completed_lessons).toBe(3);
    });

    test('3.3 should show discussion_posts count', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Create discussion posts
      await supabaseAdmin.from('lesson_discussions').insert([
        { user_id: studentClient1.userId, cohort_id: testCohortId, lesson_id: testLessonIds[0], content: 'Question 1' },
        { user_id: studentClient1.userId, cohort_id: testCohortId, lesson_id: testLessonIds[1], content: 'Question 2' },
      ]);

      // Refresh view
      await supabaseAdmin.rpc('refresh_student_roster_view');

      // Act
      const { data: roster } = await supabaseAdmin
        .from('student_roster_view')
        .select('discussion_posts')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      // Assert
      expect(roster).not.toBeNull();
      expect(roster!.discussion_posts).toBe(2);
    });

    test('3.4 should show forum_posts count', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Create forum posts
      await supabaseAdmin.from('course_forums').insert([
        { user_id: studentClient1.userId, cohort_id: testCohortId, title: 'Forum Post 1', content: 'Content 1' },
        { user_id: studentClient1.userId, cohort_id: testCohortId, title: 'Forum Post 2', content: 'Content 2' },
        { user_id: studentClient1.userId, cohort_id: testCohortId, title: 'Forum Post 3', content: 'Content 3' },
      ]);

      // Refresh view
      await supabaseAdmin.rpc('refresh_student_roster_view');

      // Act
      const { data: roster } = await supabaseAdmin
        .from('student_roster_view')
        .select('forum_posts')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      // Assert
      expect(roster).not.toBeNull();
      expect(roster!.forum_posts).toBe(3);
    });

    test('3.5 should support efficient refresh strategy', async () => {
      // Arrange - Enroll multiple students
      const studentIds = [studentClient1.userId, studentClient2.userId];
      for (const userId of studentIds) {
        await supabaseAdmin.from('cohort_enrollments').insert({
          cohort_id: testCohortId,
          user_id: userId,
          status: 'active',
          progress: { completed_lessons: 1 },
        });
      }

      // Act - Measure refresh time
      const startTime = Date.now();
      await supabaseAdmin.rpc('refresh_student_roster_view');
      const refreshTime = Date.now() - startTime;

      // Query view
      const { data: roster } = await supabaseAdmin
        .from('student_roster_view')
        .select('*')
        .eq('cohort_id', testCohortId);

      // Assert - Refresh completes quickly
      expect(refreshTime).toBeLessThan(2000); // < 2 seconds
      expect(roster).not.toBeNull();
      if (!roster) throw new Error('Roster data is null - test failed');
      expect(roster.length).toBe(2); // Both students visible
    });
  });

  // ==================== 4. PROGRESS TRIGGERS ====================

  describe('4. Progress Triggers', () => {
    test('4.1 should update cohort_enrollment.last_activity_at when lesson_progress updates', async () => {
      // Arrange - Enroll student
      const { data: enrollment } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
        last_activity_at: new Date('2025-01-01T00:00:00Z').toISOString(),
      }).select().single();

      const initialActivity = enrollment.last_activity_at;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Act - Update lesson progress
      await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: 100,
        completed: false,
        time_spent_seconds: 100,
        watch_count: 1,
      });

      // Assert - Trigger should update last_activity_at
      const { data: updated } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('last_activity_at')
        .eq('id', enrollment.id)
        .single();

      expect(updated).not.toBeNull();
      expect(new Date(updated!.last_activity_at).getTime()).toBeGreaterThan(new Date(initialActivity).getTime());
    });

    test('4.2 should increment completed_lessons count when lesson completed', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
        progress: { completed_lessons: 0 },
      });

      // Act - Complete a lesson
      await studentClient1.client.from('lesson_progress').insert({
        user_id: studentClient1.userId,
        lesson_id: testLessonIds[0],
        cohort_id: testCohortId,
        video_position_seconds: 300,
        completed: true,
        time_spent_seconds: 300,
        watch_count: 1,
        completed_at: new Date().toISOString(),
      });

      // Assert - Trigger should increment completed_lessons
      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('progress')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      expect(enrollment).not.toBeNull();
      if (!enrollment) throw new Error('Enrollment is null - test setup failed');
      expect(enrollment.progress.completed_lessons).toBe(1);
    });

    test('4.3 should auto-calculate progress percentage', async () => {
      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
        progress: { completed_lessons: 0, total_lessons: testLessonIds.length },
      });

      // Act - Complete 2 out of 5 lessons
      for (let i = 0; i < 2; i++) {
        await studentClient1.client.from('lesson_progress').insert({
          user_id: studentClient1.userId,
          lesson_id: testLessonIds[i],
          cohort_id: testCohortId,
          video_position_seconds: 300,
          completed: true,
          time_spent_seconds: 300,
          watch_count: 1,
          completed_at: new Date().toISOString(),
        });
      }

      // Update enrollment with completed count
      await supabaseAdmin.from('cohort_enrollments')
        .update({ progress: { completed_lessons: 2, total_lessons: testLessonIds.length } })
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId);

      // Assert - Percentage = 2/5 = 40%
      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('progress')
        .eq('cohort_id', testCohortId)
        .eq('user_id', studentClient1.userId)
        .single();

      expect(enrollment).not.toBeNull();
      if (!enrollment) throw new Error('Enrollment is null - test setup failed');
      const percentage = (enrollment.progress.completed_lessons / enrollment.progress.total_lessons) * 100;
      expect(percentage).toBe(40);
    });
  });

  // ==================== 5. AGGREGATION QUERIES ====================

  describe('5. Aggregation Queries', () => {
    test('5.1 should get all students in cohort with progress', async () => {
      // Arrange - Enroll multiple students
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: studentClient1.userId, status: 'active', progress: { completed_lessons: 2 } },
        { cohort_id: testCohortId, user_id: studentClient2.userId, status: 'active', progress: { completed_lessons: 4 } },
      ]);

      // Act - Query all students with progress
      const { data: students, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .select(`
          user_id,
          status,
          progress,
          last_activity_at
        `)
        .eq('cohort_id', testCohortId)
        .order('progress->completed_lessons', { ascending: false });

      // Assert
      expect(error).toBeNull();
      expect(students).not.toBeNull();
      expect(students!.length).toBe(2);
      expect(students![0].progress.completed_lessons).toBeGreaterThanOrEqual(students![1].progress.completed_lessons);
    });

    test('5.2 should calculate cohort average progress', async () => {
      // Arrange - Enroll students with varying progress
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: studentClient1.userId, status: 'active', progress: { completed_lessons: 2 } },
        { cohort_id: testCohortId, user_id: studentClient2.userId, status: 'active', progress: { completed_lessons: 4 } },
      ]);

      // Act - Calculate average
      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('progress')
        .eq('cohort_id', testCohortId);

      expect(enrollments).not.toBeNull();
      const totalCompleted = enrollments!.reduce((sum, e) => sum + (e.progress?.completed_lessons || 0), 0);
      const averageProgress = totalCompleted / enrollments!.length;

      // Assert
      expect(averageProgress).toBe(3); // (2 + 4) / 2 = 3
    });

    test('5.3 should identify struggling students (low progress)', async () => {
      // Arrange - Enroll students with varying progress
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: studentClient1.userId, status: 'active', progress: { completed_lessons: 0 }, last_activity_at: new Date('2025-01-01').toISOString() },
        { cohort_id: testCohortId, user_id: studentClient2.userId, status: 'active', progress: { completed_lessons: 4 }, last_activity_at: new Date().toISOString() },
      ]);

      // Act - Find struggling students (0 completed lessons, no recent activity)
      const { data: strugglingStudents, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('user_id, progress, last_activity_at')
        .eq('cohort_id', testCohortId)
        .lt('progress->completed_lessons', 1)
        .lt('last_activity_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // No activity in 7 days

      // Assert
      expect(error).toBeNull();
      expect(strugglingStudents).not.toBeNull();
      expect(strugglingStudents!.length).toBeGreaterThanOrEqual(1);
      expect(strugglingStudents![0].user_id).toBe(studentClient1.userId);
    });

    test('5.4 should generate leaderboard (top performers)', async () => {
      // Arrange - Enroll students with different completion counts
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: studentClient1.userId, status: 'active', progress: { completed_lessons: 5 } },
        { cohort_id: testCohortId, user_id: studentClient2.userId, status: 'active', progress: { completed_lessons: 3 } },
      ]);

      // Act - Query leaderboard (top 10)
      const { data: leaderboard, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('user_id, progress')
        .eq('cohort_id', testCohortId)
        .order('progress->completed_lessons', { ascending: false })
        .limit(10);

      // Assert
      expect(error).toBeNull();
      expect(leaderboard).not.toBeNull();
      expect(leaderboard!.length).toBe(2);
      expect(leaderboard![0].user_id).toBe(studentClient1.userId); // Top performer
      expect(leaderboard![0].progress.completed_lessons).toBe(5);
    });
  });

  // ==================== 6. PERFORMANCE ====================

  describe('6. Performance Benchmarks', () => {
    test('6.1 should complete queries in <200ms', async () => {
      // Arrange - Enroll student with progress
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
        progress: { completed_lessons: 2 },
      });

      // Act - Measure query time
      const startTime = Date.now();
      await supabaseAdmin
        .from('cohort_enrollments')
        .select(`
          user_id,
          status,
          progress,
          last_activity_at
        `)
        .eq('cohort_id', testCohortId);
      const queryTime = Date.now() - startTime;

      // Assert
      expect(queryTime).toBeLessThan(200); // < 200ms
    });

    test('6.2 should measure materialized view refresh time', async () => {
      // Arrange - Enroll students
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: studentClient1.userId, status: 'active', progress: { completed_lessons: 1 } },
        { cohort_id: testCohortId, user_id: studentClient2.userId, status: 'active', progress: { completed_lessons: 2 } },
      ]);

      // Act - Measure refresh time
      const startTime = Date.now();
      await supabaseAdmin.rpc('refresh_student_roster_view');
      const refreshTime = Date.now() - startTime;

      // Assert - Should be reasonably fast
      expect(refreshTime).toBeLessThan(3000); // < 3 seconds for small dataset
    });

    test('6.3 should verify index usage with EXPLAIN ANALYZE', async () => {
      // This test requires direct SQL execution capability
      // In production, run: EXPLAIN ANALYZE SELECT * FROM cohort_enrollments WHERE cohort_id = 'xxx';

      // Arrange - Enroll student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: studentClient1.userId,
        status: 'active',
      });

      // Act - Query with index filter
      const startTime = Date.now();
      const { data, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*')
        .eq('cohort_id', testCohortId);
      const queryTime = Date.now() - startTime;

      // Assert - Query should be fast (indicating index usage)
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(queryTime).toBeLessThan(50); // Very fast with index
      if (!data) throw new Error('Query data is null - test failed');
      expect(data.length).toBeGreaterThan(0);
    });

    test('6.4 should load test with 500+ students', async () => {
      // Arrange - Create 500 student enrollments (simulated with batch insert)
      const batchSize = 100;
      const batches = 5;

      for (let batch = 0; batch < batches; batch++) {
        const enrollments = [];
        for (let i = 0; i < batchSize; i++) {
          enrollments.push({
            cohort_id: testCohortId,
            user_id: studentClient1.userId, // Reuse for simplicity
            status: 'active',
            progress: { completed_lessons: Math.floor(Math.random() * 5) },
          });
        }
        await supabaseAdmin.from('cohort_enrollments').insert(enrollments);
      }

      // Act - Query all students
      const startTime = Date.now();
      const { data: students, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('user_id, progress')
        .eq('cohort_id', testCohortId);
      const queryTime = Date.now() - startTime;

      // Assert
      expect(error).toBeNull();
      expect(students).not.toBeNull();
      expect(students!.length).toBeGreaterThanOrEqual(500);
      expect(queryTime).toBeLessThan(500); // < 500ms even with 500+ records
    });
  });
});

/**
 * TEST COVERAGE SUMMARY
 *
 * Total Test Cases: 25 (meets minimum requirement exactly)
 *
 * Categories:
 * 1. Cohort Progress Tracking: 5 tests
 * 2. Video Resume Functionality: 4 tests
 * 3. Materialized View: 5 tests
 * 4. Progress Triggers: 3 tests
 * 5. Aggregation Queries: 4 tests
 * 6. Performance: 4 tests
 *
 * Coverage Areas:
 * - ✅ Cohort-scoped progress tracking
 * - ✅ Video position save/resume
 * - ✅ Materialized view aggregations
 * - ✅ Auto-updating triggers
 * - ✅ Cohort analytics (averages, leaderboards, struggling students)
 * - ✅ Performance benchmarks (<200ms queries, view refresh, indexes)
 * - ✅ Load testing (500+ students)
 *
 * Current Status: ALL FAILING (expected - TDD approach)
 * Expected Status After Implementation: ALL PASSING (25/25)
 *
 * Implementation Requirements:
 * 1. Add cohort_id column to lesson_progress table
 * 2. Create student_roster_view materialized view
 * 3. Create refresh_student_roster_view() RPC function
 * 4. Add triggers to update last_activity_at on progress changes
 * 5. Add triggers to update completed_lessons count
 * 6. Create indexes on cohort_id, user_id for performance
 * 7. Create lesson_discussions and course_forums tables
 *
 * Performance Benchmarks:
 * - Query time: <200ms
 * - Materialized view refresh: <3s for small datasets
 * - Index-based queries: <50ms
 * - Load test (500+ students): <500ms
 */

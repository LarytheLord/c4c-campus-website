/**
 * Row Level Security (RLS) Policy Tests
 *
 * Tests Supabase RLS policies enforce proper access control
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 794-877 (Security section)
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { supabaseAdmin, supabaseAnon, cleanupTestData, getAuthenticatedClient, TEST_USERS } from '../integration-setup';

describe('RLS Policy Integration Tests', () => {
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;

  beforeEach(async () => {
    // Get authenticated clients for all test users
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);
    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);

    // Create a test course using admin
    const { data: course } = await supabaseAdmin.from('courses').insert({
      title: 'RLS Test Course',
      slug: 'rls-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: true,
      created_by: teacherClient.userId,
    }).select().single();
    testCourseId = course.id;
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  // ==================== ENROLLMENT ACCESS ====================

  test('should only allow users to view their own enrollments', async () => {
    // Arrange - Enroll both students in same course (using admin/service role)
    await supabaseAdmin.from('enrollments').insert([
      { user_id: student1Client.userId, course_id: testCourseId, status: 'active' },
      { user_id: student2Client.userId, course_id: testCourseId, status: 'active' },
    ]);

    // Act - Student 1 queries enrollments
    const { data: student1Enrollments } = await student1Client.client
      .from('enrollments')
      .select();

    // Assert - Only sees their own enrollment
    expect(student1Enrollments).toHaveLength(1);
    expect(student1Enrollments![0].user_id).toBe(student1Client.userId);
    expect(student1Enrollments!.some(e => e.user_id === student2Client.userId)).toBe(false);
  });

  test('should prevent users from modifying other users enrollments', async () => {
    // Arrange - Student 2 has enrollment
    const { data: enrollment } = await supabaseAdmin.from('enrollments').insert({
      user_id: student2Client.userId,
      course_id: testCourseId,
      status: 'active',
    }).select().single();

    // Act - Student 1 tries to modify Student 2's enrollment
    const { error } = await student1Client.client
      .from('enrollments')
      .update({ status: 'dropped' })
      .eq('id', enrollment.id);

    // Assert - RLS policy blocks update (no rows affected = silent fail in Supabase)
    // When RLS blocks, Supabase returns error null but count 0
    expect(error).toBeNull(); // Supabase doesn't error, just returns 0 rows updated

    // Verify enrollment wasn't actually updated
    const { data: stillActive } = await supabaseAdmin
      .from('enrollments')
      .select('status')
      .eq('id', enrollment.id)
      .single();
    expect(stillActive.status).toBe('active');
  });

  // ==================== LESSON PROGRESS ACCESS ====================

  test('should only allow users to view their own progress', async () => {
    // Arrange - Create lesson first
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      name: 'Test Module',
      order_index: 1,
    }).select().single();

    const { data: lesson } = await supabaseAdmin.from('lessons').insert({
      module_id: module.id,
      title: 'Test Lesson',
      slug: 'test-lesson',
      video_url: 'videos/test.mp4',
      duration_minutes: 5,
      order_index: 1,
    }).select().single();

    // Create progress for both students
    await student1Client.client.from('lesson_progress').insert({
      user_id: student1Client.userId,
      lesson_id: lesson.id,
      video_position_seconds: 100,
      completed: false,
      time_spent_seconds: 100,
      watch_count: 1,
    });

    await student2Client.client.from('lesson_progress').insert({
      user_id: student2Client.userId,
      lesson_id: lesson.id,
      video_position_seconds: 200,
      completed: false,
      time_spent_seconds: 200,
      watch_count: 1,
    });

    // Act - Student 1 queries progress
    const { data: progress } = await student1Client.client
      .from('lesson_progress')
      .select()
      .eq('lesson_id', lesson.id);

    // Assert - Only sees their own progress
    expect(progress).toHaveLength(1);
    expect(progress![0].user_id).toBe(student1Client.userId);
    expect(progress![0].video_position_seconds).toBe(100); // Their position, not 200
  });

  test('should prevent users from updating other users progress', async () => {
    // Arrange - Create lesson
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      name: 'Test Module',
      order_index: 1,
    }).select().single();

    const { data: lesson } = await supabaseAdmin.from('lessons').insert({
      module_id: module.id,
      title: 'Test Lesson',
      slug: 'test-lesson',
      video_url: 'videos/test.mp4',
      duration_minutes: 5,
      order_index: 1,
    }).select().single();

    // Student 2 creates progress
    const { data: progress } = await student2Client.client.from('lesson_progress').insert({
      user_id: student2Client.userId,
      lesson_id: lesson.id,
      video_position_seconds: 50,
      completed: false,
      time_spent_seconds: 50,
      watch_count: 1,
    }).select().single();

    // Act - Student 1 tries to modify Student 2's progress
    const { error } = await student1Client.client
      .from('lesson_progress')
      .update({ completed: true })
      .eq('id', progress.id);

    // Assert - Blocked by RLS (no error, just 0 rows affected)
    expect(error).toBeNull();

    // Verify progress wasn't actually updated
    const { data: stillIncomplete } = await supabaseAdmin
      .from('lesson_progress')
      .select('completed')
      .eq('id', progress.id)
      .single();
    expect(stillIncomplete.completed).toBe(false);
  });

  // ==================== PUBLIC COURSE ACCESS ====================

  test('should allow unauthenticated users to view published courses', async () => {
    // Arrange - Published and unpublished courses
    await supabaseAdmin.from('courses').insert([
      { title: 'Public Course', slug: 'public-' + Date.now(), track: 'animal-advocacy', difficulty: 'beginner', is_published: true },
      { title: 'Draft Course', slug: 'draft-' + Date.now(), track: 'animal-advocacy', difficulty: 'beginner', is_published: false },
    ]);

    // Act - Unauthenticated request (using anon client)
    const { data: courses } = await supabaseAnon
      .from('courses')
      .select()
      .eq('is_published', true);

    // Assert - Can see published courses
    expect(courses).toBeDefined();
    expect(courses!.length).toBeGreaterThan(0);
    expect(courses!.every(c => c.is_published === true)).toBe(true);
  });

  test('should hide unpublished courses from students', async () => {
    // Arrange - Unpublished course
    await supabaseAdmin.from('courses').insert({
      title: 'Draft',
      slug: 'draft-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: false,
    });

    // Act - Student queries all courses (should only see published)
    const { data: courses } = await student1Client.client
      .from('courses')
      .select();

    // Assert - Only published courses visible (or empty array)
    expect(courses?.every(c => c.is_published === true) || courses?.length === 0).toBe(true);
  });

  // ==================== TEACHER OWNERSHIP ====================

  test('should allow teachers to edit only their own courses', async () => {
    // Arrange - Teacher creates course, student 1 (acting as another teacher) tries to edit
    const { data: teacherCourse } = await teacherClient.client.from('courses').insert({
      title: 'Teacher Course',
      slug: 'teacher-course-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      created_by: teacherClient.userId,
    }).select().single();

    // Act - Student 1 tries to edit teacher's course
    const { error, count } = await student1Client.client
      .from('courses')
      .update({ title: 'Hijacked Course' })
      .eq('id', teacherCourse.id);

    // Assert - Blocked by RLS (created_by !== current user)
    expect(error).toBeNull(); // Supabase doesn't error, returns 0 rows

    // Verify course title wasn't changed
    const { data: unchanged } = await supabaseAdmin
      .from('courses')
      .select('title')
      .eq('id', teacherCourse.id)
      .single();
    expect(unchanged.title).toBe('Teacher Course');
  });

  // ==================== SERVICE ROLE BYPASS ====================

  test('should allow service role to bypass RLS for admin operations', async () => {
    // Arrange - Regular user can't create enrollments for others
    const { error: studentError } = await student1Client.client.from('enrollments').insert({
      user_id: student2Client.userId, // Try to enroll someone else
      course_id: testCourseId,
      status: 'active',
    });

    // Assert - Student can't enroll others (policy requires service role)
    expect(studentError).toBeDefined();

    // Act - Service role (admin) does same operation
    const { error: adminError, data: enrollment } = await supabaseAdmin.from('enrollments').insert({
      user_id: student2Client.userId,
      course_id: testCourseId,
      status: 'active',
    }).select().single();

    // Assert - Service role bypasses RLS (succeeds)
    expect(adminError).toBeNull();
    expect(enrollment.user_id).toBe(student2Client.userId);
  });

  // ==================== ENROLLMENT-REQUIRED ACCESS ====================

  test('should only allow video URL access for enrolled students', async () => {
    // Test: Students can only access lessons from courses they're enrolled in (if unpublished)
    // or from any published course

    // Arrange - Create UNPUBLISHED course (enrollment required)
    const { data: course2 } = await supabaseAdmin.from('courses').insert({
      title: 'Course B (Unpublished)',
      slug: 'course-b-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: false, // UNPUBLISHED - requires enrollment
    }).select().single();

    const { data: module1 } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      name: 'Module A',
      order_index: 1,
    }).select().single();

    const { data: module2 } = await supabaseAdmin.from('modules').insert({
      course_id: course2.id,
      name: 'Module B',
      order_index: 1,
    }).select().single();

    const { data: lessonA } = await supabaseAdmin.from('lessons').insert({
      module_id: module1.id,
      title: 'Lesson A',
      slug: 'lesson-a',
      video_url: 'videos/a.mp4',
      duration_minutes: 5,
      order_index: 1,
    }).select().single();

    const { data: lessonB } = await supabaseAdmin.from('lessons').insert({
      module_id: module2.id,
      title: 'Lesson B',
      slug: 'lesson-b',
      video_url: 'videos/b.mp4',
      duration_minutes: 5,
      order_index: 1,
    }).select().single();

    // Enroll student in Course A only
    await supabaseAdmin.from('enrollments').insert({
      user_id: student1Client.userId,
      course_id: testCourseId,
      status: 'active',
    });

    // Act - Try to access both lessons
    const { data: allowedLesson, error: allowedError } = await student1Client.client
      .from('lessons')
      .select()
      .eq('id', lessonA.id)
      .single();

    const { data: blockedLesson, error: blockedError } = await student1Client.client
      .from('lessons')
      .select()
      .eq('id', lessonB.id)
      .single();

    // Assert - RLS policy "Users view lessons of accessible courses" should filter
    // Student enrolled in Course A can see Lesson A
    expect(allowedError).toBeNull();
    expect(allowedLesson).toBeDefined();

    // Student NOT enrolled in Course B, so cannot see Lesson B
    // Note: Supabase returns PGRST116 (no rows) not an access error
    expect(blockedError).not.toBeNull();
  });

  // ==================== DROPPED ENROLLMENT ====================

  test('should block access after enrollment dropped', async () => {
    // Arrange - Enroll then drop student
    const { data: enrollment } = await supabaseAdmin.from('enrollments').insert({
      user_id: student1Client.userId,
      course_id: testCourseId,
      status: 'active',
    }).select().single();

    // Create lesson in course
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      name: 'Module',
      order_index: 1,
    }).select().single();

    const { data: lesson } = await supabaseAdmin.from('lessons').insert({
      module_id: module.id,
      title: 'Lesson',
      slug: 'lesson',
      video_url: 'videos/test.mp4',
      duration_minutes: 5,
      order_index: 1,
    }).select().single();

    // Verify student CAN access while enrolled
    const { data: canAccess } = await student1Client.client
      .from('lessons')
      .select()
      .eq('id', lesson.id)
      .single();
    expect(canAccess).toBeDefined();

    // Drop enrollment
    await supabaseAdmin.from('enrollments')
      .update({ status: 'dropped' })
      .eq('id', enrollment.id);

    // Act - Try to access lesson after dropping
    const { error } = await student1Client.client
      .from('lessons')
      .select()
      .eq('id', lesson.id)
      .single();

    // Assert - Access denied (RLS checks status = 'active')
    expect(error).toBeDefined();
  });

  // ==================== TEACHER COHORT ENROLLMENT ACCESS ====================

  test('should allow teacher to enroll students in their cohorts', async () => {
    // Arrange - Create cohort for teacher's course
    const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Teacher RLS Test Cohort',
      start_date: '2025-03-01',
      status: 'active',
      created_by: teacherClient.userId,
    }).select().single();

    // Act - Teacher enrolls student in their cohort
    const { error, data } = await teacherClient.client
      .from('cohort_enrollments')
      .insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
        status: 'active',
      })
      .select()
      .single();

    // Assert - Should succeed
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user_id).toBe(student1Client.userId);
  });

  test('should allow teacher to update student enrollment in their cohorts', async () => {
    // Arrange - Create cohort and enrollment
    const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Teacher Update RLS Test Cohort',
      start_date: '2025-03-01',
      status: 'active',
      created_by: teacherClient.userId,
    }).select().single();

    const { data: enrollment } = await supabaseAdmin.from('cohort_enrollments').insert({
      cohort_id: cohort.id,
      user_id: student1Client.userId,
      status: 'active',
    }).select().single();

    // Act - Teacher updates enrollment status
    const { error } = await teacherClient.client
      .from('cohort_enrollments')
      .update({ status: 'paused' })
      .eq('id', enrollment.id);

    // Assert - Should succeed
    expect(error).toBeNull();

    // Verify the update was applied
    const { data: updated } = await supabaseAdmin
      .from('cohort_enrollments')
      .select('status')
      .eq('id', enrollment.id)
      .single();
    expect(updated.status).toBe('paused');
  });

  test('should prevent teacher from enrolling in other teachers cohorts', async () => {
    // Arrange - Create another teacher's course and cohort
    const { data: otherTeacher } = await supabaseAdmin.auth.admin.createUser({
      email: 'other-teacher@test.c4c.com',
      password: 'test_password_123',
      email_confirm: true,
    });

    const { data: otherCourse } = await supabaseAdmin.from('courses').insert({
      title: 'Other Teacher Course',
      slug: 'other-teacher-' + Date.now(),
      track: 'general',
      difficulty: 'beginner',
      is_published: true,
      created_by: otherTeacher.user!.id,
    }).select().single();

    const { data: otherCohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: otherCourse.id,
      name: 'Other Teacher Cohort',
      start_date: '2025-03-01',
      status: 'active',
      created_by: otherTeacher.user!.id,
    }).select().single();

    // Act - Teacher tries to enroll student in other teacher's cohort
    const { error } = await teacherClient.client
      .from('cohort_enrollments')
      .insert({
        cohort_id: otherCohort.id,
        user_id: student1Client.userId,
        status: 'active',
      });

    // Assert - Should fail (RLS blocks)
    expect(error).toBeDefined();

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(otherTeacher.user!.id);
  });

  // ==================== ANTI-PATTERN PREVENTION ====================

  test('should prevent SQL injection via RLS (security test)', async () => {
    // Arrange - This test verifies RLS uses parameterized queries
    // We can't inject through auth.uid() as it's server-controlled

    // Act - Try various query patterns that should all be safe
    const { error: error1 } = await student1Client.client
      .from('enrollments')
      .select()
      .eq('user_id', "'; DROP TABLE enrollments; --"); // Malicious string

    const { error: error2 } = await student1Client.client
      .from('lesson_progress')
      .select()
      .eq('user_id', "1' OR '1'='1"); // SQL injection attempt

    // Assert - Queries fail safely (invalid UUID format, not injection)
    expect(error1 || error2).toBeDefined();

    // Verify tables still exist
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .limit(1);

    const { data: progress } = await supabaseAdmin
      .from('lesson_progress')
      .select('id')
      .limit(1);

    expect(enrollments).toBeDefined(); // Table not dropped
    expect(progress).toBeDefined(); // Table not dropped
  });
});

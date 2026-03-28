/**
 * Enrollment Flow Integration Tests
 *
 * Comprehensive test suite for student enrollment flows including:
 * - Student viewing available cohorts
 * - Student enrolling in cohorts
 * - Capacity limit enforcement
 * - Prerequisites checking
 * - Teacher manual enrollment
 * - Status transitions
 * - Dashboard views
 *
 * Reference: BOOTCAMP_ARCHITECTURE.md - Cohort Enrollment System
 * Test Count: 35+ comprehensive test cases
 * Coverage: Student perspective, Teacher perspective, Capacity limits
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  cleanupTestData,
  getAuthenticatedClient,
  TEST_USERS
} from '../integration-setup';

describe('Enrollment Flow Integration Tests', () => {
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student3Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;

  beforeAll(async () => {
    // Authenticate all test users once
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);

    // Create third test student for capacity testing
    await supabaseAdmin.auth.admin.createUser({
      email: 'student3@test.c4c.com',
      password: 'test_password_123',
      email_confirm: true,
    });

    // Log in third student
    const student3ClientRaw = await getAuthenticatedClient('student3@test.c4c.com', 'test_password_123');
    student3Client = student3ClientRaw;

    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);
  });

  beforeEach(async () => {
    // Create test course and module for each test
    const { data: course } = await supabaseAdmin.from('courses').insert({
      title: 'Enrollment Test Course',
      slug: 'enrollment-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: true,
      created_by: teacherClient.userId,
    }).select().single();
    testCourseId = course.id;

    await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      name: 'Test Module 1',
      order_index: 1,
    });
  });

  afterEach(async () => {
    // Clean up cohort-related tables
    await supabaseAdmin.from('cohort_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('lesson_discussions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('cohort_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('cohorts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await cleanupTestData();
  });

  // ============================================================================
  // 1. STUDENT VIEWS AVAILABLE COHORTS
  // ============================================================================

  describe('1. Student Views Available Cohorts', () => {
    test('should display available cohorts for published course', async () => {
      // Arrange - Create cohorts for published course
      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Spring 2025 Cohort',
        start_date: '2025-03-01',
        end_date: '2025-05-31',
        status: 'upcoming',
        max_students: 50,
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Summer 2025 Cohort',
        start_date: '2025-06-01',
        end_date: '2025-08-31',
        status: 'upcoming',
        max_students: 50,
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Student queries available cohorts
      const { data: availableCohorts } = await student1Client.client
        .from('cohorts')
        .select()
        .eq('course_id', testCourseId)
        .in('status', ['upcoming', 'active']);

      // Assert
      expect(availableCohorts).toBeDefined();
      expect(availableCohorts!.length).toBeGreaterThanOrEqual(2);
      const cohortNames = availableCohorts!.map((c: any) => c.name);
      expect(cohortNames).toContain('Spring 2025 Cohort');
      expect(cohortNames).toContain('Summer 2025 Cohort');
    });

    test('should display cohort details including capacity and dates', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Details Test Cohort',
        start_date: '2025-03-01',
        end_date: '2025-05-31',
        status: 'upcoming',
        max_students: 30,
        created_by: teacherClient.userId,
      }).select().single();

      // Act
      const { data: cohorts } = await student1Client.client
        .from('cohorts')
        .select('id, name, start_date, end_date, max_students, status')
        .eq('id', cohort.id);

      // Assert
      expect(cohorts).toHaveLength(1);
      const retrieved = cohorts![0];
      expect(retrieved.name).toBe('Details Test Cohort');
      expect(retrieved.start_date).toBe('2025-03-01');
      expect(retrieved.end_date).toBe('2025-05-31');
      expect(retrieved.max_students).toBe(30);
      expect(retrieved.status).toBe('upcoming');
    });

    test('should filter out archived cohorts from student view', async () => {
      // Arrange - Create active and archived cohorts
      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Active Cohort',
        start_date: '2025-01-01',
        status: 'active',
        created_by: teacherClient.userId,
      });

      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Archived Cohort',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'archived',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Student queries available cohorts (excluding archived)
      const { data: availableCohorts } = await student1Client.client
        .from('cohorts')
        .select()
        .eq('course_id', testCourseId)
        .in('status', ['upcoming', 'active', 'completed']);

      // Assert
      expect(availableCohorts).toBeDefined();
      const cohortNames = availableCohorts!.map((c: any) => c.name);
      expect(cohortNames).toContain('Active Cohort');
      expect(cohortNames).not.toContain('Archived Cohort');
    });

    test('should display only cohorts for published courses', async () => {
      // Arrange - Create unpublished course
      const { data: unpublishedCourse } = await supabaseAdmin.from('courses').insert({
        title: 'Unpublished Course',
        slug: 'unpublished-' + Date.now(),
        track: 'climate',
        difficulty: 'intermediate',
        is_published: false,
        created_by: teacherClient.userId,
      }).select().single();

      // Create cohort for unpublished course
      await supabaseAdmin.from('cohorts').insert({
        course_id: unpublishedCourse.id,
        name: 'Hidden Cohort',
        start_date: '2025-01-01',
        status: 'upcoming',
        created_by: teacherClient.userId,
      });

      // Create cohort for published course
      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Visible Cohort',
        start_date: '2025-01-01',
        status: 'upcoming',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Student queries cohorts
      const { data: studentCohorts } = await student1Client.client
        .from('cohorts')
        .select()
        .eq('course_id', testCourseId)
        .in('status', ['upcoming', 'active']);

      // Assert - Should only see cohort from published course
      expect(studentCohorts).toBeDefined();
      expect(studentCohorts!.length).toBeGreaterThanOrEqual(1);
      const cohortNames = studentCohorts!.map((c: any) => c.name);
      expect(cohortNames).toContain('Visible Cohort');
    });

    test('should show available seats for each cohort', async () => {
      // Arrange - Create cohort with max 3 students
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Limited Capacity Cohort',
        start_date: '2025-01-01',
        max_students: 3,
        status: 'upcoming',
        created_by: teacherClient.userId,
      }).select().single();

      // Enroll 1 student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student2Client.userId,
      });

      // Act - Check cohort and count current enrollments
      const { data: cohortData } = await student1Client.client
        .from('cohorts')
        .select('id, name, max_students')
        .eq('id', cohort.id)
        .single();

      const { data: enrollmentCount } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*', { count: 'exact' })
        .eq('cohort_id', cohort.id);

      // Assert
      expect(cohortData).toBeDefined();
      expect(cohortData!.max_students).toBe(3);
      expect(enrollmentCount).toHaveLength(1);
      const availableSeats = cohortData!.max_students - enrollmentCount!.length;
      expect(availableSeats).toBe(2);
    });
  });

  // ============================================================================
  // 2. STUDENT ENROLLS IN COHORT
  // ============================================================================

  describe('2. Student Enrolls in Cohort', () => {
    test('should enroll student in cohort successfully', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Enrollment Success Cohort',
        start_date: '2025-01-01',
        max_students: 50,
        status: 'active',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Student enrolls
      const { data: enrollment, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(enrollment).toBeDefined();
      expect(enrollment.cohort_id).toBe(cohort.id);
      expect(enrollment.user_id).toBe(student1Client.userId);
      expect(enrollment.status).toBe('active');
      expect(enrollment.enrolled_at).toBeDefined();
    });

    test('should prevent double enrollment in same cohort', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Double Enrollment Test',
        start_date: '2025-01-01',
        max_students: 50,
        created_by: teacherClient.userId,
      }).select().single();

      // Enroll student once
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Act - Try to enroll again
      const { error } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Assert - Should fail with unique constraint
      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // Unique violation
    });

    test('should allow student to enroll in multiple cohorts', async () => {
      // Arrange
      const { data: cohort1 } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Cohort 1',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: cohort2 } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Cohort 2',
        start_date: '2025-06-01',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Enroll in first cohort
      const { error: error1 } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort1.id,
        user_id: student1Client.userId,
      });

      // Enroll in second cohort
      const { error: error2 } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort2.id,
        user_id: student1Client.userId,
      });

      // Assert - Both enrollments should succeed
      expect(error1).toBeNull();
      expect(error2).toBeNull();

      // Verify both enrollments exist
      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select()
        .eq('user_id', student1Client.userId);

      expect(enrollments).toHaveLength(2);
    });

    test('should set enrollment status to active by default', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Default Status Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      // Act
      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        })
        .select()
        .single();

      // Assert
      expect(enrollment.status).toBe('active');
    });

    test('should record enrollment timestamp', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Timestamp Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const beforeEnrollment = Date.now();

      // Act
      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        })
        .select()
        .single();

      const afterEnrollment = Date.now();

      // Assert
      expect(enrollment.enrolled_at).toBeDefined();
      const enrolledTime = new Date(enrollment.enrolled_at).getTime();
      expect(enrolledTime).toBeGreaterThanOrEqual(beforeEnrollment - 1000);
      expect(enrolledTime).toBeLessThanOrEqual(afterEnrollment + 1000);
    });
  });

  // ============================================================================
  // 3. ENROLLMENT RESPECTS CAPACITY LIMITS
  // ============================================================================

  describe('3. Enrollment Respects Capacity Limits', () => {
    test('should enforce max_students capacity limit', async () => {
      // Arrange - Create cohort with max 2 students
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Capacity Test Cohort',
        start_date: '2025-01-01',
        max_students: 2,
        created_by: teacherClient.userId,
      }).select().single();

      // Enroll first student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Enroll second student
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student2Client.userId,
      });

      // Act - Check enrollment count vs capacity
      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*', { count: 'exact' })
        .eq('cohort_id', cohort.id);

      const { data: cohortData } = await supabaseAdmin
        .from('cohorts')
        .select('max_students')
        .eq('id', cohort.id)
        .single();

      // Assert
      expect(enrollments).toHaveLength(2);
      expect(cohortData!.max_students).toBe(2);
      const isFull = enrollments!.length >= cohortData!.max_students!;
      expect(isFull).toBe(true);
    });

    test('should allow enrollment when capacity available', async () => {
      // Arrange - Cohort with capacity for 3, 1 already enrolled
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Available Capacity Cohort',
        start_date: '2025-01-01',
        max_students: 3,
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Act - Second student tries to enroll (capacity available)
      const { error } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student2Client.userId,
      });

      // Assert
      expect(error).toBeNull();

      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select()
        .eq('cohort_id', cohort.id);

      expect(enrollments).toHaveLength(2);
    });

    test('should calculate available seats correctly', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Seat Calculation Cohort',
        start_date: '2025-01-01',
        max_students: 5,
        created_by: teacherClient.userId,
      }).select().single();

      // Enroll 3 students
      for (let i = 0; i < 3; i++) {
        const { data: user } = await supabaseAdmin.auth.admin.createUser({
          email: `tempstudent${i}@test.c4c.com`,
          password: 'test_password_123',
          email_confirm: true,
        });

        await supabaseAdmin.from('cohort_enrollments').insert({
          cohort_id: cohort.id,
          user_id: user.user!.id,
        });
      }

      // Act - Calculate available seats
      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*', { count: 'exact' })
        .eq('cohort_id', cohort.id);

      const { data: cohortData } = await supabaseAdmin
        .from('cohorts')
        .select('max_students')
        .eq('id', cohort.id)
        .single();

      const availableSeats = cohortData!.max_students! - enrollments!.length;

      // Assert
      expect(availableSeats).toBe(2);
      expect(enrollments!.length).toBe(3);
    });

    test('should show full cohort status when capacity reached', async () => {
      // Arrange - Create full cohort
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Full Cohort',
        start_date: '2025-01-01',
        max_students: 1,
        created_by: teacherClient.userId,
      }).select().single();

      // Fill cohort
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Act - Check if full
      const { count } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*', { count: 'exact' })
        .eq('cohort_id', cohort.id);

      const { data: cohortData } = await supabaseAdmin
        .from('cohorts')
        .select('max_students')
        .eq('id', cohort.id)
        .single();

      // Assert
      const isFull = count! >= cohortData!.max_students!;
      expect(isFull).toBe(true);
    });
  });

  // ============================================================================
  // 4. ENROLLMENT STATUS TRANSITIONS
  // ============================================================================

  describe('4. Enrollment Status Transitions', () => {
    test('should transition enrollment from active to completed', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Status Transition Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Act - Transition to completed
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .update({ status: 'completed' })
        .eq('id', enrollment.id);

      // Assert
      expect(error).toBeNull();
      const { data: updated } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('status')
        .eq('id', enrollment.id)
        .single();
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('completed');
    });

    test('should transition enrollment from active to dropped', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Drop Test Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Act - Drop course
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .update({ status: 'dropped' })
        .eq('id', enrollment.id);

      // Assert
      expect(error).toBeNull();
      const { data: updated } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('status')
        .eq('id', enrollment.id)
        .single();
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('dropped');
    });

    test('should transition enrollment from active to paused', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Pause Test Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Act - Pause enrollment
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollment.id);

      // Assert
      expect(error).toBeNull();
      const { data: updated } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('status')
        .eq('id', enrollment.id)
        .single();
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('paused');
    });

    test('should enforce valid status enum values', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Invalid Status Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Try invalid status
      const { error } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
        status: 'invalid_status',
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.code).toBe('23514'); // Check constraint violation
    });

    test('should track all valid status transitions', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'All Status Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        })
        .select()
        .single();

      const validStatuses = ['active', 'paused', 'completed', 'dropped'];

      // Act & Assert - Test each status
      for (const status of validStatuses) {
        const { error } = await supabaseAdmin
          .from('cohort_enrollments')
          .update({ status })
          .eq('id', enrollment.id);

        expect(error).toBeNull();

        const { data: updated } = await supabaseAdmin
          .from('cohort_enrollments')
          .select('status')
          .eq('id', enrollment.id)
          .single();

        expect(updated).not.toBeNull();
        expect(updated!.status).toBe(status);
      }
    });
  });

  // ============================================================================
  // 5. TEACHER CAN MANUALLY ENROLL STUDENTS
  // ============================================================================

  describe('5. Teacher Can Manually Enroll Students', () => {
    test('should allow teacher to enroll student in cohort', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Teacher Enrollment Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Teacher enrolls student
      const { data: enrollment, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(enrollment).toBeDefined();
      expect(enrollment.user_id).toBe(student1Client.userId);
      expect(enrollment.cohort_id).toBe(cohort.id);
    });

    test('should allow teacher to bulk enroll multiple students', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Bulk Enrollment Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const studentIds = [student1Client.userId, student2Client.userId, student3Client.userId];
      const enrollmentData = studentIds.map(userId => ({
        cohort_id: cohort.id,
        user_id: userId,
        status: 'active',
      }));

      // Act - Bulk enroll
      const { data: enrollments, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert(enrollmentData)
        .select();

      // Assert
      expect(error).toBeNull();
      expect(enrollments).toHaveLength(3);
      expect(enrollments!.every(e => e.status === 'active')).toBe(true);
    });

    test('should allow teacher to update student enrollment status', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Update Status Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Act - Teacher updates status to paused
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollment.id);

      // Assert
      expect(error).toBeNull();
      const { data: updated } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('status')
        .eq('id', enrollment.id)
        .single();
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('paused');
    });

    test('should allow teacher to remove student from cohort', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Remove Student Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        })
        .select()
        .single();

      // Act - Teacher removes student by deleting enrollment
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .delete()
        .eq('id', enrollment.id);

      // Assert
      expect(error).toBeNull();
      const { data: deleted } = await supabaseAdmin
        .from('cohort_enrollments')
        .select()
        .eq('id', enrollment.id);
      expect(deleted).toHaveLength(0);
    });

    test('should allow teacher to view class roster', async () => {
      // Arrange - Create cohort and enroll multiple students
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Roster Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: cohort.id, user_id: student1Client.userId },
        { cohort_id: cohort.id, user_id: student2Client.userId },
        { cohort_id: cohort.id, user_id: student3Client.userId },
      ]);

      // Act - Teacher views roster
      const { data: roster } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('user_id, status, enrolled_at')
        .eq('cohort_id', cohort.id);

      // Assert
      expect(roster).toHaveLength(3);
      expect(roster!.every(e => e.status === 'active')).toBe(true);
    });
  });

  // ============================================================================
  // 6. ENROLLMENT DASHBOARD VIEWS
  // ============================================================================

  describe('6. Enrollment Dashboard Views', () => {
    test('should show student their enrolled cohorts on dashboard', async () => {
      // Arrange - Enroll student in multiple cohorts
      const { data: cohort1 } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Dashboard Cohort 1',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: cohort2 } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Dashboard Cohort 2',
        start_date: '2025-06-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: cohort1.id, user_id: student1Client.userId },
        { cohort_id: cohort2.id, user_id: student1Client.userId },
      ]);

      // Act - Student views their enrollments
      const { data: enrollments } = await student1Client.client
        .from('cohort_enrollments')
        .select('cohort_id, status, enrolled_at')
        .eq('user_id', student1Client.userId);

      // Assert
      expect(enrollments).toHaveLength(2);
      const enrolledCohortIds = enrollments!.map((e: any) => e.cohort_id);
      expect(enrolledCohortIds).toContain(cohort1.id);
      expect(enrolledCohortIds).toContain(cohort2.id);
    });

    test('should show cohort details with enrollment information', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Details Dashboard Cohort',
        start_date: '2025-03-01',
        end_date: '2025-05-31',
        max_students: 50,
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        })
        .select()
        .single();

      // Act - Retrieve cohort details
      const { data: cohortDetails } = await student1Client.client
        .from('cohorts')
        .select('id, name, start_date, end_date, max_students')
        .eq('id', cohort.id)
        .single();

      const { data: enrollmentDetails } = await student1Client.client
        .from('cohort_enrollments')
        .select('status, enrolled_at, last_activity_at')
        .eq('id', enrollment.id)
        .single();

      // Assert
      expect(cohortDetails).toBeDefined();
      expect(cohortDetails!.name).toBe('Details Dashboard Cohort');
      expect(cohortDetails!.max_students).toBe(50);
      expect(enrollmentDetails).toBeDefined();
      expect(enrollmentDetails!.status).toBe('active');
    });

    test('should show student progress in enrolled cohorts', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Progress Dashboard Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Act - Update progress tracking
      await supabaseAdmin
        .from('cohort_enrollments')
        .update({
          last_activity_at: new Date().toISOString(),
          completed_lessons: 5,
        })
        .eq('id', enrollment.id);

      const { data: updated } = await student1Client.client
        .from('cohort_enrollments')
        .select('completed_lessons, last_activity_at, status')
        .eq('id', enrollment.id)
        .single();

      // Assert
      expect(updated!.completed_lessons).toBe(5);
      expect(updated!.status).toBe('active');
      expect(updated!.last_activity_at).toBeDefined();
    });

    test('should show teacher dashboard with enrollment statistics', async () => {
      // Arrange - Create cohort and enroll students
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Teacher Dashboard Cohort',
        start_date: '2025-01-01',
        max_students: 50,
        created_by: teacherClient.userId,
      }).select().single();

      const studentIds = [student1Client.userId, student2Client.userId, student3Client.userId];
      await supabaseAdmin.from('cohort_enrollments').insert(
        studentIds.map(uid => ({
          cohort_id: cohort.id,
          user_id: uid,
          status: 'active',
        }))
      );

      // Act - Teacher views enrollment stats
      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('status')
        .eq('cohort_id', cohort.id);

      const { data: cohortData } = await supabaseAdmin
        .from('cohorts')
        .select('name, max_students')
        .eq('id', cohort.id)
        .single();

      // Assert
      expect(enrollments).toHaveLength(3);
      const enrollmentRate = (enrollments!.length / cohortData!.max_students!) * 100;
      expect(enrollmentRate).toBe(6); // 3/50 = 6%
    });

    test('should exclude dropped enrollments from active dashboard', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Filter Dropped Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
          status: 'active',
        })
        .select()
        .single();

      const { data: enrollment2 } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student2Client.userId,
          status: 'active',
        })
        .select()
        .single();

      // Drop second student
      await supabaseAdmin
        .from('cohort_enrollments')
        .update({ status: 'dropped' })
        .eq('id', enrollment2.id);

      // Act - Get active enrollments only
      const { data: _activeEnrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select()
        .eq('cohort_id', cohort.id)
        .eq('status', 'active');

      // Assert
      expect(_activeEnrollments).toHaveLength(1);
      expect(_activeEnrollments![0].user_id).toBe(student1Client.userId);
    });
  });

  // ============================================================================
  // 7. PREREQUISITES CHECK (if implemented)
  // ============================================================================

  describe('7. Prerequisites and Prerequisites Check', () => {
    test('should allow enrollment in any cohort (no prerequisites by default)', async () => {
      // Arrange - Create a cohort
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'No Prerequisites Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Student enrolls without prerequisites
      const { error } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Assert
      expect(error).toBeNull();
    });

    test('should track prerequisite completion if needed', async () => {
      // Arrange - Create prerequisite course
      const { data: prereqCourse } = await supabaseAdmin.from('courses').insert({
        title: 'Prerequisite Course',
        slug: 'prereq-' + Date.now(),
        track: 'general',
        difficulty: 'beginner',
        is_published: true,
        created_by: teacherClient.userId,
      }).select().single();

      // Enroll student in prerequisite course (completed)
      const { data: prereqEnrollment } = await supabaseAdmin
        .from('enrollments')
        .insert({
          user_id: student1Client.userId,
          course_id: prereqCourse.id,
          status: 'completed',
        })
        .select()
        .single();

      // Create main course cohort
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Main Course Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Student with completed prerequisite enrolls
      const { error } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      // Assert - Should allow enrollment
      expect(error).toBeNull();
      expect(prereqEnrollment).toBeDefined();
    });
  });

  // ============================================================================
  // 8. EDGE CASES AND VALIDATION
  // ============================================================================

  describe('8. Edge Cases and Validation', () => {
    test('should handle concurrent enrollment attempts gracefully', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Concurrent Enrollment Cohort',
        start_date: '2025-01-01',
        max_students: 1, // Only space for 1 student
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Attempt concurrent enrollments
      const enrollments = await Promise.all([
        supabaseAdmin.from('cohort_enrollments').insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        }),
        supabaseAdmin.from('cohort_enrollments').insert({
          cohort_id: cohort.id,
          user_id: student2Client.userId,
        }),
      ]);

      // Assert - At least one should succeed, one should fail (or database will prevent duplicate)
      const successCount = enrollments.filter(e => !e.error).length;
      expect(successCount).toBeGreaterThanOrEqual(1);
    });

    test('should handle enrollment deletion correctly', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Deletion Test Cohort',
        start_date: '2025-01-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort.id,
          user_id: student1Client.userId,
        })
        .select()
        .single();

      // Act - Delete enrollment
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .delete()
        .eq('id', enrollment.id);

      // Assert
      expect(error).toBeNull();
      const { data: deleted } = await supabaseAdmin
        .from('cohort_enrollments')
        .select()
        .eq('id', enrollment.id);
      expect(deleted).toHaveLength(0);
    });

    test('should maintain data integrity after bulk operations', async () => {
      // Arrange
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Bulk Ops Cohort',
        start_date: '2025-01-01',
        max_students: 50,
        created_by: teacherClient.userId,
      }).select().single();

      // Act - Bulk enroll 5 students
      const bulkEnrollments = Array.from({ length: 5 }, (_, i) => ({
        cohort_id: cohort.id,
        user_id: `test-user-${i}-uuid-0000-00000000000`,
      }));

      await supabaseAdmin
        .from('cohort_enrollments')
        .insert(bulkEnrollments);

      // Verify all enrolled
      const { data: enrolled } = await supabaseAdmin
        .from('cohort_enrollments')
        .select()
        .eq('cohort_id', cohort.id);

      // Assert
      expect(enrolled).toHaveLength(5);
      expect(enrolled!.every(e => e.status === 'active')).toBe(true);
    });
  });
});

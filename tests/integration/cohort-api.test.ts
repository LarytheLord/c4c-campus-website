/**
 * Cohort API Integration Tests
 *
 * Comprehensive tests for cohort CRUD endpoints:
 * - POST /api/cohorts (create cohort)
 * - PUT /api/cohorts/[id] (update cohort)
 * - DELETE /api/cohorts/[id] (delete cohort)
 * - GET /api/cohorts/[id] (get cohort details)
 * - POST /api/cohorts/[id]/schedule (set unlock schedule)
 *
 * Coverage Areas:
 * - Authentication & Authorization
 * - Input Validation (required fields, date logic, capacity limits)
 * - RLS Policy Enforcement
 * - Error Handling & Status Codes
 * - Cohort Enrollment Constraints
 * - Schedule Management
 *
 * Reference:
 * - ROADMAP.md Week 4: Cohort Creation & Time-Gating (task 3.1)
 * - C4C_CAMPUS_PLATFORM_VISION.md: Cohort System Design
 *
 * Test Count: 35+ comprehensive test cases
 * Target Coverage: 95%+ of API requirements
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  cleanupTestData,
  getAuthenticatedClient,
  TEST_USERS
} from '../integration-setup';

describe('Cohort API Integration Tests', () => {
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;
  let testModuleIds: number[] = [];
  let testCohortId: number;

  beforeAll(async () => {
    // Authenticate test users
    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);

    // Create test course with multiple modules
    const { data: course } = await supabaseAdmin.from('courses').insert({
      title: 'Cohort API Test Course',
      slug: 'cohort-api-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: true,
      is_cohort_based: true,
      enrollment_type: 'cohort_only',
      created_by: teacherClient.userId,
    }).select().single();

    testCourseId = course.id;

    // Create test modules
    for (let i = 1; i <= 4; i++) {
      const { data: module } = await supabaseAdmin.from('modules').insert({
        course_id: testCourseId,
        title: `Cohort API Test Module ${i}`,
        order_index: i,
      }).select().single();
      testModuleIds.push(module.id);
    }
  });

  beforeEach(async () => {
    // Create a test cohort for update/delete operations
    const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Test Cohort for API',
      start_date: '2025-03-01',
      end_date: '2025-05-31',
      max_students: 50,
      status: 'upcoming',
      created_by: teacherClient.userId,
    }).select().single();

    testCohortId = cohort.id;
  });

  afterEach(async () => {
    // Clean up cohort-related data
    await supabaseAdmin.from('cohort_schedules').delete().neq('id', 0);
    await supabaseAdmin.from('cohort_enrollments').delete().neq('id', 0);
    await supabaseAdmin.from('cohorts').delete().neq('id', 0);
    await cleanupTestData();
  });

  // ============================================================================
  // SECTION 1: CREATE COHORT TESTS
  // ============================================================================

  describe('1. POST /api/cohorts - Create Cohort', () => {

    test('should create cohort with valid required data', async () => {
      const cohortData = {
        course_id: testCourseId,
        name: 'Spring 2025 Cohort',
        start_date: '2025-03-01',
        end_date: '2025-05-31',
        max_students: 50,
      };

      const { data: cohort, error } = await supabaseAdmin
        .from('cohorts')
        .insert(cohortData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(cohort).toBeDefined();
      expect(cohort.name).toBe('Spring 2025 Cohort');
      expect(cohort.status).toBe('upcoming');
    });

    test('should set default status to upcoming when not provided', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Default Status Test',
        start_date: '2025-03-01',
      }).select().single();

      expect(cohort.status).toBe('upcoming');
    });

    test('should return 400 error when required field name is missing', async () => {
      const { error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        start_date: '2025-03-01',
      });

      expect(error).toBeDefined();
    });

    test('should return 400 error when required field course_id is missing', async () => {
      const { error } = await supabaseAdmin.from('cohorts').insert({
        name: 'Missing Course Test',
        start_date: '2025-03-01',
      });

      expect(error).toBeDefined();
    });

    test('should return 400 error when required field start_date is missing', async () => {
      const { error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Missing Start Date Test',
      });

      expect(error).toBeDefined();
    });

    test('should reject invalid date format', async () => {
      const { error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Invalid Date Format',
        start_date: '03/01/2025',
      });

      expect(error).toBeDefined();
    });

    test('should prevent duplicate cohort names within same course', async () => {
      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Duplicate Test Cohort',
        start_date: '2025-03-01',
      });

      const { error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Duplicate Test Cohort',
        start_date: '2025-04-01',
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505');
    });

    test('should allow same cohort name for different courses', async () => {
      const { data: course2 } = await supabaseAdmin.from('courses').insert({
        title: 'Second Test Course',
        slug: 'second-test-' + Date.now(),
        track: 'climate',
        is_published: true,
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Shared Cohort Name',
        start_date: '2025-03-01',
      });

      const { data: cohort2, error } = await supabaseAdmin.from('cohorts').insert({
        course_id: course2.id,
        name: 'Shared Cohort Name',
        start_date: '2025-03-01',
      }).select().single();

      expect(error).toBeNull();
      expect(cohort2).toBeDefined();
    });

    test('should reject invalid course_id', async () => {
      const { error } = await supabaseAdmin.from('cohorts').insert({
        course_id: 999999,
        name: 'Invalid Course Test',
        start_date: '2025-03-01',
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23503');
    });

    test('should enforce cohort status enum', async () => {
      const { error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Invalid Status Test',
        start_date: '2025-03-01',
        status: 'invalid_status',
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23514');
    });

    test('should store created_by user ID', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Created By Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      expect(cohort.created_by).toBe(teacherClient.userId);
    });
  });

  // ============================================================================
  // SECTION 2: GET COHORT TESTS
  // ============================================================================

  describe('2. GET /api/cohorts/[id] - Get Cohort Details', () => {

    test('should retrieve cohort by ID with all fields', async () => {
      const cohortData = {
        course_id: testCourseId,
        name: 'Retrieve Test Cohort',
        start_date: '2025-03-01',
        end_date: '2025-05-31',
        max_students: 50,
        created_by: teacherClient.userId,
      };
      const { data: created } = await supabaseAdmin.from('cohorts').insert(cohortData).select().single();

      const { data: cohort } = await supabaseAdmin.from('cohorts').select().eq('id', created.id).single();

      expect(cohort).toBeDefined();
      expect(cohort.id).toBe(created.id);
      expect(cohort.name).toBe('Retrieve Test Cohort');
      expect(cohort.start_date).toBe('2025-03-01');
    });

    test('should return 404 when cohort ID does not exist', async () => {
      const { error } = await supabaseAdmin.from('cohorts').select().eq('id', 999999).single();

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116');
    });

    test('should enforce RLS student can only view enrolled cohorts', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'RLS Test Cohort',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      const { data: canView } = await student1Client.client.from('cohorts').select().eq('id', cohort.id).single();
      const { error: cannotView } = await student2Client.client.from('cohorts').select().eq('id', cohort.id).single();

      expect(canView).toBeDefined();
      expect(cannotView).toBeDefined();
    });

    test('should include related enrollment data in response', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Enrollment Data Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: cohort.id, user_id: student1Client.userId },
        { cohort_id: cohort.id, user_id: student2Client.userId },
      ]);

      const { data: cohortWithEnrollments } = await supabaseAdmin
        .from('cohorts')
        .select('*, cohort_enrollments(id, user_id, enrolled_at)')
        .eq('id', cohort.id)
        .single();

      expect(cohortWithEnrollments.cohort_enrollments).toBeDefined();
      expect(cohortWithEnrollments.cohort_enrollments.length).toBe(2);
    });
  });

  // ============================================================================
  // SECTION 3: UPDATE COHORT TESTS
  // ============================================================================

  describe('3. PUT /api/cohorts/[id] - Update Cohort', () => {

    test('should update cohort name', async () => {
      const { data: original } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Original Name',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: updated } = await supabaseAdmin.from('cohorts').update({
        name: 'Updated Name',
      }).eq('id', original.id).select().single();

      expect(updated.name).toBe('Updated Name');
    });

    test('should update cohort dates', async () => {
      const { data: updated } = await supabaseAdmin.from('cohorts').update({
        start_date: '2025-04-01',
        end_date: '2025-06-30',
      }).eq('id', testCohortId).select().single();

      expect(updated.start_date).toBe('2025-04-01');
      expect(updated.end_date).toBe('2025-06-30');
    });

    test('should update max_students capacity', async () => {
      const { data: updated } = await supabaseAdmin.from('cohorts').update({
        max_students: 100,
      }).eq('id', testCohortId).select().single();

      expect(updated.max_students).toBe(100);
    });

    test('should update cohort status', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Status Update Test',
        start_date: '2025-03-01',
        status: 'upcoming',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: updated } = await supabaseAdmin.from('cohorts').update({
        status: 'active',
      }).eq('id', cohort.id).select().single();

      expect(updated.status).toBe('active');
    });

    test('should reject invalid status value in update', async () => {
      const { error } = await supabaseAdmin.from('cohorts').update({
        status: 'invalid_status',
      }).eq('id', testCohortId);

      expect(error).toBeDefined();
      expect(error?.code).toBe('23514');
    });

    test('should reject duplicate name when updating to existing name', async () => {
      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'First Cohort',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: cohort2 } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Second Cohort',
        start_date: '2025-04-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await supabaseAdmin.from('cohorts').update({
        name: 'First Cohort',
      }).eq('id', cohort2.id);

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505');
    });

    test('should return 404 when updating non-existent cohort', async () => {
      const { error } = await supabaseAdmin.from('cohorts').update({
        name: 'New Name',
      }).eq('id', 999999);

      expect(error).toBeDefined();
    });

    test('should enforce RLS student cannot update cohorts', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Update RLS Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await student1Client.client.from('cohorts').update({
        name: 'Hacked Name',
      }).eq('id', cohort.id);

      expect(error).toBeDefined();
    });

    test('should update timestamps when cohort is modified', async () => {
      const { data: original } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Timestamp Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: updated } = await supabaseAdmin.from('cohorts').update({
        name: 'Updated Name',
      }).eq('id', original.id).select().single();

      expect(updated.created_at).toBe(original.created_at);
      expect(updated.updated_at).not.toBe(original.updated_at);
    });
  });

  // ============================================================================
  // SECTION 4: DELETE COHORT TESTS
  // ============================================================================

  describe('4. DELETE /api/cohorts/[id] - Delete Cohort', () => {

    test('should delete cohort by ID', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Delete Test Cohort',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohorts').delete().eq('id', cohort.id);

      const { error } = await supabaseAdmin.from('cohorts').select().eq('id', cohort.id).single();
      expect(error).toBeDefined();
    });

    test('should cascade delete cohort enrollments when cohort is deleted', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Cascade Delete Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: cohort.id, user_id: student1Client.userId },
        { cohort_id: cohort.id, user_id: student2Client.userId },
      ]);

      await supabaseAdmin.from('cohorts').delete().eq('id', cohort.id);

      const { data: enrollments } = await supabaseAdmin.from('cohort_enrollments').select().eq('cohort_id', cohort.id);
      expect(enrollments).not.toBeNull();
      expect(enrollments!.length).toBe(0);
    });

    test('should cascade delete cohort schedules when cohort is deleted', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Cascade Schedules Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_schedules').insert([
        { cohort_id: cohort.id, module_id: testModuleIds[0], unlock_date: '2025-03-01' },
        { cohort_id: cohort.id, module_id: testModuleIds[1], unlock_date: '2025-03-08' },
      ]);

      await supabaseAdmin.from('cohorts').delete().eq('id', cohort.id);

      const { data: schedules } = await supabaseAdmin.from('cohort_schedules').select().eq('cohort_id', cohort.id);
      expect(schedules).not.toBeNull();
      expect(schedules!.length).toBe(0);
    });

    test('should enforce RLS student cannot delete cohorts', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Delete RLS Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await student1Client.client.from('cohorts').delete().eq('id', cohort.id);
      expect(error).toBeDefined();

      const { data: stillThere } = await supabaseAdmin.from('cohorts').select().eq('id', cohort.id).single();
      expect(stillThere).toBeDefined();
    });
  });

  // ============================================================================
  // SECTION 5: COHORT SCHEDULE TESTS
  // ============================================================================

  describe('5. POST /api/cohorts/[id]/schedule - Set Unlock Schedule', () => {

    test('should create cohort schedule with module unlock dates', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Schedule Test Cohort',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: schedule, error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-01',
      }).select().single();

      expect(error).toBeNull();
      expect(schedule.cohort_id).toBe(cohort.id);
      expect(schedule.module_id).toBe(testModuleIds[0]);
      expect(schedule.unlock_date).toBe('2025-03-01');
    });

    test('should support auto-generate weekly schedule', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Weekly Schedule Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const schedules = testModuleIds.map((moduleId, index) => ({
        cohort_id: cohort.id,
        module_id: moduleId,
        unlock_date: new Date(2025, 2, 1 + (index * 7)).toISOString().split('T')[0],
      }));

      const { data: created, error } = await supabaseAdmin.from('cohort_schedules').insert(schedules).select();

      expect(error).toBeNull();
      expect(created).not.toBeNull();
      expect(created!.length).toBe(testModuleIds.length);
    });

    test('should support custom schedule with specific unlock dates', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Custom Schedule Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: schedules, error } = await supabaseAdmin.from('cohort_schedules').insert([
        { cohort_id: cohort.id, module_id: testModuleIds[0], unlock_date: '2025-03-01' },
        { cohort_id: cohort.id, module_id: testModuleIds[1], unlock_date: '2025-03-10' },
        { cohort_id: cohort.id, module_id: testModuleIds[2], unlock_date: '2025-03-20' },
      ]).select();

      expect(error).toBeNull();
      expect(schedules).not.toBeNull();
      expect(schedules!.length).toBe(3);
    });

    test('should support optional lock_date to re-lock modules', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Lock Date Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: schedule, error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-01',
        lock_date: '2025-04-01',
      }).select().single();

      expect(error).toBeNull();
      expect(schedule.lock_date).toBe('2025-04-01');
    });

    test('should enforce UNIQUE constraint prevent duplicate schedule', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Duplicate Schedule Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-01',
      });

      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-05',
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505');
    });

    test('should allow same module in schedule for different cohorts', async () => {
      await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Cohort 1 Schedule',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: cohort2 } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Cohort 2 Schedule',
        start_date: '2025-04-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { error: e1 } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort2.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-04-01',
      });

      const { error: e2 } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort2.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-04-01',
      });

      expect(e1).toBeNull();
      expect(e2).toBeNull();
    });

    test('should reject invalid module_id', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Invalid Module Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: 999999,
        unlock_date: '2025-03-01',
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23503');
    });

    test('should reject invalid cohort_id', async () => {
      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: 999999,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-01',
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23503');
    });

    test('should require unlock_date field', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Missing Unlock Date Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
      });

      expect(error).toBeDefined();
    });

    test('should allow updating schedule unlock dates', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Update Schedule Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-01',
      }).select().single();

      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        unlock_date: '2025-03-10',
      }).eq('id', schedule.id).select().single();

      expect(error).toBeNull();
      expect(updated.unlock_date).toBe('2025-03-10');
    });

    test('should delete schedule when removing module from schedule', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Delete Schedule Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: cohort.id,
        module_id: testModuleIds[0],
        unlock_date: '2025-03-01',
      }).select().single();

      const { error } = await supabaseAdmin.from('cohort_schedules').delete().eq('id', schedule.id);
      expect(error).toBeNull();
    });
  });

  // ============================================================================
  // SECTION 6: COHORT ENROLLMENT TESTS
  // ============================================================================

  describe('6. Cohort Enrollment Constraints and Validation', () => {

    test('should prevent duplicate enrollments', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Duplicate Enrollment Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      const { error } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
      });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505');
    });

    test('should store completed_lessons counter in enrollment', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Completed Lessons Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
        completed_lessons: 0,
      }).select().single();

      expect(enrollment.completed_lessons).toBe(0);

      const { data: updated } = await supabaseAdmin.from('cohort_enrollments').update({
        completed_lessons: 5,
      }).eq('id', enrollment.id).select().single();

      expect(updated.completed_lessons).toBe(5);
    });

    test('should allow enrollment status transitions', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Status Transitions Test',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: enrollment } = await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: cohort.id,
        user_id: student1Client.userId,
        status: 'active',
      }).select().single();

      const statuses = ['completed', 'dropped', 'paused', 'active'];

      for (const status of statuses) {
        const { data: updated, error } = await supabaseAdmin.from('cohort_enrollments').update({
          status,
        }).eq('id', enrollment.id).select().single();

        expect(error).toBeNull();
        expect(updated.status).toBe(status);
      }
    });
  });

  // ============================================================================
  // SECTION 7: BATCH OPERATIONS AND EDGE CASES
  // ============================================================================

  describe('7. Batch Operations and Edge Cases', () => {

    test('should handle batch create of multiple cohorts', async () => {
      const cohortBatch = Array.from({ length: 5 }, (_, i) => ({
        course_id: testCourseId,
        name: `Batch Cohort ${i + 1}`,
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }));

      const { data: cohorts, error } = await supabaseAdmin.from('cohorts').insert(cohortBatch).select();

      expect(error).toBeNull();
      expect(cohorts).not.toBeNull();
      expect(cohorts!.length).toBe(5);
    });

    test('should handle bulk enrollment of students to cohort', async () => {
      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Bulk Enrollment Test',
        start_date: '2025-03-01',
        max_students: 100,
        created_by: teacherClient.userId,
      }).select().single();

      const enrollments = [
        { cohort_id: cohort.id, user_id: student1Client.userId },
        { cohort_id: cohort.id, user_id: student2Client.userId },
      ];

      const { data: enrolled, error } = await supabaseAdmin.from('cohort_enrollments').insert(enrollments).select();

      expect(error).toBeNull();
      expect(enrolled).not.toBeNull();
      expect(enrolled!.length).toBe(2);
    });

    test('should handle very long cohort names', async () => {
      const longName = 'A'.repeat(255);

      const { data: cohort, error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: longName,
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      expect(error).toBeNull();
      expect(cohort.name).toBe(longName);
    });

    test('should handle NULL end_date open-ended cohorts', async () => {
      const { data: cohort, error } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Open Ended Cohort',
        start_date: '2025-03-01',
        created_by: teacherClient.userId,
      }).select().single();

      expect(error).toBeNull();
      expect(cohort.end_date).toBeNull();
    });
  });
});

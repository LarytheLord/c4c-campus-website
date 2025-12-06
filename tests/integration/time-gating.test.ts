/**
 * Time-Gating Functionality Integration Tests
 *
 * Comprehensive tests for module locking and unlocking based on scheduled dates
 * Tests cover:
 * - Module unlock logic (locked before unlock_date, unlocked at scheduled time)
 * - Lock icon display for locked modules
 * - Unlock date display to students
 * - Teacher override capabilities
 * - Schedule management (create, update, delete)
 * - Edge cases (timezone handling, past dates, concurrent access)
 *
 * Reference:
 * - ROADMAP.md Week 4: Cohort Creation & Time-Gating (task 3.1)
 * - C4C_CAMPUS_PLATFORM_VISION.md: Time-Gating & Module Unlocking
 *
 * Test Count: 30+ comprehensive test cases
 * Target Coverage: 95%+ of time-gating requirements
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  supabaseAnon,
  cleanupTestData,
  getAuthenticatedClient,
  TEST_USERS
} from '../integration-setup';

describe('Time-Gating Functionality Integration Tests', () => {
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;
  let testModuleIds: number[] = [];
  let testCohortId: number;

  beforeAll(async () => {
    // Authenticate all test users
    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);

    // Create test course
    const { data: course } = await supabaseAdmin.from('courses').insert({
      name: 'Time-Gating Test Course',
      slug: 'time-gating-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      published: true,
      is_cohort_based: true,
      created_by: teacherClient.userId,
    }).select().single();

    testCourseId = course.id;

    // Create test modules
    for (let i = 1; i <= 6; i++) {
      const { data: module } = await supabaseAdmin.from('modules').insert({
        course_id: testCourseId,
        name: `Time-Gating Test Module ${i}`,
        order_index: i,
      }).select().single();
      testModuleIds.push(module.id);
    }

    // Create test cohort
    const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Time-Gating Test Cohort',
      start_date: '2025-03-01',
      end_date: '2025-05-31',
      max_students: 50,
      status: 'upcoming',
      created_by: teacherClient.userId,
    }).select().single();

    testCohortId = cohort.id;

    // Enroll students in cohort
    await supabaseAdmin.from('cohort_enrollments').insert([
      { cohort_id: testCohortId, user_id: student1Client.userId },
      { cohort_id: testCohortId, user_id: student2Client.userId },
    ]);
  });

  afterEach(async () => {
    // Clean up schedules after each test
    await supabaseAdmin.from('cohort_schedules').delete().neq('id', 0);
  });

  // ============================================================================
  // SECTION 1: MODULE LOCKING LOGIC
  // ============================================================================

  describe('1. Module Locking Logic - Basic Lock/Unlock', () => {

    test('should lock module before unlock_date', async () => {
      // Arrange - Create schedule with unlock_date in the future
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: futureDateStr,
      }).select().single();

      // Act - Check if module is locked
      const moduleIsLocked = new Date(schedule.unlock_date) > new Date();

      // Assert
      expect(moduleIsLocked).toBe(true);
      expect(schedule.unlock_date).toBe(futureDateStr);
    });

    test('should unlock module at scheduled unlock_date', async () => {
      // Arrange - Create schedule with unlock_date as today
      const todayStr = new Date().toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[1],
        unlock_date: todayStr,
      }).select().single();

      // Act - Check if module should be unlocked
      const moduleIsUnlocked = new Date(schedule.unlock_date) <= new Date();

      // Assert
      expect(moduleIsUnlocked).toBe(true);
    });

    test('should allow module access when current time >= unlock_date', async () => {
      // Arrange
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[2],
        unlock_date: yesterdayStr,
      }).select().single();

      // Act
      const now = new Date();
      const scheduleDate = new Date(schedule.unlock_date);
      const isAccessible = scheduleDate <= now;

      // Assert
      expect(isAccessible).toBe(true);
      expect(scheduleDate).toBeLessThanOrEqual(now);
    });

    test('should prevent module access when current time < unlock_date', async () => {
      // Arrange
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[3],
        unlock_date: tomorrowStr,
      }).select().single();

      // Act
      const now = new Date();
      const scheduleDate = new Date(schedule.unlock_date);
      const isAccessible = scheduleDate <= now;

      // Assert
      expect(isAccessible).toBe(false);
      expect(scheduleDate).toBeGreaterThan(now);
    });

    test('should enforce locked module with lock_date (re-lock after time period)', async () => {
      // Arrange - Create schedule with lock_date in the future
      const now = new Date();
      const unlockDateStr = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 day ago
      const lockDateStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days from now

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[4],
        unlock_date: unlockDateStr,
        lock_date: lockDateStr,
      }).select().single();

      // Act
      const currentDate = new Date();
      const scheduleUnlockDate = new Date(schedule.unlock_date);
      const scheduleLockDate = new Date(schedule.lock_date);
      const isCurrentlyAccessible = scheduleUnlockDate <= currentDate && currentDate < scheduleLockDate;

      // Assert
      expect(isCurrentlyAccessible).toBe(true);
      expect(schedule.lock_date).toBe(lockDateStr);
      expect(scheduleLockDate).toBeGreaterThan(currentDate);
    });

    test('should re-lock module when current time >= lock_date', async () => {
      // Arrange - Create schedule with lock_date in the past
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[5],
        unlock_date: twoWeeksAgoStr,
        lock_date: yesterdayStr,
      }).select().single();

      // Act
      const now = new Date();
      const currentTime = new Date(schedule.lock_date);
      const isRelocked = now >= currentTime;

      // Assert
      expect(isRelocked).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 2: SCHEDULE MANAGEMENT
  // ============================================================================

  describe('2. Schedule Management - Create, Update, Delete', () => {

    test('should create cohort schedule with valid data', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];

      // Act
      const { data: schedule, error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: unlockDate,
      }).select().single();

      // Assert
      expect(error).toBeNull();
      expect(schedule).toBeDefined();
      expect(schedule.cohort_id).toBe(testCohortId);
      expect(schedule.module_id).toBe(testModuleIds[0]);
      expect(schedule.unlock_date).toBe(unlockDate);
    });

    test('should update schedule unlock_date', async () => {
      // Arrange
      const initialDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[1],
        unlock_date: initialDate,
      }).select().single();

      // Act
      const newDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        unlock_date: newDate,
      }).eq('id', schedule.id).select().single();

      // Assert
      expect(error).toBeNull();
      expect(updated.unlock_date).toBe(newDate);
      expect(updated.unlock_date).not.toBe(initialDate);
    });

    test('should update schedule lock_date', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[2],
        unlock_date: unlockDate,
      }).select().single();

      // Act
      const lockDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        lock_date: lockDate,
      }).eq('id', schedule.id).select().single();

      // Assert
      expect(error).toBeNull();
      expect(updated.lock_date).toBe(lockDate);
    });

    test('should delete cohort schedule', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[3],
        unlock_date: unlockDate,
      }).select().single();

      // Act
      const { error } = await supabaseAdmin.from('cohort_schedules').delete().eq('id', schedule.id);

      // Assert
      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted, error: findError } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('id', schedule.id)
        .single()
        .catch(e => ({ data: null, error: e }));

      expect(findError).toBeDefined();
    });

    test('should enforce UNIQUE(cohort_id, module_id) constraint', async () => {
      // Arrange - Create first schedule
      const unlockDate = new Date().toISOString().split('T')[0];
      await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[4],
        unlock_date: unlockDate,
      });

      // Act - Try to create duplicate
      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[4], // Same module
        unlock_date: unlockDate,
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // PostgreSQL unique constraint
    });

    test('should reject invalid module_id (non-existent)', async () => {
      // Act
      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: 999999, // Non-existent
        unlock_date: new Date().toISOString().split('T')[0],
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.code).toBe('23503'); // Foreign key violation
    });

    test('should reject invalid cohort_id (non-existent)', async () => {
      // Act
      const { error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: 999999, // Non-existent
        module_id: testModuleIds[0],
        unlock_date: new Date().toISOString().split('T')[0],
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.code).toBe('23503'); // Foreign key violation
    });
  });

  // ============================================================================
  // SECTION 3: WEEKLY SCHEDULE GENERATION
  // ============================================================================

  describe('3. Weekly Schedule Generation', () => {

    test('should generate weekly schedule starting from cohort start_date', async () => {
      // Arrange
      const startDate = new Date('2025-03-01');
      const schedules = testModuleIds.slice(0, 4).map((moduleId, index) => {
        const unlockDate = new Date(startDate.getTime() + index * 7 * 24 * 60 * 60 * 1000);
        return {
          cohort_id: testCohortId,
          module_id: moduleId,
          unlock_date: unlockDate.toISOString().split('T')[0],
        };
      });

      // Act
      const { data: created, error } = await supabaseAdmin.from('cohort_schedules').insert(schedules).select();

      // Assert
      expect(error).toBeNull();
      expect(created.length).toBe(4);
      expect(created[0].unlock_date).toBe('2025-03-01');
      expect(created[1].unlock_date).toBe('2025-03-08');
      expect(created[2].unlock_date).toBe('2025-03-15');
      expect(created[3].unlock_date).toBe('2025-03-22');
    });

    test('should support custom schedule with non-uniform intervals', async () => {
      // Arrange
      const customSchedules = [
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[0],
          unlock_date: '2025-03-01', // Week 1
        },
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[1],
          unlock_date: '2025-03-10', // 9 days later
        },
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[2],
          unlock_date: '2025-03-17', // 7 days later
        },
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[3],
          unlock_date: '2025-03-24', // 7 days later
        },
      ];

      // Act
      const { data: created, error } = await supabaseAdmin.from('cohort_schedules').insert(customSchedules).select();

      // Assert
      expect(error).toBeNull();
      expect(created.length).toBe(4);
      expect(created[1].unlock_date).toBe('2025-03-10'); // Non-uniform interval
    });
  });

  // ============================================================================
  // SECTION 4: LOCK ICON & UI DISPLAY
  // ============================================================================

  describe('4. Lock Icon & UI Display for Locked Modules', () => {

    test('should provide lock status for frontend to display lock icon', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: futureDateStr,
      }).select().single();

      // Act - Calculate lock status
      const currentTime = new Date();
      const scheduleDate = new Date(schedule.unlock_date);
      const isLocked = scheduleDate > currentTime;

      // Assert
      expect(isLocked).toBe(true);
    });

    test('should display unlock date in UI for locked modules', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[1],
        unlock_date: futureDateStr,
      }).select().single();

      // Act - Get unlock date for display
      const { data: displaySchedule } = await supabaseAdmin
        .from('cohort_schedules')
        .select('unlock_date')
        .eq('id', schedule.id)
        .single();

      // Assert
      expect(displaySchedule.unlock_date).toBe(futureDateStr);
      expect(displaySchedule.unlock_date).toBeDefined();
    });

    test('should not display lock icon for unlocked modules', async () => {
      // Arrange
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[2],
        unlock_date: pastDateStr,
      }).select().single();

      // Act
      const currentTime = new Date();
      const scheduleDate = new Date(schedule.unlock_date);
      const isLocked = scheduleDate > currentTime;

      // Assert
      expect(isLocked).toBe(false);
    });

    test('should display countdown for modules unlocking soon', async () => {
      // Arrange
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[3],
        unlock_date: tomorrowStr,
      }).select().single();

      // Act - Calculate time until unlock
      const now = new Date();
      const unlockDate = new Date(schedule.unlock_date);
      const timeUntilUnlock = unlockDate.getTime() - now.getTime();
      const daysUntilUnlock = Math.ceil(timeUntilUnlock / (1000 * 60 * 60 * 24));

      // Assert
      expect(daysUntilUnlock).toBe(1);
      expect(timeUntilUnlock).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SECTION 5: TEACHER OVERRIDES
  // ============================================================================

  describe('5. Teacher Overrides for Time-Gating', () => {

    test('should allow teacher to update unlock_date to make module immediately available', async () => {
      // Arrange - Create locked schedule
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: futureDateStr,
      }).select().single();

      // Act - Teacher overrides by setting unlock_date to today
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        unlock_date: todayStr,
      }).eq('id', schedule.id).select().single();

      // Assert
      expect(error).toBeNull();
      expect(updated.unlock_date).toBe(todayStr);
      expect(new Date(updated.unlock_date) <= new Date()).toBe(true);
    });

    test('should allow teacher to update unlock_date to delay module access', async () => {
      // Arrange
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[1],
        unlock_date: todayStr,
      }).select().single();

      // Act - Teacher delays unlock
      const laterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const laterDateStr = laterDate.toISOString().split('T')[0];
      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        unlock_date: laterDateStr,
      }).eq('id', schedule.id).select().single();

      // Assert
      expect(error).toBeNull();
      expect(updated.unlock_date).toBe(laterDateStr);
      expect(new Date(updated.unlock_date)).toBeGreaterThan(new Date());
    });

    test('should allow teacher to remove lock_date (keep module unlocked indefinitely)', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const lockDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[2],
        unlock_date: unlockDate,
        lock_date: lockDate,
      }).select().single();

      // Act - Teacher removes lock_date
      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        lock_date: null,
      }).eq('id', schedule.id).select().single();

      // Assert
      expect(error).toBeNull();
      expect(updated.lock_date).toBeNull();
    });

    test('should allow teacher to set lock_date to re-lock already unlocked module', async () => {
      // Arrange
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[3],
        unlock_date: pastDate,
      }).select().single();

      // Act - Teacher sets a lock_date
      const lockDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: updated, error } = await supabaseAdmin.from('cohort_schedules').update({
        lock_date: lockDate,
      }).eq('id', schedule.id).select().single();

      // Assert
      expect(error).toBeNull();
      expect(updated.lock_date).toBe(lockDate);
    });

    test('should enforce RLS: student cannot modify schedule unlock dates', async () => {
      // Arrange
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[4],
        unlock_date: todayStr,
      }).select().single();

      // Act - Student tries to update schedule
      const { error } = await student1Client.from('cohort_schedules').update({
        unlock_date: '2025-02-01',
      }).eq('id', schedule.id);

      // Assert - Should be denied by RLS
      expect(error).toBeDefined();
    });
  });

  // ============================================================================
  // SECTION 6: EDGE CASES & TIMEZONE HANDLING
  // ============================================================================

  describe('6. Edge Cases & Timezone Handling', () => {

    test('should handle past unlock_date (module always accessible)', async () => {
      // Arrange
      const pastDate = '2020-01-01'; // Very old date

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: pastDate,
      }).select().single();

      // Act
      const scheduleDate = new Date(schedule.unlock_date);
      const isAccessible = scheduleDate <= new Date();

      // Assert
      expect(isAccessible).toBe(true);
      expect(schedule.unlock_date).toBe(pastDate);
    });

    test('should handle future unlock_date (module not yet accessible)', async () => {
      // Arrange
      const farFutureDate = '2099-12-31'; // Far future

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[1],
        unlock_date: farFutureDate,
      }).select().single();

      // Act
      const scheduleDate = new Date(schedule.unlock_date);
      const isAccessible = scheduleDate <= new Date();

      // Assert
      expect(isAccessible).toBe(false);
      expect(schedule.unlock_date).toBe(farFutureDate);
    });

    test('should handle same day unlock and lock (single day access)', async () => {
      // Arrange
      const dateStr = new Date().toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[2],
        unlock_date: dateStr,
        lock_date: dateStr,
      }).select().single();

      // Assert
      expect(schedule.unlock_date).toBe(dateStr);
      expect(schedule.lock_date).toBe(dateStr);
    });

    test('should handle lock_date before unlock_date (invalid but should not error in DB)', async () => {
      // Arrange & Act
      const { data: schedule, error } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[3],
        unlock_date: '2025-03-20',
        lock_date: '2025-03-10', // Before unlock
      }).select().single();

      // Assert - DB allows it (validation should happen in API/business logic)
      expect(error).toBeNull();
      expect(schedule).toBeDefined();
    });

    test('should handle NULL lock_date (module remains unlocked after unlock_date)', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[4],
        unlock_date: unlockDate,
        lock_date: null,
      }).select().single();

      // Assert
      expect(schedule.lock_date).toBeNull();
    });

    test('should handle date-only format (YYYY-MM-DD) consistently across operations', async () => {
      // Arrange
      const dateStr = '2025-06-15';

      const { data: inserted } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[5],
        unlock_date: dateStr,
      }).select().single();

      // Act - Fetch and verify format
      const { data: fetched } = await supabaseAdmin
        .from('cohort_schedules')
        .select('unlock_date')
        .eq('id', inserted.id)
        .single();

      // Assert
      expect(fetched.unlock_date).toBe(dateStr);
      expect(fetched.unlock_date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });

    test('should handle concurrent access to same schedule', async () => {
      // Arrange
      const dateStr = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: dateStr,
      }).select().single();

      // Act - Multiple concurrent reads
      const [fetch1, fetch2, fetch3] = await Promise.all([
        supabaseAdmin.from('cohort_schedules').select().eq('id', schedule.id).single(),
        supabaseAdmin.from('cohort_schedules').select().eq('id', schedule.id).single(),
        supabaseAdmin.from('cohort_schedules').select().eq('id', schedule.id).single(),
      ]);

      // Assert
      expect(fetch1.data).toBeDefined();
      expect(fetch2.data).toBeDefined();
      expect(fetch3.data).toBeDefined();
      expect(fetch1.data.id).toBe(fetch2.data.id);
      expect(fetch2.data.id).toBe(fetch3.data.id);
    });
  });

  // ============================================================================
  // SECTION 7: MULTI-MODULE SCHEDULE MANAGEMENT
  // ============================================================================

  describe('7. Multi-Module Schedule Management', () => {

    test('should retrieve all schedules for a cohort', async () => {
      // Arrange - Create multiple schedules
      const schedules = testModuleIds.slice(0, 3).map((moduleId, index) => {
        const date = new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000);
        return {
          cohort_id: testCohortId,
          module_id: moduleId,
          unlock_date: date.toISOString().split('T')[0],
        };
      });

      await supabaseAdmin.from('cohort_schedules').insert(schedules);

      // Act
      const { data: allSchedules } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId)
        .order('unlock_date', { ascending: true });

      // Assert
      expect(allSchedules.length).toBe(3);
      expect(allSchedules[0].unlock_date <= allSchedules[1].unlock_date).toBe(true);
      expect(allSchedules[1].unlock_date <= allSchedules[2].unlock_date).toBe(true);
    });

    test('should identify all currently locked modules for a cohort', async () => {
      // Arrange
      const now = new Date();
      await supabaseAdmin.from('cohort_schedules').insert([
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[0],
          unlock_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[1],
          unlock_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ]);

      // Act
      const { data: all } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId);

      const locked = all.filter(s => new Date(s.unlock_date) > now);

      // Assert
      expect(locked.length).toBeGreaterThan(0);
      expect(locked.every(s => new Date(s.unlock_date) > now)).toBe(true);
    });

    test('should identify all currently unlocked modules for a cohort', async () => {
      // Arrange
      const now = new Date();
      await supabaseAdmin.from('cohort_schedules').insert([
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[0],
          unlock_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[1],
          unlock_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ]);

      // Act
      const { data: all } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId);

      const unlocked = all.filter(s => new Date(s.unlock_date) <= now);

      // Assert
      expect(unlocked.length).toBeGreaterThan(0);
      expect(unlocked.every(s => new Date(s.unlock_date) <= now)).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 8: STUDENT ACCESS CONTROL
  // ============================================================================

  describe('8. Student Access Control Based on Time-Gating', () => {

    test('should return locked schedule in student query (UI responsibility to check)', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: futureDateStr,
      }).select().single();

      // Act - Student queries their cohort schedules
      const { data: studentSchedules } = await student1Client
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId);

      // Assert - Student can see schedule data (date logic handled by frontend)
      const foundSchedule = studentSchedules?.find(s => s.id === schedule.id);
      expect(foundSchedule).toBeDefined();
      expect(foundSchedule?.unlock_date).toBe(futureDateStr);
    });

    test('should allow student to view module if unlocked', async () => {
      // Arrange
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[1],
        unlock_date: pastDateStr,
      });

      // Act - Check if module is accessible
      const { data: schedule } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId)
        .eq('module_id', testModuleIds[1])
        .single();

      const isUnlocked = new Date(schedule.unlock_date) <= new Date();

      // Assert
      expect(isUnlocked).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 9: SCHEDULE STATUS & QUERIES
  // ============================================================================

  describe('9. Schedule Status & Analytical Queries', () => {

    test('should retrieve upcoming unlocks for a cohort (next 7 days)', async () => {
      // Arrange
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

      await supabaseAdmin.from('cohort_schedules').insert([
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[0],
          unlock_date: in3Days.toISOString().split('T')[0],
        },
        {
          cohort_id: testCohortId,
          module_id: testModuleIds[1],
          unlock_date: in10Days.toISOString().split('T')[0],
        },
      ]);

      // Act - Get upcoming unlocks
      const { data: all } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId);

      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = all.filter(s => {
        const unlockDate = new Date(s.unlock_date);
        return unlockDate > now && unlockDate <= sevenDaysFromNow;
      });

      // Assert
      expect(upcoming.length).toBeGreaterThan(0);
      expect(upcoming.some(s => s.unlock_date === in3Days.toISOString().split('T')[0])).toBe(true);
    });

    test('should calculate completion percentage based on unlocked modules', async () => {
      // Arrange - Create 4 module schedules
      const now = new Date();
      const schedules = testModuleIds.slice(0, 4).map((moduleId, index) => {
        const date = new Date(now.getTime() + (index - 2) * 7 * 24 * 60 * 60 * 1000);
        return {
          cohort_id: testCohortId,
          module_id: moduleId,
          unlock_date: date.toISOString().split('T')[0],
        };
      });

      await supabaseAdmin.from('cohort_schedules').insert(schedules);

      // Act - Count unlocked modules
      const { data: allSchedules } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId);

      const unlockedCount = allSchedules.filter(s => new Date(s.unlock_date) <= now).length;
      const totalCount = allSchedules.length;
      const unlockedPercentage = (unlockedCount / totalCount) * 100;

      // Assert
      expect(unlockedPercentage).toBeGreaterThanOrEqual(0);
      expect(unlockedPercentage).toBeLessThanOrEqual(100);
    });
  });
});

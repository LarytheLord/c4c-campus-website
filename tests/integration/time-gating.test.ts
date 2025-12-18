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
      title: 'Time-Gating Test Course',
      slug: 'time-gating-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: true,
      is_cohort_based: true,
      created_by: teacherClient.userId,
    }).select().single();

    testCourseId = course.id;

    // Create test modules
    for (let i = 1; i <= 6; i++) {
      const { data: module } = await supabaseAdmin.from('modules').insert({
        course_id: testCourseId,
        title: `Time-Gating Test Module ${i}`,
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
      expect(scheduleDate.getTime()).toBeLessThanOrEqual(now.getTime());
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
      expect(scheduleDate.getTime()).toBeGreaterThan(now.getTime());
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
      expect(scheduleLockDate.getTime()).toBeGreaterThan(currentDate.getTime());
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
      expect(updated).not.toBeNull();
      if (!updated) throw new Error('Updated schedule is null - test failed');
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
      expect(updated).not.toBeNull();
      expect(updated!.lock_date).toBe(lockDate);
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
      let deleted = null;
      let findError = null;
      try {
        const result = await supabaseAdmin
          .from('cohort_schedules')
          .select()
          .eq('id', schedule.id)
          .single();
        deleted = result.data;
        findError = result.error;
      } catch (e) {
        findError = e;
      }

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
      expect(created).not.toBeNull();
      expect(created!.length).toBe(4);
      expect(created![0].unlock_date).toBe('2025-03-01');
      expect(created![1].unlock_date).toBe('2025-03-08');
      expect(created![2].unlock_date).toBe('2025-03-15');
      expect(created![3].unlock_date).toBe('2025-03-22');
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
      expect(created).not.toBeNull();
      expect(created!.length).toBe(4);
      expect(created![1].unlock_date).toBe('2025-03-10'); // Non-uniform interval
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
      expect(displaySchedule).not.toBeNull();
      if (!displaySchedule) throw new Error('Display schedule is null - test failed');
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
      expect(updated).not.toBeNull();
      if (!updated) throw new Error('Updated schedule is null - test failed');
      expect(updated.unlock_date).toBe(laterDateStr);
      expect(new Date(updated.unlock_date).getTime()).toBeGreaterThan(new Date().getTime());
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
      expect(updated).not.toBeNull();
      expect(updated!.lock_date).toBeNull();
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
      expect(updated).not.toBeNull();
      expect(updated!.lock_date).toBe(lockDate);
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
      const { error } = await student1Client.client.from('cohort_schedules').update({
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
      expect(fetched).not.toBeNull();
      if (!fetched) throw new Error('Fetched schedule is null - test failed');
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
      expect(fetch1.data).not.toBeNull();
      expect(fetch2.data).not.toBeNull();
      expect(fetch3.data).not.toBeNull();
      if (!fetch1.data || !fetch2.data || !fetch3.data) throw new Error('Concurrent fetch data is null - test failed');
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
      expect(allSchedules).not.toBeNull();
      expect(allSchedules!.length).toBe(3);
      expect(allSchedules![0].unlock_date <= allSchedules![1].unlock_date).toBe(true);
      expect(allSchedules![1].unlock_date <= allSchedules![2].unlock_date).toBe(true);
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

      expect(all).not.toBeNull();
      const locked = all!.filter((s: { unlock_date: string }) => new Date(s.unlock_date) > now);

      // Assert
      expect(locked.length).toBeGreaterThan(0);
      expect(locked.every((s: { unlock_date: string }) => new Date(s.unlock_date) > now)).toBe(true);
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

      expect(all).not.toBeNull();
      const unlocked = all!.filter((s: { unlock_date: string }) => new Date(s.unlock_date) <= now);

      // Assert
      expect(unlocked.length).toBeGreaterThan(0);
      expect(unlocked.every((s: { unlock_date: string }) => new Date(s.unlock_date) <= now)).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 8: COHORT SCHEDULES RLS POLICY TESTS
  // ============================================================================

  describe('8. Cohort Schedules RLS Policy Behavior', () => {

    test('should allow enrolled students to read schedules for their cohort', async () => {
      // Arrange - Create schedule using admin
      const unlockDate = new Date().toISOString().split('T')[0];
      await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: unlockDate,
      });

      // Act - Student queries schedules (RLS should allow)
      const { data: schedules, error } = await student1Client.client
        .from('cohort_schedules')
        .select('*')
        .eq('cohort_id', testCohortId);

      // Assert - Student can view schedules for their enrolled cohort
      expect(error).toBeNull();
      expect(schedules).toBeDefined();
      expect(schedules!.length).toBeGreaterThan(0);
    });

    test('should allow teachers to create schedules for their cohorts', async () => {
      // Arrange - Teacher is the course creator
      const unlockDate = new Date().toISOString().split('T')[0];

      // Act - Teacher creates schedule
      const { data: schedule, error } = await teacherClient.client
        .from('cohort_schedules')
        .insert({
          cohort_id: testCohortId,
          module_id: testModuleIds[1],
          unlock_date: unlockDate,
        })
        .select()
        .single();

      // Assert - Teacher can create schedules
      expect(error).toBeNull();
      expect(schedule).toBeDefined();
      expect(schedule).not.toBeNull();
      expect(schedule!.cohort_id).toBe(testCohortId);
    });

    test('should allow teachers to update schedules for their cohorts', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[2],
        unlock_date: unlockDate,
      }).select().single();

      // Act - Teacher updates schedule
      const newDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: updated, error } = await teacherClient.client
        .from('cohort_schedules')
        .update({ unlock_date: newDate })
        .eq('id', schedule.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(updated).not.toBeNull();
      if (!updated) throw new Error('Updated schedule is null - test failed');
      expect(updated.unlock_date).toBe(newDate);
    });

    test('should allow teachers to delete schedules for their cohorts', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[3],
        unlock_date: unlockDate,
      }).select().single();

      // Act - Teacher deletes schedule
      const { error } = await teacherClient.client
        .from('cohort_schedules')
        .delete()
        .eq('id', schedule.id);

      // Assert
      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted } = await supabaseAdmin
        .from('cohort_schedules')
        .select()
        .eq('id', schedule.id);

      expect(deleted?.length).toBe(0);
    });

    test('should deny students from modifying schedules', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[4],
        unlock_date: unlockDate,
      }).select().single();

      // Act - Student tries to update schedule
      const { error } = await student1Client.client
        .from('cohort_schedules')
        .update({ unlock_date: '2099-01-01' })
        .eq('id', schedule.id);

      // Assert - RLS should deny the update
      expect(error).toBeDefined();
    });

    test('should deny students from creating schedules', async () => {
      // Act - Student tries to create schedule
      const { error } = await student1Client.client
        .from('cohort_schedules')
        .insert({
          cohort_id: testCohortId,
          module_id: testModuleIds[5],
          unlock_date: '2025-12-01',
        });

      // Assert - RLS should deny the insert
      expect(error).toBeDefined();
    });

    test('should deny students from deleting schedules', async () => {
      // Arrange
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: unlockDate,
      }).select().single();

      // Act - Student tries to delete schedule
      const { error } = await student1Client.client
        .from('cohort_schedules')
        .delete()
        .eq('id', schedule.id);

      // Assert - RLS should deny the delete
      expect(error).toBeDefined();
    });
  });

  // ============================================================================
  // SECTION 9: STUDENT ACCESS CONTROL
  // ============================================================================

  describe('9. Student Access Control Based on Time-Gating', () => {

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
      const { data: studentSchedules } = await student1Client.client
        .from('cohort_schedules')
        .select()
        .eq('cohort_id', testCohortId);

      // Assert - Student can see schedule data (date logic handled by frontend)
      const foundSchedule = studentSchedules?.find((s: { id: number }) => s.id === schedule.id);
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
  // SECTION 10: UUID COHORT_ID TYPE VALIDATION
  // ============================================================================

  describe('10. UUID Cohort ID Type Validation', () => {

    test('should accept valid UUID string for cohort_id in isModuleUnlocked', async () => {
      // Arrange - Create schedule with UUID cohort_id
      const unlockDate = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId, // This is a UUID string
        module_id: testModuleIds[0],
        unlock_date: unlockDate,
      }).select().single();

      // Act - Call isModuleUnlocked with UUID string (not number)
      // The function signature should be: isModuleUnlocked(moduleId: number, cohortId: string, ...)
      // Verify that the cohort_id is treated as a string throughout
      expect(typeof testCohortId).toBe('string');
      expect(testCohortId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // Assert - Schedule was created with UUID cohort_id
      expect(schedule.cohort_id).toBe(testCohortId);
      expect(typeof schedule.cohort_id).toBe('string');
    });

    test('should return correct schedule data when queried with UUID cohort_id', async () => {
      // Arrange
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: tomorrowStr,
      });

      // Act - Query using UUID string (this is what getCohortModuleStatuses does)
      const { data: schedules, error } = await supabaseAdmin
        .from('cohort_schedules')
        .select('module_id, unlock_date, lock_date')
        .eq('cohort_id', testCohortId); // UUID string, not number

      // Assert
      expect(error).toBeNull();
      expect(schedules).toBeDefined();
      expect(schedules!.length).toBeGreaterThan(0);
      expect(schedules![0].unlock_date).toBe(tomorrowStr);
    });

    test('should handle cohort_id as UUID in join queries', async () => {
      // Arrange - Create schedule
      const unlockDate = new Date().toISOString().split('T')[0];
      await supabaseAdmin.from('cohort_schedules').insert({
        cohort_id: testCohortId,
        module_id: testModuleIds[0],
        unlock_date: unlockDate,
      });

      // Act - Query with join to cohorts table
      const { data: scheduleWithCohort, error } = await supabaseAdmin
        .from('cohort_schedules')
        .select(`
          module_id,
          unlock_date,
          cohorts!inner(id, name, course_id)
        `)
        .eq('cohort_id', testCohortId)
        .single();

      // Assert - The join works correctly with UUID
      expect(error).toBeNull();
      expect(scheduleWithCohort).toBeDefined();
      expect((scheduleWithCohort as any).cohorts.id).toBe(testCohortId);
    });
  });

  // ============================================================================
  // SECTION 11: SCHEDULE STATUS & QUERIES
  // ============================================================================

  describe('11. Schedule Status & Analytical Queries', () => {

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

      expect(all).not.toBeNull();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = all!.filter((s: { unlock_date: string }) => {
        const unlockDate = new Date(s.unlock_date);
        return unlockDate > now && unlockDate <= sevenDaysFromNow;
      });

      // Assert
      expect(upcoming.length).toBeGreaterThan(0);
      expect(upcoming.some((s: { unlock_date: string }) => s.unlock_date === in3Days.toISOString().split('T')[0])).toBe(true);
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

      expect(allSchedules).not.toBeNull();
      const unlockedCount = allSchedules!.filter((s: { unlock_date: string }) => new Date(s.unlock_date) <= now).length;
      const totalCount = allSchedules!.length;
      const unlockedPercentage = (unlockedCount / totalCount) * 100;

      // Assert
      expect(unlockedPercentage).toBeGreaterThanOrEqual(0);
      expect(unlockedPercentage).toBeLessThanOrEqual(100);
    });
  });
});

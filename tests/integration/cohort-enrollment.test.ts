/**
 * Cohort Enrollment Integration Tests
 *
 * Tests the cohort enrollment API endpoint and business logic
 * Reference: schema.sql cohort_enrollments table (lines 238-249)
 *
 * Coverage:
 * - Enrollment creation with capacity checks
 * - Duplicate enrollment prevention
 * - Status validation
 * - Prerequisites checking
 * - Course/cohort relationship validation
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  cleanupTestData,
  getAuthenticatedClient,
  TEST_USERS
} from '../integration-setup';

describe('Cohort Enrollment Integration Tests', () => {
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;
  let testCohortId: string;

  beforeAll(async () => {
    // Authenticate all test users once
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);
    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);
  });

  beforeEach(async () => {
    // Create test course
    const { data: course } = await supabaseAdmin.from('courses').insert({
      title: 'Enrollment Test Course',
      slug: 'enrollment-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      is_published: true,
      created_by: teacherClient.userId,
    }).select().single();
    testCourseId = course.id;

    // Create test cohort
    const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Test Cohort',
      start_date: '2025-03-01',
      end_date: '2025-05-31',
      max_students: 2,
      status: 'active',
      created_by: teacherClient.userId,
    }).select().single();
    testCohortId = cohort.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Enrollment Creation', () => {
    test('should successfully enroll student in cohort', async () => {
      // Arrange
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.cohort_enrollment).toBeDefined();
      expect(result.cohort_enrollment.user_id).toBe(student1Client.userId);
      expect(result.cohort_enrollment.cohort_id).toBe(testCohortId);
      expect(result.cohort_enrollment.status).toBe('active');
    });

    test('should create both cohort_enrollment and course enrollment', async () => {
      // Arrange
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      // Assert
      expect(response.status).toBe(201);

      // Check cohort enrollment was created
      const { data: cohortEnrollment } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*')
        .eq('user_id', student1Client.userId)
        .eq('cohort_id', testCohortId)
        .single();

      expect(cohortEnrollment).toBeDefined();

      // Check course enrollment was created
      const { data: courseEnrollment } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .eq('user_id', student1Client.userId)
        .eq('course_id', testCourseId)
        .single();

      expect(courseEnrollment).toBeDefined();
      expect(courseEnrollment.cohort_id).toBe(testCohortId);
    });

    test('should prevent duplicate enrollment in same cohort', async () => {
      // Arrange - Enroll student once
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        status: 'active',
      });

      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act - Try to enroll again
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(result.error).toContain('Already enrolled');
    });

    test('should reject enrollment when unauthenticated', async () => {
      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(result.error).toContain('Not authenticated');
    });

    test('should reject enrollment when cohort ID is missing', async () => {
      // Arrange
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({})
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result.error).toContain('Cohort ID is required');
    });

    test('should reject enrollment when cohort does not exist', async () => {
      // Arrange
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: '00000000-0000-0000-0000-000000000000' })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(result.error).toContain('Cohort not found');
    });
  });

  describe('Capacity Management', () => {
    test('should reject enrollment when cohort is full', async () => {
      // Arrange - Fill cohort to capacity (max_students = 2)
      await supabaseAdmin.from('cohort_enrollments').insert([
        { cohort_id: testCohortId, user_id: student1Client.userId, status: 'active' },
        { cohort_id: testCohortId, user_id: student2Client.userId, status: 'active' },
      ]);

      // Create third student
      const { data: thirdUser } = await supabaseAdmin.auth.admin.createUser({
        email: 'student3temp@test.com',
        password: 'test123',
        email_confirm: true,
      });

      const thirdClient = await getAuthenticatedClient('student3temp@test.com', 'test123');
      const { data: { session } } = await thirdClient.client.auth.getSession();

      // Act - Try to enroll third student (exceeds capacity)
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(result.error).toContain('Cohort is full');
      expect(result.max_students).toBe(2);
      expect(result.current_enrollments).toBe(2);

      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser(thirdUser.user!.id);
    });

    test('should allow enrollment when under capacity', async () => {
      // Arrange - Only one student enrolled (max = 2)
      await supabaseAdmin.from('cohort_enrollments').insert({
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        status: 'active',
      });

      const { data: { session } } = await student2Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      // Assert
      expect(response.status).toBe(201);
    });

    test('should allow unlimited enrollment when max_students is null', async () => {
      // Arrange - Create cohort with unlimited capacity
      const { data: unlimitedCohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Unlimited Cohort',
        start_date: '2025-03-01',
        max_students: null,
        status: 'active',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: unlimitedCohort.id })
      });

      // Assert
      expect(response.status).toBe(201);
    });

    test('should prevent over-enrollment under concurrent requests', async () => {
      // Arrange - Create cohort with max 1 student to trigger race condition
      const { data: limitedCohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Concurrency Test Cohort',
        start_date: '2025-03-01',
        max_students: 1,
        status: 'active',
        created_by: teacherClient.userId,
      }).select().single();

      // Get sessions for both students
      const { data: { session: session1 } } = await student1Client.client.auth.getSession();
      const { data: { session: session2 } } = await student2Client.client.auth.getSession();

      // Act - Issue concurrent enrollment requests
      const [response1, response2] = await Promise.all([
        fetch('http://localhost:4321/api/enroll-cohort', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session1!.access_token}`
          },
          body: JSON.stringify({ cohortId: limitedCohort.id })
        }),
        fetch('http://localhost:4321/api/enroll-cohort', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session2!.access_token}`
          },
          body: JSON.stringify({ cohortId: limitedCohort.id })
        }),
      ]);

      // Assert - Exactly one should succeed, one should fail
      const statuses = [response1.status, response2.status].sort();

      // Verify enrollment count never exceeds max_students
      const { data: enrollments } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('*')
        .eq('cohort_id', limitedCohort.id)
        .in('status', ['active', 'paused']);

      expect(enrollments!.length).toBeLessThanOrEqual(1);

      // One request should succeed (201), one should fail (409)
      const successCount = [response1.status, response2.status].filter(s => s === 201).length;
      const failCount = [response1.status, response2.status].filter(s => s === 409).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);
    });
  });

  describe('Cohort Status Validation', () => {
    test('should allow enrollment in active cohort', async () => {
      // Cohort is already active from beforeEach
      const { data: { session } } = await student1Client.client.auth.getSession();

      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: testCohortId })
      });

      expect(response.status).toBe(201);
    });

    test('should allow enrollment in upcoming cohort', async () => {
      // Arrange - Create upcoming cohort
      const { data: upcomingCohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Upcoming Cohort',
        start_date: '2025-06-01',
        status: 'upcoming',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: upcomingCohort.id })
      });

      // Assert
      expect(response.status).toBe(201);
    });

    test('should reject enrollment in completed cohort', async () => {
      // Arrange - Create completed cohort
      const { data: completedCohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Completed Cohort',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        status: 'completed',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: completedCohort.id })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(result.error).toContain('not open for enrollment');
    });

    test('should reject enrollment in archived cohort', async () => {
      // Arrange - Create archived cohort
      const { data: archivedCohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: testCourseId,
        name: 'Archived Cohort',
        start_date: '2023-01-01',
        end_date: '2023-03-31',
        status: 'archived',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: archivedCohort.id })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(result.error).toContain('not open for enrollment');
    });
  });

  describe('Course Validation', () => {
    test('should reject enrollment when course is unpublished', async () => {
      // Arrange - Create unpublished course and cohort
      const { data: unpublishedCourse } = await supabaseAdmin.from('courses').insert({
        title: 'Unpublished Course',
        slug: 'unpublished-' + Date.now(),
        track: 'general',
        is_published: false,
        created_by: teacherClient.userId,
      }).select().single();

      const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
        course_id: unpublishedCourse.id,
        name: 'Test Cohort',
        start_date: '2025-03-01',
        status: 'active',
        created_by: teacherClient.userId,
      }).select().single();

      const { data: { session } } = await student1Client.client.auth.getSession();

      // Act
      const response = await fetch('http://localhost:4321/api/enroll-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({ cohortId: cohort.id })
      });

      const result = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(result.error).toContain('not available');
    });
  });
});

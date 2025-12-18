/**
 * Assignment Submission API Integration Tests
 *
 * Tests the assignment submission API including:
 * - Atomic submission creation via create_assignment_submission RPC
 * - Concurrent submission handling to prevent race conditions
 * - Error code mapping from database to API responses
 *
 * Reference: schema.sql create_assignment_submission function
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  cleanupTestData,
  getAuthenticatedClient,
  TEST_USERS
} from '../integration-setup';

describe('Assignment Submission API Integration Tests', () => {
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let testCourseId: number;
  let testModuleId: number;
  let testLessonId: number;
  let testAssignmentId: string;

  beforeAll(async () => {
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);
    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);
  });

  beforeEach(async () => {
    // Create test course
    const { data: course } = await supabaseAdmin.from('courses').insert({
      title: 'Assignment Test Course',
      slug: 'assignment-test-' + Date.now(),
      track: 'animal_advocacy',
      difficulty: 'beginner',
      is_published: true,
      created_by: teacherClient.userId,
    }).select().single();
    if (!course) throw new Error('Failed to create test course');
    testCourseId = course.id;

    // Create test module
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      title: 'Test Module',
      order_index: 1,
    }).select().single();
    if (!module) throw new Error('Failed to create test module');
    testModuleId = module.id;

    // Create test lesson
    const { data: lesson } = await supabaseAdmin.from('lessons').insert({
      module_id: testModuleId,
      title: 'Test Lesson',
      slug: 'test-lesson-' + Date.now(),
      order_index: 1,
    }).select().single();
    if (!lesson) throw new Error('Failed to create test lesson');
    testLessonId = lesson.id;

    // Enroll students in course
    await supabaseAdmin.from('enrollments').insert([
      { user_id: student1Client.userId, course_id: testCourseId, status: 'active' },
      { user_id: student2Client.userId, course_id: testCourseId, status: 'active' },
    ]);
  });

  afterEach(async () => {
    // Clean up assignment submissions first
    await supabaseAdmin.from('assignment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await cleanupTestData();
  });

  describe('Atomic Submission Creation (create_assignment_submission RPC)', () => {
    test('should create submission with correct submission_number', async () => {
      // Create assignment allowing resubmissions
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Resubmission Test Assignment',
        is_published: true,
        allow_resubmission: true,
        max_submissions: 3,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // First submission
      const { data: submission1, error: error1 } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file1.pdf',
        p_file_name: 'file1.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      expect(error1).toBeNull();
      expect(submission1.submission_number).toBe(1);

      // Second submission
      const { data: submission2, error: error2 } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file2.pdf',
        p_file_name: 'file2.pdf',
        p_file_size_bytes: 2048,
        p_file_type: 'pdf'
      });

      expect(error2).toBeNull();
      expect(submission2.submission_number).toBe(2);

      // Third submission
      const { data: submission3, error: error3 } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file3.pdf',
        p_file_name: 'file3.pdf',
        p_file_size_bytes: 3072,
        p_file_type: 'pdf'
      });

      expect(error3).toBeNull();
      expect(submission3.submission_number).toBe(3);
    });

    test('should reject submission when assignment not published', async () => {
      // Create unpublished assignment
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Unpublished Assignment',
        is_published: false,
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: assignment!.id,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file.pdf',
        p_file_name: 'file.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      expect(error).not.toBeNull();
      expect(error!.code).toBe('P0003');
      expect(error!.message).toContain('ASSIGNMENT_NOT_PUBLISHED');
    });

    test('should reject submission when past due and late submissions not allowed', async () => {
      // Create past-due assignment that doesn't allow late submissions
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Past Due Assignment',
        is_published: true,
        due_date: pastDate.toISOString(),
        allow_late_submissions: false,
        created_by: teacherClient.userId,
      }).select().single();

      const { error } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: assignment!.id,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file.pdf',
        p_file_name: 'file.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      expect(error).not.toBeNull();
      expect(error!.code).toBe('P0004');
      expect(error!.message).toContain('SUBMISSIONS_CLOSED');
    });

    test('should reject resubmission when not allowed', async () => {
      // Create assignment that doesn't allow resubmissions
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'No Resubmission Assignment',
        is_published: true,
        allow_resubmission: false,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // First submission should succeed
      const { error: error1 } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file1.pdf',
        p_file_name: 'file1.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      expect(error1).toBeNull();

      // Second submission should fail
      const { error: error2 } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file2.pdf',
        p_file_name: 'file2.pdf',
        p_file_size_bytes: 2048,
        p_file_type: 'pdf'
      });

      expect(error2).not.toBeNull();
      expect(error2!.code).toBe('P0005');
      expect(error2!.message).toContain('RESUBMISSION_NOT_ALLOWED');
    });

    test('should reject when max submissions reached', async () => {
      // Create assignment with max 2 submissions
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Limited Submissions Assignment',
        is_published: true,
        allow_resubmission: true,
        max_submissions: 2,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // First two submissions should succeed
      await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file1.pdf',
        p_file_name: 'file1.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file2.pdf',
        p_file_name: 'file2.pdf',
        p_file_size_bytes: 2048,
        p_file_type: 'pdf'
      });

      // Third submission should fail
      const { error } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/file3.pdf',
        p_file_name: 'file3.pdf',
        p_file_size_bytes: 3072,
        p_file_type: 'pdf'
      });

      expect(error).not.toBeNull();
      expect(error!.code).toBe('P0006');
      expect(error!.message).toContain('MAX_SUBMISSIONS_REACHED');
    });
  });

  describe('Concurrent Submission Handling', () => {
    test('should prevent over-submission under concurrent requests', async () => {
      // Create assignment with max 1 submission to trigger race condition
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Concurrent Test Assignment',
        is_published: true,
        allow_resubmission: false,
        max_submissions: 1,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // Issue concurrent submission requests from same user
      const submissionPromises = [
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student1Client.userId,
          p_file_url: '/test/file1.pdf',
          p_file_name: 'file1.pdf',
          p_file_size_bytes: 1024,
          p_file_type: 'pdf'
        }),
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student1Client.userId,
          p_file_url: '/test/file2.pdf',
          p_file_name: 'file2.pdf',
          p_file_size_bytes: 2048,
          p_file_type: 'pdf'
        }),
      ];

      const results = await Promise.all(submissionPromises);

      // Count successes and failures
      const successes = results.filter(r => !r.error).length;
      const failures = results.filter(r => r.error).length;

      // Exactly one should succeed, one should fail
      expect(successes).toBe(1);
      expect(failures).toBe(1);

      // Verify only one submission exists in database
      const { data: submissions } = await supabaseAdmin
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', testAssignmentId)
        .eq('user_id', student1Client.userId);

      expect(submissions).toHaveLength(1);
      expect(submissions![0].submission_number).toBe(1);
    });

    test('should handle concurrent submissions from different users correctly', async () => {
      // Create assignment allowing multiple users but max 1 submission each
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Multi-User Concurrent Assignment',
        is_published: true,
        allow_resubmission: false,
        max_submissions: 1,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // Issue concurrent submission requests from different users
      const submissionPromises = [
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student1Client.userId,
          p_file_url: '/test/student1.pdf',
          p_file_name: 'student1.pdf',
          p_file_size_bytes: 1024,
          p_file_type: 'pdf'
        }),
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student2Client.userId,
          p_file_url: '/test/student2.pdf',
          p_file_name: 'student2.pdf',
          p_file_size_bytes: 2048,
          p_file_type: 'pdf'
        }),
      ];

      const results = await Promise.all(submissionPromises);

      // Both should succeed since they're different users
      const successes = results.filter(r => !r.error).length;
      expect(successes).toBe(2);

      // Verify both submissions exist with submission_number=1
      const { data: student1Subs } = await supabaseAdmin
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', testAssignmentId)
        .eq('user_id', student1Client.userId);

      const { data: student2Subs } = await supabaseAdmin
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', testAssignmentId)
        .eq('user_id', student2Client.userId);

      expect(student1Subs).toHaveLength(1);
      expect(student1Subs![0].submission_number).toBe(1);

      expect(student2Subs).toHaveLength(1);
      expect(student2Subs![0].submission_number).toBe(1);
    });

    test('should correctly calculate submission_number under concurrent resubmissions', async () => {
      // Create assignment allowing multiple resubmissions
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Concurrent Resubmission Assignment',
        is_published: true,
        allow_resubmission: true,
        max_submissions: 5,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // Issue 3 concurrent submissions
      const submissionPromises = [
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student1Client.userId,
          p_file_url: '/test/file1.pdf',
          p_file_name: 'file1.pdf',
          p_file_size_bytes: 1024,
          p_file_type: 'pdf'
        }),
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student1Client.userId,
          p_file_url: '/test/file2.pdf',
          p_file_name: 'file2.pdf',
          p_file_size_bytes: 2048,
          p_file_type: 'pdf'
        }),
        supabaseAdmin.rpc('create_assignment_submission', {
          p_assignment_id: testAssignmentId,
          p_user_id: student1Client.userId,
          p_file_url: '/test/file3.pdf',
          p_file_name: 'file3.pdf',
          p_file_size_bytes: 3072,
          p_file_type: 'pdf'
        }),
      ];

      const results = await Promise.all(submissionPromises);

      // All should succeed (within max_submissions limit)
      const successes = results.filter(r => !r.error).length;
      expect(successes).toBe(3);

      // Verify submission numbers are unique and sequential
      const { data: submissions } = await supabaseAdmin
        .from('assignment_submissions')
        .select('submission_number')
        .eq('assignment_id', testAssignmentId)
        .eq('user_id', student1Client.userId)
        .order('submission_number', { ascending: true });

      expect(submissions).toHaveLength(3);

      // Each submission should have a unique number from 1 to 3
      const numbers = submissions!.map(s => s.submission_number);
      expect(new Set(numbers).size).toBe(3);
      expect(numbers.sort((a, b) => a - b)).toEqual([1, 2, 3]);
    });
  });

  describe('HTTP API Error Code Mapping (/api/assignments/{id}/submit)', () => {
    /**
     * Tests that HTTP POST requests to /api/assignments/{id}/submit
     * return the correct HTTP status codes and error codes as defined
     * in mapSubmissionError in src/pages/api/assignments/[id]/submit.ts
     */

    const API_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4321';

    /**
     * Helper to create a valid file payload for submission
     */
    function createTestFileFormData(filename = 'test.pdf'): FormData {
      const formData = new FormData();
      const fileContent = new Blob(['test file content'], { type: 'application/pdf' });
      formData.append('file', fileContent, filename);
      return formData;
    }

    test('should return 403 with MAX_SUBMISSIONS_REACHED when submission limit exceeded', async () => {
      // Create assignment with max_submissions=1
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'HTTP Max Submissions Test',
        is_published: true,
        allow_resubmission: true,
        max_submissions: 1,
        allowed_file_types: ['pdf'],
        max_file_size_mb: 10,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // Get student session for HTTP requests
      const { data: { session } } = await student1Client.client.auth.getSession();

      // First submission via RPC (to set up the state)
      await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/first.pdf',
        p_file_name: 'first.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      // Second submission via HTTP API should fail
      const formData = createTestFileFormData('second.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${testAssignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: formData
      });

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.code).toBe('MAX_SUBMISSIONS_REACHED');
      expect(result.error).toContain('Maximum submission limit');
    });

    test('should return 403 with RESUBMISSION_NOT_ALLOWED when resubmission disabled', async () => {
      // Create assignment with allow_resubmission=false
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'HTTP No Resubmission Test',
        is_published: true,
        allow_resubmission: false,
        allowed_file_types: ['pdf'],
        max_file_size_mb: 10,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // Get student session for HTTP requests
      const { data: { session } } = await student1Client.client.auth.getSession();

      // First submission via RPC
      await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: testAssignmentId,
        p_user_id: student1Client.userId,
        p_file_url: '/test/first.pdf',
        p_file_name: 'first.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      // Second submission via HTTP API should fail
      const formData = createTestFileFormData('second.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${testAssignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: formData
      });

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.code).toBe('RESUBMISSION_NOT_ALLOWED');
      expect(result.error).toContain('Resubmissions are not allowed');
    });

    test('should return 403 with ASSIGNMENT_NOT_PUBLISHED for unpublished assignment', async () => {
      // Create unpublished assignment
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'HTTP Unpublished Test',
        is_published: false,
        allowed_file_types: ['pdf'],
        max_file_size_mb: 10,
        created_by: teacherClient.userId,
      }).select().single();

      // Get student session for HTTP requests
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Submit to unpublished assignment via HTTP API
      const formData = createTestFileFormData('test.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignment!.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: formData
      });

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.code).toBe('ASSIGNMENT_NOT_PUBLISHED');
      expect(result.error).toContain('not available');
    });

    test('should return 403 with SUBMISSIONS_CLOSED for past-due assignment not allowing late submissions', async () => {
      // Create past-due assignment that doesn't allow late submissions
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'HTTP Past Due Test',
        is_published: true,
        due_date: pastDate.toISOString(),
        allow_late_submissions: false,
        allowed_file_types: ['pdf'],
        max_file_size_mb: 10,
        created_by: teacherClient.userId,
      }).select().single();

      // Get student session for HTTP requests
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Submit to past-due assignment via HTTP API
      const formData = createTestFileFormData('late.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignment!.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: formData
      });

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.code).toBe('SUBMISSIONS_CLOSED');
      expect(result.error).toContain('closed');
    });

    test('should return 404 with ASSIGNMENT_NOT_FOUND for non-existent assignment', async () => {
      // Get student session for HTTP requests
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Submit to non-existent assignment via HTTP API
      const nonExistentId = '00000000-0000-0000-0000-000000000999';
      const formData = createTestFileFormData('test.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${nonExistentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: formData
      });

      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.code).toBe('ASSIGNMENT_NOT_FOUND');
    });

    test('should return 401 when not authenticated', async () => {
      // Create a published assignment
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'HTTP Auth Test',
        is_published: true,
        allowed_file_types: ['pdf'],
        max_file_size_mb: 10,
        created_by: teacherClient.userId,
      }).select().single();

      // Submit without auth header
      const formData = createTestFileFormData('test.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignment!.id}/submit`, {
        method: 'POST',
        body: formData
      });

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toContain('Authentication required');
    });

    test('should return 201 on successful first submission', async () => {
      // Create a published assignment
      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'HTTP Success Test',
        is_published: true,
        allowed_file_types: ['pdf'],
        max_file_size_mb: 10,
        created_by: teacherClient.userId,
      }).select().single();
      if (!assignment) throw new Error('Failed to create test assignment');
      testAssignmentId = assignment.id;

      // Get student session for HTTP requests
      const { data: { session } } = await student1Client.client.auth.getSession();

      // Submit valid file via HTTP API
      const formData = createTestFileFormData('valid.pdf');
      const response = await fetch(`${API_BASE_URL}/api/assignments/${testAssignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: formData
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.submission_number).toBe(1);
    });
  });

  describe('Late Submission Tracking', () => {
    test('should mark submission as late when past due date', async () => {
      // Create past-due assignment allowing late submissions
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'Late Allowed Assignment',
        is_published: true,
        due_date: pastDate.toISOString(),
        allow_late_submissions: true,
        created_by: teacherClient.userId,
      }).select().single();

      const { data: submission, error } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: assignment!.id,
        p_user_id: student1Client.userId,
        p_file_url: '/test/late.pdf',
        p_file_name: 'late.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      expect(error).toBeNull();
      expect(submission.is_late).toBe(true);
    });

    test('should mark submission as on-time when before due date', async () => {
      // Create future-due assignment
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const { data: assignment } = await supabaseAdmin.from('assignments').insert({
        course_id: testCourseId,
        lesson_id: testLessonId,
        title: 'On-Time Assignment',
        is_published: true,
        due_date: futureDate.toISOString(),
        allow_late_submissions: true,
        created_by: teacherClient.userId,
      }).select().single();

      const { data: submission, error } = await supabaseAdmin.rpc('create_assignment_submission', {
        p_assignment_id: assignment!.id,
        p_user_id: student1Client.userId,
        p_file_url: '/test/ontime.pdf',
        p_file_name: 'ontime.pdf',
        p_file_size_bytes: 1024,
        p_file_type: 'pdf'
      });

      expect(error).toBeNull();
      expect(submission.is_late).toBe(false);
    });
  });
});

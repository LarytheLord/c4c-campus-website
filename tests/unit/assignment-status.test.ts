/**
 * Assignment Status Helper Unit Tests
 *
 * Tests both local-derivation behavior and server flag override behavior.
 */

import { describe, test, expect } from 'vitest';
import { getAssignmentStatus } from '@/lib/assignment-status';
import type { AssignmentWithSubmission } from '@/types/assignment';

// Helper to create a mock assignment
function createMockAssignment(
  overrides: Partial<AssignmentWithSubmission> = {}
): AssignmentWithSubmission {
  return {
    id: 'assignment-uuid-1',
    title: 'Test Assignment',
    description: null,
    instructions: null,
    max_points: 100,
    due_date: null,
    allow_late_submissions: false,
    late_penalty_percent: 10,
    allow_resubmission: false,
    max_submissions: 1,
    max_file_size_mb: 10,
    allowed_file_types: ['pdf', 'doc'],
    is_published: true,
    created_by: 'teacher-uuid',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    course_id: 1,
    module_id: null,
    lesson_id: null,
    user_submission: null,
    ...overrides,
  };
}

describe('getAssignmentStatus', () => {
  describe('Local derivation (no serverCanSubmit)', () => {
    test('should allow first submission when not past due', () => {
      const assignment = createMockAssignment({
        due_date: '2025-12-31T23:59:59Z',
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(true);
      expect(status.canResubmit).toBe(false);
      expect(status.hasSubmission).toBe(false);
    });

    test('should not allow submission when past due and late not allowed', () => {
      const assignment = createMockAssignment({
        due_date: '2025-01-01T00:00:00Z',
        allow_late_submissions: false,
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(false);
      expect(status.isClosed).toBe(true);
    });

    test('should allow late submission when past due but late allowed', () => {
      const assignment = createMockAssignment({
        due_date: '2025-01-01T00:00:00Z',
        allow_late_submissions: true,
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(true);
      expect(status.isLateButAllowed).toBe(true);
    });

    test('should allow resubmission when allowed and under limit', () => {
      const assignment = createMockAssignment({
        allow_resubmission: true,
        max_submissions: 3,
        user_submission: {
          id: 'sub-uuid',
          assignment_id: 'assignment-uuid-1',
          user_id: 'user-uuid',
          submission_number: 1,
          submission_text: null,
          file_url: 'path/to/file.pdf',
          file_name: 'file.pdf',
          file_size_bytes: 1024,
          file_type: 'application/pdf',
          file_urls: null,
          submitted_at: '2025-05-01T00:00:00Z',
          is_late: false,
          status: 'submitted',
          score: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
          rubric_scores: null,
          created_at: '2025-05-01T00:00:00Z',
          updated_at: '2025-05-01T00:00:00Z',
        },
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(true);
      expect(status.canResubmit).toBe(true);
      expect(status.hasSubmission).toBe(true);
    });

    test('should not allow resubmission when at max submissions', () => {
      const assignment = createMockAssignment({
        allow_resubmission: true,
        max_submissions: 1,
        user_submission: {
          id: 'sub-uuid',
          assignment_id: 'assignment-uuid-1',
          user_id: 'user-uuid',
          submission_number: 1,
          submission_text: null,
          file_url: 'path/to/file.pdf',
          file_name: 'file.pdf',
          file_size_bytes: 1024,
          file_type: 'application/pdf',
          file_urls: null,
          submitted_at: '2025-05-01T00:00:00Z',
          is_late: false,
          status: 'submitted',
          score: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
          rubric_scores: null,
          created_at: '2025-05-01T00:00:00Z',
          updated_at: '2025-05-01T00:00:00Z',
        },
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(false);
      expect(status.canResubmit).toBe(false);
    });
  });

  describe('Server flag override (serverCanSubmit provided)', () => {
    test('should use serverCanSubmit=true even when local derivation would say false', () => {
      // Assignment is past due and late not allowed (local would say canSubmit=false)
      const assignment = createMockAssignment({
        due_date: '2025-01-01T00:00:00Z',
        allow_late_submissions: false,
        serverCanSubmit: true, // Server says yes (maybe teacher override)
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(true);
    });

    test('should use serverCanSubmit=false even when local derivation would say true', () => {
      // Assignment is not past due (local would say canSubmit=true)
      const assignment = createMockAssignment({
        due_date: '2025-12-31T23:59:59Z',
        serverCanSubmit: false, // Server says no (maybe user not enrolled)
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(false);
    });

    test('should derive canResubmit from serverCanSubmit and hasSubmission', () => {
      const assignment = createMockAssignment({
        serverCanSubmit: true,
        user_submission: {
          id: 'sub-uuid',
          assignment_id: 'assignment-uuid-1',
          user_id: 'user-uuid',
          submission_number: 1,
          submission_text: null,
          file_url: 'path/to/file.pdf',
          file_name: 'file.pdf',
          file_size_bytes: 1024,
          file_type: 'application/pdf',
          file_urls: null,
          submitted_at: '2025-05-01T00:00:00Z',
          is_late: false,
          status: 'submitted',
          score: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
          rubric_scores: null,
          created_at: '2025-05-01T00:00:00Z',
          updated_at: '2025-05-01T00:00:00Z',
        },
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(true);
      expect(status.canResubmit).toBe(true); // Has submission + server says can submit
      expect(status.hasSubmission).toBe(true);
    });

    test('serverCanSubmit=false should set canResubmit=false even with existing submission', () => {
      const assignment = createMockAssignment({
        serverCanSubmit: false,
        user_submission: {
          id: 'sub-uuid',
          assignment_id: 'assignment-uuid-1',
          user_id: 'user-uuid',
          submission_number: 1,
          submission_text: null,
          file_url: 'path/to/file.pdf',
          file_name: 'file.pdf',
          file_size_bytes: 1024,
          file_type: 'application/pdf',
          file_urls: null,
          submitted_at: '2025-05-01T00:00:00Z',
          is_late: false,
          status: 'submitted',
          score: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
          rubric_scores: null,
          created_at: '2025-05-01T00:00:00Z',
          updated_at: '2025-05-01T00:00:00Z',
        },
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.canSubmit).toBe(false);
      expect(status.canResubmit).toBe(false);
    });
  });

  describe('Status badge computation', () => {
    test('should show "Not Submitted" for open assignment without submission', () => {
      const assignment = createMockAssignment();
      const status = getAssignmentStatus(assignment);

      expect(status.statusLabel).toBe('Not Submitted');
      expect(status.badgeVariant).toBe('blue');
    });

    test('should show "Closed" for past due assignment without submission', () => {
      const assignment = createMockAssignment({
        due_date: '2025-01-01T00:00:00Z',
        allow_late_submissions: false,
      });

      const status = getAssignmentStatus(assignment, new Date('2025-06-01'));

      expect(status.statusLabel).toBe('Closed');
      expect(status.badgeVariant).toBe('red');
    });

    test('should show "Submitted" for submitted assignment', () => {
      const assignment = createMockAssignment({
        user_submission: {
          id: 'sub-uuid',
          assignment_id: 'assignment-uuid-1',
          user_id: 'user-uuid',
          submission_number: 1,
          submission_text: null,
          file_url: 'path/to/file.pdf',
          file_name: 'file.pdf',
          file_size_bytes: 1024,
          file_type: 'application/pdf',
          file_urls: null,
          submitted_at: '2025-05-01T00:00:00Z',
          is_late: false,
          status: 'submitted',
          score: null,
          feedback: null,
          graded_by: null,
          graded_at: null,
          rubric_scores: null,
          created_at: '2025-05-01T00:00:00Z',
          updated_at: '2025-05-01T00:00:00Z',
        },
      });

      const status = getAssignmentStatus(assignment);

      expect(status.statusLabel).toBe('Submitted');
      expect(status.badgeVariant).toBe('green');
    });

    test('should show grade for graded assignment', () => {
      const assignment = createMockAssignment({
        max_points: 100,
        user_submission: {
          id: 'sub-uuid',
          assignment_id: 'assignment-uuid-1',
          user_id: 'user-uuid',
          submission_number: 1,
          submission_text: null,
          file_url: 'path/to/file.pdf',
          file_name: 'file.pdf',
          file_size_bytes: 1024,
          file_type: 'application/pdf',
          file_urls: null,
          submitted_at: '2025-05-01T00:00:00Z',
          is_late: false,
          status: 'graded',
          score: 95,
          feedback: 'Great work!',
          graded_by: 'teacher-uuid',
          graded_at: '2025-05-02T00:00:00Z',
          rubric_scores: null,
          created_at: '2025-05-01T00:00:00Z',
          updated_at: '2025-05-02T00:00:00Z',
        },
      });

      const status = getAssignmentStatus(assignment);

      expect(status.statusLabel).toBe('Graded: 95/100');
      expect(status.badgeVariant).toBe('green'); // >= 90%
      expect(status.scorePercentage).toBe(95);
    });
  });
});

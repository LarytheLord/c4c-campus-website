/**
 * Assignment System TypeScript Types
 * NOTE: Must match schema.sql assignments and assignment_submissions tables
 *
 * NOTE: These types are thin wrappers over the Supabase-generated types in ./generated.ts
 * When modifying types, ensure they remain compatible with the generated schema types.
 * Run `npm run db:types` to regenerate types from the database schema.
 */

import type {
  AssignmentRow,
  AssignmentSubmissionRow,
} from './generated';

/**
 * Assignment - matches schema.sql assignments table
 *
 * Extends AssignmentRow with required created_by field in application context.
 */
export interface Assignment extends Omit<AssignmentRow, 'created_by'> {
  created_by: string; // UUID - required in application context
}

/**
 * Submission - matches schema.sql assignment_submissions table
 * Supports both single file (file_url, file_name, etc.) and multi-file (file_urls) approaches
 *
 * Extends AssignmentSubmissionRow with typed rubric_scores object.
 */
export interface Submission extends Omit<AssignmentSubmissionRow, 'rubric_scores' | 'status'> {
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  rubric_scores: Record<string, number> | null; // Typed JSONB structure
}

/**
 * NOTE: SubmissionHistory table does not exist in schema.sql.
 * This interface is kept for potential future use but is not backed by a database table.
 * If implementing submission history tracking, add corresponding table to schema.sql first.
 * @deprecated Not yet implemented in database schema
 */
export interface SubmissionHistory {
  id: number;
  submission_id: string; // Should be UUID to match assignment_submissions.id
  assignment_id: string; // Should be UUID to match assignments.id
  user_id: string; // UUID
  action: string;
  performed_by: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Assignment with user submission data.
 * Optionally includes serverCanSubmit flag from can_user_submit RPC.
 */
export interface AssignmentWithSubmission extends Assignment {
  user_submission: Submission | null;
  /**
   * Server-provided flag from can_user_submit RPC.
   * When present, this is the authoritative source for whether submission is allowed.
   * API handlers can include this field to ensure UI stays aligned with server rules.
   */
  serverCanSubmit?: boolean;
}

/**
 * Assignment with nested lesson, module, and course data from Supabase joins.
 * Used in assignment list and detail pages to display course context.
 */
export interface AssignmentWithCourse extends AssignmentWithSubmission {
  // Nested relationships from Supabase query with select('*, lessons(...)')
  lessons?: {
    id: number;
    title?: string;
    modules?: {
      id: number;
      title?: string;
      courses?: {
        id: number;
        title?: string;
        created_by?: string;
      };
    };
  } | null;

  // Derived display fields (computed from nested data)
  course_name?: string;
  lesson_name?: string;

  // Legacy/optional fields accessed in UI but may not be populated
  // Note: grading_rubric is stored in assignment_rubrics table but may be accessed as if joined
  grading_rubric?: any; // JSONB or array of rubric items, if fetched
}

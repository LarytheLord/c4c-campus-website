/**
 * Assignment System TypeScript Types
 */

export interface Assignment {
  id: string; // UUID
  course_id: number;
  module_id: number | null;
  lesson_id: number | null;
  title: string;
  description: string | null;
  instructions: string | null;
  max_points: number;
  due_date: string | null;
  allow_late_submissions: boolean;
  late_penalty_percent: number;
  max_file_size_mb: number;
  allowed_file_types: string[];
  is_published: boolean;
  created_by: string; // UUID
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string; // UUID
  assignment_id: string; // UUID
  user_id: string; // UUID
  submission_text: string | null;
  file_urls: string[];
  submitted_at: string;
  is_late: boolean;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  score: number | null;
  feedback: string | null;
  graded_by: string | null; // UUID
  graded_at: string | null;
  rubric_scores: any | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionHistory {
  id: number;
  submission_id: number;
  assignment_id: number;
  user_id: string;
  action: string;
  performed_by: string | null;
  details: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AssignmentWithSubmission extends Assignment {
  user_submission: Submission | null;
}

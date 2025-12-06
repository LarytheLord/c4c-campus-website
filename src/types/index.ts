// TypeScript Type Definitions - E-Learning Platform
// Reference: BOOTCAMP_ARCHITECTURE.md lines 193-290 (database schema)

/**
 * Course - Top-level content container
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 194-207
 */
export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  track: 'animal_advocacy' | 'climate' | 'ai_safety' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  is_cohort_based: boolean;
  default_duration_weeks: number;
  enrollment_type: 'open' | 'cohort_only' | 'hybrid';
  created_by: string; // UUID
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Module - Groups of lessons within a course
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 214-221
 */
export interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Lesson - Individual video/content unit
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 226-248
 */
export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean;
  resources: Resource[];
  created_at: string;
  updated_at: string;
}

/**
 * Resource - Downloadable file metadata
 * Stored as JSONB in lessons.resources column
 */
export interface Resource {
  name: string;
  path: string; // Supabase Storage path
  url?: string; // Public/signed URL for direct access
  size: number; // bytes
}

/**
 * Enrollment - User-course relationship
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 253-262
 */
export interface Enrollment {
  id: number;
  user_id: string; // UUID
  course_id: number;
  cohort_id: string | null; // UUID
  enrolled_at: string;
  completed_at: string | null;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  progress_percentage: number;
}

/**
 * LessonProgress - Video resume + completion tracking
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 268-286
 */
export interface LessonProgress {
  id: number;
  user_id: string; // UUID
  lesson_id: number;
  cohort_id: string | null; // UUID
  completed: boolean;
  video_position_seconds: number;
  time_spent_seconds: number;
  last_accessed_at: string;
  created_at: string;
}

/**
 * API Response Format
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 472-481
 */
export interface APIResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
}

/**
 * Course Progress Summary
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 420-434
 */
export interface CourseProgress {
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
  time_spent_hours: number;
  time_spent_seconds: number;
  total_watch_count: number;
  next_lesson: {
    id: number;
    name: string;
    slug: string;
    completed: boolean;
  } | null;
  status?: 'active' | 'completed';
}

/**
 * Validation Result
 * Used by validateCourseInput() and similar validators
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

/**
 * Enrollment Check Result
 * Used by checkEnrollment()
 */
export interface EnrollmentCheck {
  enrolled: boolean;
  enrollment: Enrollment | null;
}

/**
 * Cohort - Time-gated learning groups
 * Reference: schema.sql lines 378-390
 */
export interface Cohort {
  id: string; // UUID
  course_id: number;
  name: string;
  start_date: string; // ISO date string
  end_date: string | null;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  max_students: number | null;
  created_by: string; // UUID
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Cohort Enrollment - Students enrolled in specific cohorts
 * Reference: schema.sql
 */
export interface CohortEnrollment {
  id: string; // UUID
  cohort_id: string; // UUID
  user_id: string; // UUID
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  completed_lessons: number;
  last_activity_at: string;
  created_at: string;
}

/**
 * Cohort Schedule - Module unlock dates for cohorts
 * Reference: schema.sql
 */
export interface CohortSchedule {
  id: string; // UUID
  cohort_id: string; // UUID
  module_id: number;
  unlock_date: string; // ISO date string
  lock_date: string | null; // ISO date string
  created_at: string;
}

/**
 * Student with Progress - Extended student info with progress data
 * Used by teacher dashboard to track student performance
 */
export interface StudentWithProgress {
  user_id: string;
  name: string;
  email: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
  last_activity_at: string;
  time_spent_hours: number;
  is_struggling?: boolean; // Less than 20% completion or inactive > 7 days
  days_since_activity: number;
}

/**
 * Cohort Analytics - Aggregated statistics for a cohort
 * Used by teacher dashboard overview
 */
export interface CohortAnalytics {
  cohort_id: number;
  cohort_name: string;
  course_name: string;
  total_students: number;
  active_students: number;
  completed_students: number;
  dropped_students: number;
  average_completion_percentage: number;
  average_time_spent_hours: number;
  struggling_students_count: number;
  engagement_rate: number; // Active in last 7 days
  total_lessons: number;
  most_completed_lesson_id: number | null;
  least_completed_lesson_id: number | null;
  start_date: string;
  end_date: string | null;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
}

/**
 * Progress Over Time - Time-series data for charts
 * Used by ProgressChart component
 */
export interface ProgressOverTime {
  date: string; // ISO date
  completed_lessons: number;
  active_students: number;
  new_enrollments: number;
  average_completion_rate: number;
}

/**
 * Leaderboard Entry - Top performing students
 * Used by Leaderboard component
 */
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  completed_lessons: number;
  completion_percentage: number;
  time_spent_hours: number;
  last_activity_at: string;
}

/**
 * Dashboard Export Data - CSV export format
 * Used by export functionality
 */
export interface DashboardExportData {
  student_name: string;
  email: string;
  enrolled_date: string;
  status: string;
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
  time_spent_hours: number;
  last_activity_date: string;
  days_since_activity: number;
}

/**
 * Lesson Discussion - Threaded comments on lessons
 * Reference: tests/integration/discussion-schema.test.ts
 */
export interface LessonDiscussion {
  id: string; // UUID
  lesson_id: number;
  cohort_id: string; // UUID
  user_id: string; // UUID
  parent_id: string | null; // UUID for threaded replies
  content: string;
  is_teacher_response: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Course Forum Post - General discussion topics
 * Reference: tests/integration/discussion-schema.test.ts
 */
export interface CourseForumPost {
  id: string; // UUID
  course_id: number;
  cohort_id: string; // UUID
  user_id: string; // UUID
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Forum Reply - Replies to forum posts
 * Reference: tests/integration/discussion-schema.test.ts
 */
export interface ForumReply {
  id: string; // UUID
  forum_post_id: string; // UUID
  user_id: string; // UUID
  content: string;
  is_teacher_response: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User Profile - Basic user information for display
 * Used in discussion components
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_teacher?: boolean;
}
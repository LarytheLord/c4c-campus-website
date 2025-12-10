/**
 * Mock enrollment and progress data for API handler tests
 * Used by checkEnrollment() and calculateCourseProgress() in unit tests
 */

import type { Enrollment, LessonProgress } from '@/types';

// Mock enrollments database
export const mockEnrollmentsDB: Enrollment[] = [
  // Active enrollment - userId ending in 0000, courseId 1
  {
    id: 1,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    course_id: 1,
    enrolled_at: '2025-01-21T00:00:00Z',
    status: 'active',
    completed_at: null,
  },
  // Dropped enrollment - userId ending in 0001, courseId 1
  {
    id: 2,
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    course_id: 1,
    enrolled_at: '2025-01-22T00:00:00Z',
    status: 'dropped',
    completed_at: null,
  },
  // Completed enrollment - userId ending in 0002, courseId 1
  {
    id: 3,
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    course_id: 1,
    enrolled_at: '2025-01-15T00:00:00Z',
    status: 'completed',
    completed_at: '2025-01-28T00:00:00Z',
  },
  // Just enrolled, no progress - userId ending in 0003, courseId 1
  {
    id: 4,
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    course_id: 1,
    enrolled_at: '2025-01-27T00:00:00Z',
    status: 'active',
    completed_at: null,
  },
  // Active enrollment in course 2 (12 lessons)
  {
    id: 5,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    course_id: 2,
    enrolled_at: '2025-01-23T00:00:00Z',
    status: 'active',
    completed_at: null,
  },
  // Active enrollment in course 3 (3 lessons)
  {
    id: 6,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    course_id: 3,
    enrolled_at: '2025-01-24T00:00:00Z',
    status: 'active',
    completed_at: null,
  },
  // Active enrollment in empty course 99
  {
    id: 7,
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    course_id: 99,
    enrolled_at: '2025-01-25T00:00:00Z',
    status: 'active',
    completed_at: null,
  },
];

// Mock lesson progress database
export const mockLessonProgressDB: LessonProgress[] = [
  // Course 1 (10 lessons total): User 0000 has completed 5 lessons (lessons 1-5)
  { id: 1, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 1, video_position_seconds: 420, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-22T10:00:00Z', completed_at: '2025-01-22T10:00:00Z' },
  { id: 2, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 2, video_position_seconds: 600, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-23T10:00:00Z', completed_at: '2025-01-23T10:00:00Z' },
  { id: 3, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 3, video_position_seconds: 900, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-24T10:00:00Z', completed_at: '2025-01-24T10:00:00Z' },
  { id: 4, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 4, video_position_seconds: 540, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-25T10:00:00Z', completed_at: '2025-01-25T10:00:00Z' },
  { id: 5, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 5, video_position_seconds: 720, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-26T10:00:00Z', completed_at: '2025-01-26T10:00:00Z' },
  // Lesson 6 is not started (first incomplete lesson)

  // Course 1 (10 lessons total): User 0002 has completed ALL 10 lessons
  { id: 11, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 1, video_position_seconds: 420, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-20T10:00:00Z', completed_at: '2025-01-20T10:00:00Z' },
  { id: 12, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 2, video_position_seconds: 600, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-21T10:00:00Z', completed_at: '2025-01-21T10:00:00Z' },
  { id: 13, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 3, video_position_seconds: 900, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-22T10:00:00Z', completed_at: '2025-01-22T10:00:00Z' },
  { id: 14, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 4, video_position_seconds: 540, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-23T10:00:00Z', completed_at: '2025-01-23T10:00:00Z' },
  { id: 15, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 5, video_position_seconds: 720, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-24T10:00:00Z', completed_at: '2025-01-24T10:00:00Z' },
  { id: 16, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 6, video_position_seconds: 480, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-25T10:00:00Z', completed_at: '2025-01-25T10:00:00Z' },
  { id: 17, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 7, video_position_seconds: 660, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-26T10:00:00Z', completed_at: '2025-01-26T10:00:00Z' },
  { id: 18, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 8, video_position_seconds: 420, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-27T10:00:00Z', completed_at: '2025-01-27T10:00:00Z' },
  { id: 19, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 9, video_position_seconds: 540, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-28T10:00:00Z', completed_at: '2025-01-28T10:00:00Z' },
  { id: 20, user_id: '550e8400-e29b-41d4-a716-446655440002', lesson_id: 10, video_position_seconds: 600, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-28T12:00:00Z', completed_at: '2025-01-28T12:00:00Z' },

  // Course 2 (12 lessons total): User 0000 has completed 1 lesson (lesson 11)
  { id: 21, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 11, video_position_seconds: 720, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-23T14:00:00Z', completed_at: '2025-01-23T14:00:00Z' },

  // Course 3 (3 lessons total): User 0000 has completed 1 lesson (lesson 23)
  { id: 22, user_id: '550e8400-e29b-41d4-a716-446655440000', lesson_id: 23, video_position_seconds: 540, completed: true, time_spent_seconds: 1800, watch_count: 1, last_accessed_at: '2025-01-24T16:00:00Z', completed_at: '2025-01-24T16:00:00Z' },
];

// Mock course lessons mapping (courseId -> lesson IDs)
export const mockCourseLessons: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 10 lessons
  2: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], // 12 lessons
  3: [23, 24, 25], // 3 lessons
  99: [], // Empty course (in development)
};

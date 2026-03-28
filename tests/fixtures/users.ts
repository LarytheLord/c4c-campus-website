/**
 * User, Enrollment, and Progress test fixtures
 * Schema from BOOTCAMP_ARCHITECTURE.md lines 252-290
 */

// Student user (approved, has enrollments)
export const mockStudent = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'student@test.com',
  role: 'student',
  email_confirmed_at: '2025-01-20T00:00:00Z',
  created_at: '2025-01-20T00:00:00Z',
};

// Teacher user (creates courses)
export const mockTeacher = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'teacher@test.com',
  role: 'teacher',
  email_confirmed_at: '2025-01-19T00:00:00Z',
  created_at: '2025-01-19T00:00:00Z',
};

// Admin user (approves students, manages platform)
export const mockAdmin = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  email: 'admin@test.com',
  role: 'admin',
  email_confirmed_at: '2025-01-18T00:00:00Z',
  created_at: '2025-01-18T00:00:00Z',
};

// Student without enrollments (for testing "not enrolled" scenarios)
export const mockStudentNotEnrolled = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  email: 'newstudent@test.com',
  role: 'student',
  email_confirmed_at: '2025-01-25T00:00:00Z',
  created_at: '2025-01-25T00:00:00Z',
};

// Enrollment: Student enrolled in Course 1 (active)
export const mockEnrollment = {
  id: 1,
  user_id: mockStudent.id,
  course_id: 1, // mockCourse from courses.ts
  enrolled_at: '2025-01-21T00:00:00Z',
  status: 'active',
  completed_at: null,
};

// Enrollment: Student completed Course 1
export const mockEnrollmentCompleted = {
  id: 2,
  user_id: mockStudent.id,
  course_id: 1,
  enrolled_at: '2025-01-15T00:00:00Z',
  status: 'completed',
  completed_at: '2025-01-28T00:00:00Z',
};

// Enrollment: Student dropped Course 2
export const mockEnrollmentDropped = {
  id: 3,
  user_id: mockStudent.id,
  course_id: 2,
  enrolled_at: '2025-01-22T00:00:00Z',
  status: 'dropped',
  completed_at: null,
};

// Lesson Progress: Student watched Lesson 1 completely
export const mockProgressCompleted = {
  id: 1,
  user_id: mockStudent.id,
  lesson_id: 1, // mockLesson from courses.ts
  video_position_seconds: 420, // Watched all 7min (duration: 420s)
  completed: true,
  time_spent_seconds: 450, // 7.5min (re-watched some parts)
  watch_count: 2,
  last_accessed_at: '2025-01-22T10:37:00Z',
  completed_at: '2025-01-22T10:37:00Z',
};

// Lesson Progress: Student partially watched Lesson 2 (paused at 5min)
export const mockProgressPartial = {
  id: 2,
  user_id: mockStudent.id,
  lesson_id: 2, // mockLesson2 from courses.ts (duration: 600s = 10min)
  video_position_seconds: 300, // Paused at 5min
  completed: false,
  time_spent_seconds: 315, // Watched 5min 15s (some rewinding)
  watch_count: 1,
  last_accessed_at: '2025-01-23T14:22:00Z',
  completed_at: null,
};

// Lesson Progress: Student just started Lesson 3 (10 seconds in)
export const mockProgressJustStarted = {
  id: 3,
  user_id: mockStudent.id,
  lesson_id: 3, // mockLesson3 from courses.ts
  video_position_seconds: 10,
  completed: false,
  time_spent_seconds: 12,
  watch_count: 1,
  last_accessed_at: '2025-01-24T09:05:00Z',
  completed_at: null,
};

// Array of all enrollments for student (for dashboard tests)
export const mockEnrollments = [
  mockEnrollment,
  mockEnrollmentCompleted,
  mockEnrollmentDropped,
];

// Array of all progress for student (for dashboard tests)
export const mockProgress = [
  mockProgressCompleted,
  mockProgressPartial,
  mockProgressJustStarted,
];

// Combined enrollment with progress (for dashboard aggregation tests)
export const mockEnrollmentWithProgress = {
  enrollment: mockEnrollment,
  course: {
    id: 1,
    title: 'n8n Workflow Automation Basics',
    slug: 'n8n-basics',
    thumbnail_url: 'thumbnails/course-1-n8n-basics.jpg',
  },
  progress: {
    completed_lessons: 1, // mockProgressCompleted
    total_lessons: 3, // mockLesson, mockLesson2, mockLesson3
    percentage: 33, // 1/3 = 33%
    time_spent_hours: 0.21, // 777s / 3600 = 0.215 hours
    next_lesson: {
      id: 2,
      title: 'Installing n8n',
      slug: 'installing-n8n',
    },
  },
};

// API Response fixtures (from BOOTCAMP_ARCHITECTURE.md lines 472-481)
export const mockAPISuccess = <T>(data: T) => ({
  data,
  error: null,
});

export const mockAPIError = (code: string, message: string) => ({
  data: null,
  error: { code, message },
});

// Common error responses
export const AUTH_REQUIRED = mockAPIError('AUTH_REQUIRED', 'Please log in');
export const FORBIDDEN = mockAPIError('FORBIDDEN', 'Access denied');
export const NOT_FOUND = mockAPIError('NOT_FOUND', 'Resource not found');
export const VALIDATION_ERROR = mockAPIError('VALIDATION_ERROR', 'Invalid input');
export const NOT_ENROLLED = mockAPIError('NOT_ENROLLED', 'You must enroll in this course first');
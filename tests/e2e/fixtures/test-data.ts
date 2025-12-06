/**
 * Test data fixtures for E2E tests
 * Provides sample data for courses, users, and other entities
 */

export interface TestCourse {
  name: string;
  slug: string;
  description: string;
  track: 'animal-advocacy' | 'climate' | 'ai-safety' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
}

export interface TestLesson {
  name: string;
  description: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
}

export interface TestApplication {
  name: string;
  email: string;
  track: string;
  experience_level: string;
  motivation: string;
}

/**
 * Sample test courses
 */
export const TEST_COURSES: TestCourse[] = [
  {
    name: 'E2E Test Course - Automation Basics',
    slug: 'e2e-automation-basics',
    description: 'Learn the fundamentals of workflow automation for animal advocacy',
    track: 'animal-advocacy',
    difficulty: 'beginner',
    estimated_hours: 5,
  },
  {
    name: 'E2E Test Course - Advanced Climate Tech',
    slug: 'e2e-climate-tech-advanced',
    description: 'Advanced techniques for climate technology and advocacy',
    track: 'climate',
    difficulty: 'advanced',
    estimated_hours: 10,
  },
];

/**
 * Sample test lessons
 */
export const TEST_LESSONS: TestLesson[] = [
  {
    name: 'Introduction to Automation',
    description: 'Understanding automation fundamentals',
    duration_minutes: 15,
    order_index: 0,
  },
  {
    name: 'Building Your First Workflow',
    description: 'Create a simple automation workflow',
    duration_minutes: 20,
    order_index: 1,
  },
  {
    name: 'Advanced Techniques',
    description: 'Learn advanced automation patterns',
    duration_minutes: 25,
    order_index: 2,
  },
];

/**
 * Sample test application
 */
export const TEST_APPLICATION: TestApplication = {
  name: 'E2E Test Applicant',
  email: 'e2e-applicant@test.c4c.dev',
  track: 'animal-advocacy',
  experience_level: 'beginner',
  motivation:
    'I am passionate about using technology to help animals and want to learn how to build effective advocacy tools.',
};

/**
 * Generate random email for testing
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `e2e-test-${timestamp}-${random}@test.c4c.dev`;
}

/**
 * Generate random course name
 */
export function generateTestCourseName(): string {
  const timestamp = Date.now();
  return `E2E Test Course ${timestamp}`;
}

/**
 * Wait for a specific time (use sparingly)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

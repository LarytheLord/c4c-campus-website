import { describe, test, expect, beforeEach } from 'vitest';
import { 
  validateCourseInput, 
  checkEnrollment, 
  calculateCourseProgress 
} from '@/lib/api-handlers';
import type { Course, Enrollment, LessonProgress } from '@/types';

// API handler unit tests - business logic validation
// Reference: BOOTCAMP_ARCHITECTURE.md lines 1074-1076

describe('validateCourseInput', () => {
  // Happy path - valid course data
  test('should return valid when all required fields present', () => {
    // Arrange
    const input = {
      name: 'n8n Workflow Automation',
      slug: 'n8n-basics',
      description: 'Learn n8n from scratch',
      track: 'animal-advocacy' as const,
      difficulty: 'beginner' as const,
      estimated_hours: 8,
    };

    // Act
    const result = validateCourseInput(input);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // Error case - missing required fields
  test('should return errors when name missing', () => {
    // Arrange
    const input = {
      slug: 'n8n-basics',
      track: 'animal-advocacy',
      difficulty: 'beginner',
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  test('should return errors when slug missing', () => {
    // Arrange
    const input = {
      name: 'n8n Workflow Automation',
      track: 'animal-advocacy',
      difficulty: 'beginner',
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Slug is required');
  });

  // Edge case - invalid track value
  test('should return error when track invalid', () => {
    // Arrange
    const input = {
      name: 'Test Course',
      slug: 'test',
      track: 'invalid-track', // Not in CHECK constraint
      difficulty: 'beginner',
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Track must be one of: animal-advocacy, climate, ai-safety, general'
    );
  });

  // Edge case - invalid difficulty value
  test('should return error when difficulty invalid', () => {
    // Arrange
    const input = {
      name: 'Test Course',
      slug: 'test',
      track: 'animal-advocacy',
      difficulty: 'expert', // Not in CHECK constraint
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Difficulty must be one of: beginner, intermediate, advanced'
    );
  });

  // Edge case - negative estimated_hours
  test('should return error when estimated_hours negative', () => {
    // Arrange
    const input = {
      name: 'Test Course',
      slug: 'test',
      track: 'animal-advocacy',
      difficulty: 'beginner',
      estimated_hours: -5,
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Estimated hours must be positive');
  });

  // Edge case - non-integer estimated_hours
  test('should return error when estimated_hours not integer', () => {
    // Arrange
    const input = {
      name: 'Test Course',
      slug: 'test',
      track: 'animal-advocacy',
      difficulty: 'beginner',
      estimated_hours: 5.5,
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Estimated hours must be an integer');
  });

  // Edge case - multiple validation errors
  test('should return all validation errors when multiple fields invalid', () => {
    // Arrange
    const input = {
      track: 'invalid',
      difficulty: 'expert',
      estimated_hours: -3,
    };

    // Act
    const result = validateCourseInput(input as any);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Name is required',
        'Slug is required',
        expect.stringContaining('Track must be'),
      ])
    );
  });

  // Edge case - XSS prevention in name/description
  test('should sanitize HTML in name field', () => {
    // Arrange
    const input = {
      name: '<script>alert("xss")</script>Test',
      slug: 'test',
      description: '<img src=x onerror=alert(1)>',
      track: 'animal-advocacy' as const,
      difficulty: 'beginner' as const,
    };

    // Act
    const result = validateCourseInput(input);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBeDefined();
    expect(result.sanitized!.name).not.toContain('<script>');
    expect(result.sanitized!.description).not.toContain('onerror=');
  });
});

describe('checkEnrollment', () => {
  // Happy path - student enrolled in course
  test('should return enrolled true when student enrolled in course', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1;

    // Act
    const result = await checkEnrollment(userId, courseId);

    // Assert
    expect(result.enrolled).toBe(true);
    expect(result.enrollment).toBeDefined();
    expect(result.enrollment?.user_id).toBe(userId);
    expect(result.enrollment?.course_id).toBe(courseId);
    expect(result.enrollment?.status).toBe('active');
  });

  // Error case - student not enrolled
  test('should return enrolled false when student not enrolled', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 999; // Course student not enrolled in

    // Act
    const result = await checkEnrollment(userId, courseId);

    // Assert
    expect(result.enrolled).toBe(false);
    expect(result.enrollment).toBeNull();
  });

  // Edge case - enrollment exists but status is 'dropped'
  test('should return enrolled false when enrollment dropped', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440001'; // mockDroppedStudent
    const courseId = 1;

    // Act
    const result = await checkEnrollment(userId, courseId);

    // Assert
    expect(result.enrolled).toBe(false);
    expect(result.enrollment?.status).toBe('dropped');
  });

  // Edge case - enrollment exists but status is 'completed'
  test('should return enrolled true when enrollment completed', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440002'; // mockCompletedStudent
    const courseId = 1;

    // Act
    const result = await checkEnrollment(userId, courseId);

    // Assert
    expect(result.enrolled).toBe(true);
    expect(result.enrollment?.status).toBe('completed');
  });

  // Error case - invalid userId format
  test('should throw error when userId invalid UUID format', async () => {
    // Arrange
    const invalidUserId = 'not-a-uuid';
    const courseId = 1;

    // Act & Assert
    await expect(checkEnrollment(invalidUserId, courseId)).rejects.toThrow(
      'Invalid user ID format'
    );
  });

  // Error case - invalid courseId (negative)
  test('should throw error when courseId negative', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = -1;

    // Act & Assert
    await expect(checkEnrollment(userId, courseId)).rejects.toThrow(
      'Invalid course ID'
    );
  });

  // Error case - invalid courseId (non-integer)
  test('should throw error when courseId not integer', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1.5;

    // Act & Assert
    await expect(checkEnrollment(userId, courseId)).rejects.toThrow(
      'Course ID must be an integer'
    );
  });

  // Error case - null/undefined inputs
  test('should throw error when userId null', async () => {
    // Arrange
    const userId = null;
    const courseId = 1;

    // Act & Assert
    await expect(checkEnrollment(userId as any, courseId)).rejects.toThrow(
      'User ID is required'
    );
  });

  test('should throw error when courseId null', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = null;

    // Act & Assert
    await expect(checkEnrollment(userId, courseId as any)).rejects.toThrow(
      'Course ID is required'
    );
  });
});

describe('calculateCourseProgress', () => {
  // Happy path - 50% completion (5 of 10 lessons)
  test('should return 50% when 5 of 10 lessons completed', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.completed_lessons).toBe(5);
    expect(result.total_lessons).toBe(10);
    expect(result.percentage).toBe(50);
    expect(result.time_spent_hours).toBeCloseTo(2.5, 1); // 9000 seconds = 2.5 hours
  });

  // Happy path - 100% completion
  test('should return 100% when all lessons completed', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440002'; // mockCompletedStudent
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.completed_lessons).toBe(10);
    expect(result.total_lessons).toBe(10);
    expect(result.percentage).toBe(100);
    expect(result.status).toBe('completed');
  });

  // Happy path - 0% completion (enrolled but not started)
  test('should return 0% when enrolled but no lessons started', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440003'; // Just enrolled, no progress
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.completed_lessons).toBe(0);
    expect(result.total_lessons).toBe(10);
    expect(result.percentage).toBe(0);
    expect(result.time_spent_hours).toBe(0);
  });

  // Edge case - partial progress (1 of 12 lessons = 8%)
  test('should return 8% when 1 of 12 lessons completed', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 2; // Course with 12 lessons

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.completed_lessons).toBe(1);
    expect(result.total_lessons).toBe(12);
    expect(result.percentage).toBe(8); // Rounded
  });

  // Edge case - next lesson recommendation
  test('should recommend next incomplete lesson when not finished', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.next_lesson).toBeDefined();
    expect(result.next_lesson?.id).toBe(6); // First incomplete lesson
    expect(result.next_lesson?.completed).toBe(false);
  });

  // Edge case - no next lesson when course complete
  test('should return null next_lesson when course 100% complete', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440002'; // All complete
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.next_lesson).toBeNull();
    expect(result.percentage).toBe(100);
  });

  // Error case - not enrolled in course
  test('should throw error when user not enrolled in course', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 999; // Not enrolled

    // Act & Assert
    await expect(calculateCourseProgress(userId, courseId)).rejects.toThrow(
      'User not enrolled in course'
    );
  });

  // Error case - enrollment dropped
  test('should throw error when enrollment status is dropped', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440001'; // Dropped
    const courseId = 1;

    // Act & Assert
    await expect(calculateCourseProgress(userId, courseId)).rejects.toThrow(
      'Enrollment is not active'
    );
  });

  // Edge case - course with no lessons (edge case)
  test('should return 0% when course has no lessons yet', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 99; // Empty course (in development)

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.completed_lessons).toBe(0);
    expect(result.total_lessons).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.next_lesson).toBeNull();
  });

  // Error case - invalid userId
  test('should throw error when userId invalid format', async () => {
    // Arrange
    const invalidUserId = 'not-a-uuid';
    const courseId = 1;

    // Act & Assert
    await expect(calculateCourseProgress(invalidUserId, courseId)).rejects.toThrow(
      'Invalid user ID format'
    );
  });

  // Error case - invalid courseId
  test('should throw error when courseId negative', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = -1;

    // Act & Assert
    await expect(calculateCourseProgress(userId, courseId)).rejects.toThrow(
      'Invalid course ID'
    );
  });

  // Edge case - time tracking accuracy
  test('should aggregate time_spent_seconds from all lesson progress', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1;
    // From fixtures: 5 lessons × 1800s = 9000s = 2.5 hours

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.time_spent_hours).toBeCloseTo(2.5, 1);
    expect(result.time_spent_seconds).toBe(9000);
  });

  // Edge case - percentage rounding
  test('should round percentage to nearest integer', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 3; // 1 of 3 lessons = 33.33%

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.percentage).toBe(33); // Not 33.33
    expect(Number.isInteger(result.percentage)).toBe(true);
  });

  // Edge case - watch_count aggregation
  test('should aggregate total watch_count across lessons', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert
    expect(result.total_watch_count).toBeGreaterThan(0);
    expect(result.total_watch_count).toBe(5); // From 5 lessons in progress
  });

  // Error case - null/undefined inputs
  test('should throw error when userId null', async () => {
    // Arrange
    const userId = null;
    const courseId = 1;

    // Act & Assert
    await expect(
      calculateCourseProgress(userId as any, courseId)
    ).rejects.toThrow('User ID is required');
  });

  test('should throw error when courseId undefined', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = undefined;

    // Act & Assert
    await expect(
      calculateCourseProgress(userId, courseId as any)
    ).rejects.toThrow('Course ID is required');
  });

  // Integration behavior - matches BOOTCAMP_ARCHITECTURE.md lines 420-434 pattern
  test('should return structure matching API response format', async () => {
    // Arrange
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const courseId = 1;

    // Act
    const result = await calculateCourseProgress(userId, courseId);

    // Assert - Verify response structure from BOOTCAMP_ARCHITECTURE.md lines 420-434
    expect(result).toHaveProperty('completed_lessons');
    expect(result).toHaveProperty('total_lessons');
    expect(result).toHaveProperty('percentage');
    expect(result).toHaveProperty('time_spent_hours');
    expect(result).toHaveProperty('next_lesson');
    expect(typeof result.completed_lessons).toBe('number');
    expect(typeof result.total_lessons).toBe('number');
    expect(typeof result.percentage).toBe('number');
    expect(typeof result.time_spent_hours).toBe('number');
  });
});

// Additional validation helper tests (support functions)

describe('validateCourseSlug', () => {
  test('should accept valid slug with hyphens and numbers', () => {
    // Arrange
    const slug = 'n8n-workflow-basics-101';

    // Act
    const result = validateCourseInput({ 
      name: 'Test', 
      slug, 
      track: 'animal-advocacy', 
      difficulty: 'beginner' 
    });

    // Assert
    expect(result.valid).toBe(true);
  });

  test('should reject slug with spaces', () => {
    // Arrange
    const slug = 'n8n workflow basics';

    // Act
    const result = validateCourseInput({ 
      name: 'Test', 
      slug, 
      track: 'animal-advocacy', 
      difficulty: 'beginner' 
    });

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Slug must be URL-friendly (lowercase, hyphens, numbers only)');
  });

  test('should reject slug with uppercase letters', () => {
    // Arrange
    const slug = 'N8N-Basics';

    // Act
    const result = validateCourseInput({ 
      name: 'Test', 
      slug, 
      track: 'animal-advocacy', 
      difficulty: 'beginner' 
    });

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Slug must be URL-friendly (lowercase, hyphens, numbers only)');
  });

  test('should reject slug with special characters', () => {
    // Arrange
    const slug = 'n8n_basics!';

    // Act
    const result = validateCourseInput({ 
      name: 'Test', 
      slug, 
      track: 'animal-advocacy', 
      difficulty: 'beginner' 
    });

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Slug must be URL-friendly (lowercase, hyphens, numbers only)');
  });

  test('should reject slug that is too short', () => {
    // Arrange
    const slug = 'ab'; // < 3 characters

    // Act
    const result = validateCourseInput({ 
      name: 'Test', 
      slug, 
      track: 'animal-advocacy', 
      difficulty: 'beginner' 
    });

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Slug must be at least 3 characters');
  });

  test('should reject slug that is too long', () => {
    // Arrange
    const slug = 'a'.repeat(101); // > 100 characters

    // Act
    const result = validateCourseInput({ 
      name: 'Test', 
      slug, 
      track: 'animal-advocacy', 
      difficulty: 'beginner' 
    });

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Slug must be less than 100 characters');
  });
});
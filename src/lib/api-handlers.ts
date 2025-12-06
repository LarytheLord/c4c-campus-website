/**
 * API handler utilities for C4C Campus
 * @module lib/api-handlers
 */

import { supabase } from './supabase';
import { sanitizeHTML } from './security';

export interface CourseValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: Record<string, unknown>;
}

export interface EnrollmentCheckResult {
  enrolled: boolean;
  enrollment: {
    id: number;
    user_id: string;
    course_id: number;
    cohort_id?: string;
    enrolled_at: string;
    progress_percentage: number;
  } | null;
}

export interface CourseProgressResult {
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
  time_spent_hours: number;
  time_spent_seconds: number;
  status: 'not_started' | 'in_progress' | 'completed';
  next_lesson: {
    id: number;
    title: string;
    slug: string;
    module_id: number;
  } | null;
  total_watch_count: number;
}

const VALID_TRACKS = ['animal_advocacy', 'climate', 'ai_safety', 'general'] as const;
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

/**
 * Validate UUID format
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validate slug format
 */
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
}

/**
 * Validate course input data
 * @param input - Course data to validate
 * @returns Validation result with errors and sanitized data
 */
export function validateCourseInput(input: Record<string, unknown>): CourseValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};

  // Required: title
  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.push('Course title is required');
  } else {
    sanitized.title = sanitizeHTML(input.title.trim());
  }

  // Required: slug
  if (!input.slug || typeof input.slug !== 'string') {
    errors.push('Course slug is required');
  } else {
    const slug = input.slug.toLowerCase().trim();
    if (!isValidSlug(slug)) {
      errors.push('Slug must be 3-100 characters, lowercase alphanumeric with hyphens only');
    } else {
      sanitized.slug = slug;
    }
  }

  // Required: track
  if (!input.track || typeof input.track !== 'string') {
    errors.push('Course track is required');
  } else if (!VALID_TRACKS.includes(input.track as typeof VALID_TRACKS[number])) {
    errors.push(`Track must be one of: ${VALID_TRACKS.join(', ')}`);
  } else {
    sanitized.track = input.track;
  }

  // Required: difficulty
  if (!input.difficulty || typeof input.difficulty !== 'string') {
    errors.push('Course difficulty is required');
  } else if (!VALID_DIFFICULTIES.includes(input.difficulty as typeof VALID_DIFFICULTIES[number])) {
    errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  } else {
    sanitized.difficulty = input.difficulty;
  }

  // Optional: description
  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push('Description must be a string');
    } else {
      sanitized.description = sanitizeHTML(input.description);
    }
  }

  // Optional: default_duration_weeks
  if (input.default_duration_weeks !== undefined) {
    const weeks = Number(input.default_duration_weeks);
    if (isNaN(weeks) || weeks <= 0 || !Number.isInteger(weeks)) {
      errors.push('Duration weeks must be a positive integer');
    } else {
      sanitized.default_duration_weeks = weeks;
    }
  }

  // Optional: is_published
  if (input.is_published !== undefined) {
    sanitized.is_published = Boolean(input.is_published);
  }

  // Optional: thumbnail_url
  if (input.thumbnail_url !== undefined) {
    if (typeof input.thumbnail_url !== 'string') {
      errors.push('Thumbnail URL must be a string');
    } else {
      try {
        new URL(input.thumbnail_url);
        sanitized.thumbnail_url = input.thumbnail_url;
      } catch {
        errors.push('Thumbnail URL must be a valid URL');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

/**
 * Check if a user is enrolled in a course
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Enrollment check result
 */
export async function checkEnrollment(
  userId: string,
  courseId: number
): Promise<EnrollmentCheckResult> {
  // Validate inputs
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Error('Invalid course ID');
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, cohort_id, enrolled_at, progress_percentage')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database error: ${error.message}`);
  }

  return {
    enrolled: !!data,
    enrollment: data || null,
  };
}

/**
 * Calculate a student's progress in a course
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Course progress result
 */
export async function calculateCourseProgress(
  userId: string,
  courseId: number
): Promise<CourseProgressResult> {
  // Validate inputs
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Error('Invalid course ID');
  }

  // Check enrollment first
  const enrollment = await checkEnrollment(userId, courseId);
  if (!enrollment.enrolled) {
    throw new Error('User is not enrolled in this course');
  }

  // Get total lessons count for the course
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, slug, module_id, order_index, modules!inner(course_id, order_index)')
    .eq('modules.course_id', courseId)
    .order('modules.order_index', { ascending: true })
    .order('order_index', { ascending: true });

  if (lessonsError) {
    throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
  }

  const totalLessons = lessons?.length || 0;

  // Get completed lessons and progress data
  const { data: progress, error: progressError } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, time_spent_seconds, video_position_seconds')
    .eq('user_id', userId)
    .in('lesson_id', lessons?.map(l => l.id) || []);

  if (progressError) {
    throw new Error(`Failed to fetch progress: ${progressError.message}`);
  }

  const completedLessonIds = new Set(
    progress?.filter(p => p.completed).map(p => p.lesson_id) || []
  );
  const completedLessons = completedLessonIds.size;

  // Calculate time spent
  const totalTimeSeconds = progress?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0;
  const totalTimeHours = Math.round((totalTimeSeconds / 3600) * 10) / 10;

  // Calculate total watch count
  const totalWatchCount = progress?.length || 0;

  // Calculate percentage
  const percentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Determine status
  let status: 'not_started' | 'in_progress' | 'completed';
  if (completedLessons === 0) {
    status = 'not_started';
  } else if (completedLessons >= totalLessons) {
    status = 'completed';
  } else {
    status = 'in_progress';
  }

  // Find next incomplete lesson
  let nextLesson: CourseProgressResult['next_lesson'] = null;
  if (lessons) {
    const incompleteLesson = lessons.find(l => !completedLessonIds.has(l.id));
    if (incompleteLesson) {
      nextLesson = {
        id: incompleteLesson.id,
        title: incompleteLesson.title,
        slug: incompleteLesson.slug,
        module_id: incompleteLesson.module_id,
      };
    }
  }

  return {
    completed_lessons: completedLessons,
    total_lessons: totalLessons,
    percentage,
    time_spent_hours: totalTimeHours,
    time_spent_seconds: totalTimeSeconds,
    status,
    next_lesson: nextLesson,
    total_watch_count: totalWatchCount,
  };
}

/**
 * Validate module input
 */
export function validateModuleInput(input: Record<string, unknown>): CourseValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};

  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.push('Module title is required');
  } else {
    sanitized.title = sanitizeHTML(input.title.trim());
  }

  if (!input.course_id || typeof input.course_id !== 'number') {
    errors.push('Course ID is required');
  } else {
    sanitized.course_id = input.course_id;
  }

  if (input.order_index !== undefined) {
    const order = Number(input.order_index);
    if (isNaN(order) || order < 0) {
      errors.push('Order index must be a non-negative number');
    } else {
      sanitized.order_index = order;
    }
  }

  if (input.description !== undefined && typeof input.description === 'string') {
    sanitized.description = sanitizeHTML(input.description);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

/**
 * Validate lesson input
 */
export function validateLessonInput(input: Record<string, unknown>): CourseValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};

  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.push('Lesson title is required');
  } else {
    sanitized.title = sanitizeHTML(input.title.trim());
  }

  if (!input.module_id || typeof input.module_id !== 'number') {
    errors.push('Module ID is required');
  } else {
    sanitized.module_id = input.module_id;
  }

  if (!input.slug || typeof input.slug !== 'string') {
    errors.push('Lesson slug is required');
  } else {
    const slug = input.slug.toLowerCase().trim();
    if (!isValidSlug(slug)) {
      errors.push('Slug must be 3-100 characters, lowercase alphanumeric with hyphens only');
    } else {
      sanitized.slug = slug;
    }
  }

  if (input.content !== undefined && typeof input.content === 'string') {
    sanitized.content = sanitizeHTML(input.content);
  }

  if (input.video_url !== undefined && typeof input.video_url === 'string') {
    sanitized.video_url = input.video_url;
  }

  if (input.duration_minutes !== undefined) {
    const duration = Number(input.duration_minutes);
    if (isNaN(duration) || duration < 0) {
      errors.push('Duration must be a non-negative number');
    } else {
      sanitized.duration_minutes = duration;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

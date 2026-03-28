/**
 * Database setup helpers for E2E tests
 * Provides functions to seed and clean up test data
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'Warning: Supabase credentials not configured. Database setup will be skipped.'
  );
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * Create a test user in the database
 */
export async function createTestUser(
  email: string,
  password: string,
  metadata: any = {}
): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping user creation');
    return null;
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (authError) {
      console.error('Error creating test user:', authError);
      return null;
    }

    return authData.user?.id || null;
  } catch (error) {
    console.error('Exception creating test user:', error);
    return null;
  }
}

/**
 * Delete a test user from the database
 */
export async function deleteTestUser(userId: string): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping user deletion');
    return false;
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting test user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting test user:', error);
    return false;
  }
}

/**
 * Create a test course in the database
 */
export async function createTestCourse(courseData: any): Promise<number | null> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping course creation');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating test course:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Exception creating test course:', error);
    return null;
  }
}

/**
 * Delete a test course from the database
 */
export async function deleteTestCourse(courseId: number): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping course deletion');
    return false;
  }

  try {
    // Delete related data first
    await supabase.from('enrollments').delete().eq('course_id', courseId);
    await supabase.from('lessons').delete().eq('course_id', courseId);
    await supabase.from('modules').delete().eq('course_id', courseId);

    // Delete course
    const { error } = await supabase.from('courses').delete().eq('id', courseId);

    if (error) {
      console.error('Error deleting test course:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting test course:', error);
    return false;
  }
}

/**
 * Enroll a user in a course
 */
export async function enrollUserInCourse(
  userId: string,
  courseId: number
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping enrollment');
    return false;
  }

  try {
    const { error } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: courseId,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error enrolling user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception enrolling user:', error);
    return false;
  }
}

/**
 * Clean up all test data (use with caution!)
 */
export async function cleanupTestData(): Promise<void> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping cleanup');
    return;
  }

  try {
    // Delete test users (with email containing 'e2e-test' or 'test.c4c.dev')
    // Note: This should be implemented based on your schema
    console.log('Cleaning up test data...');

    // Delete test courses
    await supabase
      .from('courses')
      .delete()
      .like('title', 'E2E Test Course%');

    console.log('Test data cleanup complete');
  } catch (error) {
    console.error('Exception during cleanup:', error);
  }
}

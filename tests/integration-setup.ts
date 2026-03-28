/**
 * Integration Test Setup
 *
 * Unlike unit/component tests (which use mocked Supabase),
 * integration tests connect to REAL Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Integration tests require:\n' +
    '  - PUBLIC_SUPABASE_URL\n' +
    '  - SUPABASE_SERVICE_ROLE_KEY\n' +
    'in .env file'
  );
}

/**
 * Service role client - bypasses RLS for admin operations
 * Use this for creating test data (courses, lessons, etc.)
 */
export const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Anon client - respects RLS policies (simulates student access)
 * Use this for testing RLS policies
 */
export const supabaseAnon = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Test users for RLS policy testing
 * Created via create-test-users.ts script
 */
export const TEST_USERS = {
  TEACHER: {
    email: 'teacher@test.c4c.com',
    password: 'test_password_123',
    id: null as string | null, // Set after login
  },
  STUDENT_1: {
    email: 'student1@test.c4c.com',
    password: 'test_password_123',
    id: null as string | null,
  },
  STUDENT_2: {
    email: 'student2@test.c4c.com',
    password: 'test_password_123',
    id: null as string | null,
  },
};

/**
 * Helper: Clean up test data after each test
 */
export async function cleanupTestData() {
  // Delete in reverse dependency order (respecting foreign key constraints)
  // Discussion and forum data
  await supabaseAdmin.from('forum_replies').delete().neq('id', 0);
  await supabaseAdmin.from('lesson_discussions').delete().neq('id', 0);
  await supabaseAdmin.from('course_forums').delete().neq('id', 0);

  // Progress and enrollment data
  await supabaseAdmin.from('lesson_progress').delete().neq('id', 0);
  await supabaseAdmin.from('cohort_schedules').delete().neq('id', 0);
  await supabaseAdmin.from('cohort_enrollments').delete().neq('id', 0);
  await supabaseAdmin.from('enrollments').delete().neq('id', 0);

  // Course structure
  await supabaseAdmin.from('lessons').delete().neq('id', 0);
  await supabaseAdmin.from('modules').delete().neq('id', 0);
  await supabaseAdmin.from('cohorts').delete().neq('id', 0);
  await supabaseAdmin.from('courses').delete().neq('id', 0);
}

// Cache authenticated clients to avoid rate limits
const clientCache = new Map<string, { client: any; userId: string }>();

/**
 * Helper: Get authenticated client for specific test user
 * Caches clients to avoid hitting auth rate limits
 */
export async function getAuthenticatedClient(userEmail: string, password: string) {
  // Check cache first
  if (clientCache.has(userEmail)) {
    return clientCache.get(userEmail)!;
  }

  const client = createClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await client.auth.signInWithPassword({
    email: userEmail,
    password: password,
  });

  if (error || !data.user) {
    throw new Error(`Failed to authenticate as ${userEmail}: ${error?.message}`);
  }

  const result = { client, userId: data.user.id };
  clientCache.set(userEmail, result); // Cache for future use
  return result;
}

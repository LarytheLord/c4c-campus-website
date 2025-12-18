/**
 * Schema-Code Alignment Integration Tests
 *
 * Validates that code references match database schema definitions.
 * These tests verify:
 * 1. All schema tables exist in the database
 * 2. All table columns match schema definitions
 * 3. Field names follow snake_case convention
 * 4. Generated types match database schema
 *
 * Reference:
 * - schema.sql: Single source of truth for database structure
 * - src/types/generated.ts: Auto-generated TypeScript types
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { supabaseAdmin } from '../integration-setup';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'schema.sql');
const GENERATED_TYPES_PATH = path.join(__dirname, '..', '..', 'src', 'types', 'generated.ts');

// Core LMS tables that must exist and be properly defined
const CORE_TABLES = [
  'courses',
  'modules',
  'lessons',
  'cohorts',
  'cohort_enrollments',
  'cohort_schedules',
  'lesson_progress',
  'quizzes',
  'quiz_questions',
  'quiz_attempts',
  'assignments',
  'assignment_submissions',
  'assignment_rubrics',
  'enrollments',
  'profiles',
  'applications',
];

/**
 * Parse schema.sql to extract table and column definitions
 */
function parseSchemaSQL(content: string): Record<string, Set<string>> {
  const tables: Record<string, Set<string>> = {};

  // Match CREATE TABLE statements
  const tableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi;

  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];

    const columns = new Set<string>();

    // Parse column definitions
    const lines = columnsBlock.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip constraints, comments, etc.
      if (!trimmed ||
          trimmed.startsWith('--') ||
          trimmed.startsWith('CONSTRAINT') ||
          trimmed.startsWith('PRIMARY KEY') ||
          trimmed.startsWith('FOREIGN KEY') ||
          trimmed.startsWith('UNIQUE') ||
          trimmed.startsWith('CHECK')) {
        continue;
      }

      // Parse column: name type [constraints]
      const colMatch = trimmed.match(/^(\w+)\s+([A-Za-z_]+)/i);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        // Skip SQL keywords that look like column names
        if (!['primary', 'foreign', 'unique', 'check', 'constraint', 'references', 'on', 'cascade', 'set', 'null', 'default'].includes(colName)) {
          columns.add(colName);
        }
      }
    }

    if (columns.size > 0) {
      tables[tableName] = columns;
    }
  }

  return tables;
}

/**
 * Check if a column name follows snake_case convention
 */
function isSnakeCase(name: string): boolean {
  // snake_case: lowercase letters, underscores, and numbers
  // No consecutive underscores, no leading/trailing underscores
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name);
}

describe('Schema-Code Alignment Integration Tests', () => {
  let schemaContent: string;
  let schemaTables: Record<string, Set<string>>;

  beforeAll(async () => {
    // Read and parse schema.sql
    schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    schemaTables = parseSchemaSQL(schemaContent);
  });

  // ============================================================================
  // 1. SCHEMA PARSING VALIDATION
  // ============================================================================

  describe('1. Schema Parsing', () => {
    test('should parse schema.sql successfully', () => {
      expect(schemaContent).toBeDefined();
      expect(schemaContent.length).toBeGreaterThan(0);
    });

    test('should extract all core LMS tables from schema', () => {
      for (const tableName of CORE_TABLES) {
        expect(schemaTables).toHaveProperty(tableName);
        expect(schemaTables[tableName].size).toBeGreaterThan(0);
      }
    });

    test('should extract expected columns for courses table', () => {
      const courseColumns = schemaTables['courses'];
      expect(courseColumns).toBeDefined();

      // Check essential course columns
      const expectedColumns = [
        'id', 'slug', 'title', 'description', 'thumbnail_url',
        'track', 'difficulty', 'is_published', 'is_cohort_based',
        'default_duration_weeks', 'enrollment_type', 'created_by',
        'created_at', 'updated_at'
      ];

      for (const col of expectedColumns) {
        expect(courseColumns.has(col)).toBe(true);
      }
    });

    test('should extract expected columns for quizzes table', () => {
      const quizColumns = schemaTables['quizzes'];
      expect(quizColumns).toBeDefined();

      // Check essential quiz columns - using snake_case
      const expectedColumns = [
        'id', 'course_id', 'module_id', 'lesson_id', 'title', 'description',
        'time_limit_minutes', 'passing_score', 'max_attempts',
        'randomize_questions', 'show_correct_answers', 'show_results_immediately',
        'is_published', 'available_from', 'available_until',
        'created_by', 'created_at', 'updated_at'
      ];

      for (const col of expectedColumns) {
        expect(quizColumns.has(col)).toBe(true);
      }
    });

    test('should extract expected columns for assignments table', () => {
      const assignmentColumns = schemaTables['assignments'];
      expect(assignmentColumns).toBeDefined();

      // Check essential assignment columns - using snake_case
      const expectedColumns = [
        'id', 'course_id', 'module_id', 'lesson_id', 'title', 'description',
        'instructions', 'max_points', 'due_date', 'allow_late_submissions',
        'late_penalty_percent', 'allow_resubmission', 'max_submissions',
        'max_file_size_mb', 'allowed_file_types', 'is_published',
        'created_by', 'created_at', 'updated_at'
      ];

      for (const col of expectedColumns) {
        expect(assignmentColumns.has(col)).toBe(true);
      }
    });
  });

  // ============================================================================
  // 2. DATABASE TABLE EXISTENCE
  // ============================================================================

  describe('2. Database Table Existence', () => {
    test('should have all core LMS tables in database', async () => {
      // Query information_schema for table names
      // Note: We don't rely on get_table_names RPC as it may not exist
      // Instead, we directly query each core table to verify existence

      // Try to select from each table to verify it exists and is accessible
      for (const tableName of CORE_TABLES) {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(0);

        expect(error).toBeNull();
      }
    }, 30000);

    test('should have cohorts table with expected columns', async () => {
      const { error } = await supabaseAdmin
        .from('cohorts')
        .select('id, course_id, name, start_date, end_date, status, max_students, created_by, created_at, updated_at')
        .limit(0);

      expect(error).toBeNull();
    });

    test('should have cohort_enrollments table with expected columns', async () => {
      const { error } = await supabaseAdmin
        .from('cohort_enrollments')
        .select('id, cohort_id, user_id, enrolled_at, status, completed_lessons, progress, last_activity_at')
        .limit(0);

      expect(error).toBeNull();
    });

    test('should have quizzes table with expected columns', async () => {
      const { error } = await supabaseAdmin
        .from('quizzes')
        .select('id, course_id, module_id, lesson_id, title, description, time_limit_minutes, passing_score, max_attempts, is_published')
        .limit(0);

      expect(error).toBeNull();
    });

    test('should have assignments table with expected columns', async () => {
      const { error } = await supabaseAdmin
        .from('assignments')
        .select('id, course_id, module_id, lesson_id, title, description, max_points, due_date, allow_late_submissions, is_published')
        .limit(0);

      expect(error).toBeNull();
    });
  });

  // ============================================================================
  // 3. COLUMN NAME CONVENTIONS
  // ============================================================================

  describe('3. Column Name Conventions', () => {
    test('all schema columns should use snake_case convention', () => {
      const violations: Array<{ table: string; column: string }> = [];

      for (const [tableName, columns] of Object.entries(schemaTables)) {
        for (const column of columns) {
          if (!isSnakeCase(column)) {
            violations.push({ table: tableName, column });
          }
        }
      }

      if (violations.length > 0) {
        console.log('Snake_case violations found:');
        for (const v of violations) {
          console.log(`  ${v.table}.${v.column}`);
        }
      }

      expect(violations).toHaveLength(0);
    });

    test('should not have camelCase columns in database', async () => {
      // Common camelCase patterns that should NOT exist
      const camelCasePatterns = [
        'userId', 'courseId', 'lessonId', 'moduleId', 'cohortId',
        'createdAt', 'updatedAt', 'enrolledAt', 'completedAt',
        'startDate', 'endDate', 'maxStudents', 'timeLimitMinutes',
        'timeLimit', 'maxAttempts', 'passingScore', 'isPublished',
      ];

      for (const tableName of CORE_TABLES) {
        const columns = schemaTables[tableName];
        if (columns) {
          for (const pattern of camelCasePatterns) {
            expect(columns.has(pattern)).toBe(false);
          }
        }
      }
    });

    test('foreign key columns should end with _id', () => {
      // Common foreign key columns that should exist
      const fkPatterns = [
        { table: 'modules', column: 'course_id' },
        { table: 'lessons', column: 'module_id' },
        { table: 'cohorts', column: 'course_id' },
        { table: 'cohort_enrollments', column: 'cohort_id' },
        { table: 'cohort_enrollments', column: 'user_id' },
        { table: 'cohort_schedules', column: 'cohort_id' },
        { table: 'cohort_schedules', column: 'module_id' },
        { table: 'lesson_progress', column: 'lesson_id' },
        { table: 'lesson_progress', column: 'user_id' },
        { table: 'quizzes', column: 'course_id' },
        { table: 'quiz_questions', column: 'quiz_id' },
        { table: 'quiz_attempts', column: 'quiz_id' },
        { table: 'assignments', column: 'course_id' },
        { table: 'assignment_submissions', column: 'assignment_id' },
      ];

      for (const { table, column } of fkPatterns) {
        const tableColumns = schemaTables[table];
        expect(tableColumns).toBeDefined();
        expect(tableColumns.has(column)).toBe(true);
      }
    });
  });

  // ============================================================================
  // 4. GENERATED TYPES VALIDATION
  // ============================================================================

  describe('4. Generated Types Validation', () => {
    let generatedTypesContent: string;

    beforeAll(() => {
      try {
        generatedTypesContent = fs.readFileSync(GENERATED_TYPES_PATH, 'utf-8');
      } catch {
        generatedTypesContent = '';
      }
    });

    test('should have generated.ts file', () => {
      expect(generatedTypesContent.length).toBeGreaterThan(0);
    });

    test('should have Database type definition', () => {
      expect(generatedTypesContent).toContain('export type Database = {');
    });

    test('should have "DO NOT EDIT" header comment', () => {
      expect(generatedTypesContent).toContain('DO NOT EDIT THIS FILE MANUALLY');
    });

    test('should have type definitions for core tables', () => {
      const expectedTables = ['quizzes', 'quiz_questions', 'quiz_attempts', 'assignments', 'assignment_submissions'];
      for (const table of expectedTables) {
        expect(generatedTypesContent).toContain(`${table}: {`);
      }
    });

    test('should have helper type exports', () => {
      const expectedHelpers = ['QuizRow', 'QuizQuestionRow', 'AssignmentRow'];
      for (const helper of expectedHelpers) {
        expect(generatedTypesContent).toContain(`export type ${helper}`);
      }
    });

    test('should use snake_case field names in types', () => {
      // Check that common snake_case fields appear in the types
      const snakeCaseFields = [
        'time_limit_minutes',
        'passing_score',
        'max_attempts',
        'is_published',
        'created_at',
        'updated_at',
        'user_id',
        'course_id',
      ];

      for (const field of snakeCaseFields) {
        expect(generatedTypesContent).toContain(field);
      }
    });

    test('should NOT have camelCase field names in Database type', () => {
      // Extract just the Database type definition
      const dbTypeMatch = generatedTypesContent.match(/export type Database = \{[\s\S]*?\n\};/);
      if (dbTypeMatch) {
        const dbType = dbTypeMatch[0];

        // These camelCase patterns should NOT appear in the Database type
        const camelCasePatterns = [
          /\btimeLimitMinutes\b/,
          /\bpassingScore\b/,
          /\bmaxAttempts\b/,
          /\bisPublished\b/,
          /\bcreatedAt\b/,
          /\bupdatedAt\b/,
          /\buserId\b/,
          /\bcourseId\b/,
        ];

        for (const pattern of camelCasePatterns) {
          expect(pattern.test(dbType)).toBe(false);
        }
      }
    });
  });

  // ============================================================================
  // 5. SCHEMA-DATABASE CONSISTENCY
  // ============================================================================

  describe('5. Schema-Database Consistency', () => {
    test('should be able to insert and select with snake_case fields', async () => {
      // Create a test course using snake_case fields
      const { data: course, error: insertError } = await supabaseAdmin
        .from('courses')
        .insert({
          title: 'Schema Test Course',
          slug: 'schema-test-' + Date.now(),
          track: 'animal_advocacy',
          difficulty: 'beginner',
          is_published: false,
          is_cohort_based: true,
          default_duration_weeks: 8,
          enrollment_type: 'open',
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(course).toBeDefined();

      // Verify snake_case fields are returned correctly
      expect(course.is_published).toBe(false);
      expect(course.is_cohort_based).toBe(true);
      expect(course.default_duration_weeks).toBe(8);
      expect(course.enrollment_type).toBe('open');
      expect(course.created_at).toBeDefined();
      expect(course.updated_at).toBeDefined();

      // Cleanup
      await supabaseAdmin.from('courses').delete().eq('id', course.id);
    });

    test('should be able to filter using snake_case field names', async () => {
      // Create test data
      const { data: course } = await supabaseAdmin
        .from('courses')
        .insert({
          title: 'Filter Test Course',
          slug: 'filter-test-' + Date.now(),
          is_published: true,
        })
        .select()
        .single();

      // Query using snake_case filter
      const { data: filtered, error } = await supabaseAdmin
        .from('courses')
        .select('id, title, is_published')
        .eq('is_published', true)
        .eq('id', course!.id);

      expect(error).toBeNull();
      expect(filtered).toHaveLength(1);
      expect(filtered![0].is_published).toBe(true);

      // Cleanup
      await supabaseAdmin.from('courses').delete().eq('id', course!.id);
    });

    test('should be able to order by snake_case field names', async () => {
      const { data, error } = await supabaseAdmin
        .from('courses')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should handle JSONB columns correctly', async () => {
      // First, get or create a test user from profiles table
      // We'll use an existing profile or create one if needed
      let testUserId: string;

      // Try to get an existing profile
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

      if (existingProfile) {
        testUserId = existingProfile.id;
      } else {
        // Create a test user via auth.users using the admin API
        // Note: This requires admin access - use service role key
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: `jsonb-test-${Date.now()}@test.c4c.com`,
          password: 'test_password_123',
          email_confirm: true,
        });

        if (authError || !authUser.user) {
          // If we can't create a user, skip this test with a warning
          console.warn('Could not create test user for JSONB test - skipping');
          return;
        }

        testUserId = authUser.user.id;

        // Ensure profile exists (should be created by trigger, but let's be safe)
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: testUserId,
            email: authUser.user.email,
            role: 'student',
          });
      }

      // Create course and cohort first
      const { data: course } = await supabaseAdmin
        .from('courses')
        .insert({
          title: 'JSONB Test Course',
          slug: 'jsonb-test-' + Date.now(),
          is_published: true,
        })
        .select()
        .single();

      const { data: cohort } = await supabaseAdmin
        .from('cohorts')
        .insert({
          course_id: course!.id,
          name: 'JSONB Test Cohort',
          start_date: '2025-01-01',
        })
        .select()
        .single();

      // Create enrollment with JSONB progress using real user_id
      const progressData = {
        completed_lessons: 5,
        completed_modules: 2,
        percentage: 40,
      };

      const { data: enrollment, error } = await supabaseAdmin
        .from('cohort_enrollments')
        .insert({
          cohort_id: cohort!.id,
          user_id: testUserId,
          progress: progressData,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(enrollment!.progress).toEqual(progressData);

      // Cleanup (reverse order of dependencies)
      await supabaseAdmin.from('cohort_enrollments').delete().eq('id', enrollment!.id);
      await supabaseAdmin.from('cohorts').delete().eq('id', cohort!.id);
      await supabaseAdmin.from('courses').delete().eq('id', course!.id);
      // Note: We don't delete the test user/profile as it may be reused by other tests
    });
  });

  // ============================================================================
  // 6. TIMESTAMP COLUMNS
  // ============================================================================

  describe('6. Timestamp Columns', () => {
    test('all core tables should have created_at column', () => {
      const tablesWithCreatedAt = [
        'courses', 'modules', 'lessons', 'cohorts', 'cohort_enrollments',
        'cohort_schedules', 'lesson_progress', 'quizzes', 'quiz_questions',
        'quiz_attempts', 'assignments', 'assignment_submissions', 'enrollments',
      ];

      for (const tableName of tablesWithCreatedAt) {
        const columns = schemaTables[tableName];
        expect(columns).toBeDefined();
        expect(columns.has('created_at')).toBe(true);
      }
    });

    test('updatable tables should have updated_at column', () => {
      const tablesWithUpdatedAt = [
        'courses', 'modules', 'lessons', 'cohorts',
        'quizzes', 'assignments', 'assignment_submissions',
      ];

      for (const tableName of tablesWithUpdatedAt) {
        const columns = schemaTables[tableName];
        expect(columns).toBeDefined();
        expect(columns.has('updated_at')).toBe(true);
      }
    });
  });

  // ============================================================================
  // 7. COMMON FIELD NAME PATTERNS
  // ============================================================================

  describe('7. Common Field Name Patterns', () => {
    test('boolean columns should use is_ or has_ prefix or appropriate name', () => {
      const booleanColumns = [
        { table: 'courses', columns: ['is_published', 'is_cohort_based'] },
        { table: 'lessons', columns: ['is_preview'] },
        { table: 'quizzes', columns: ['is_published', 'randomize_questions', 'show_correct_answers', 'show_results_immediately'] },
        { table: 'assignments', columns: ['is_published', 'allow_late_submissions', 'allow_resubmission'] },
        { table: 'lesson_progress', columns: ['completed'] },
        { table: 'quiz_attempts', columns: ['passed'] },
        { table: 'assignment_submissions', columns: ['is_late'] },
      ];

      for (const { table, columns } of booleanColumns) {
        const tableColumns = schemaTables[table];
        expect(tableColumns).toBeDefined();
        for (const col of columns) {
          expect(tableColumns.has(col)).toBe(true);
        }
      }
    });

    test('ID columns should use correct naming', () => {
      // Primary key should be 'id'
      for (const tableName of CORE_TABLES) {
        const columns = schemaTables[tableName];
        expect(columns).toBeDefined();
        expect(columns.has('id')).toBe(true);
      }
    });

    test('timestamp columns should use _at suffix', () => {
      const timestampColumns = [
        { table: 'cohort_enrollments', columns: ['enrolled_at', 'last_activity_at'] },
        { table: 'lesson_progress', columns: ['completed_at', 'last_accessed_at'] },
        { table: 'quiz_attempts', columns: ['started_at', 'submitted_at', 'graded_at'] },
        { table: 'assignment_submissions', columns: ['submitted_at', 'graded_at'] },
        { table: 'enrollments', columns: ['enrolled_at', 'completed_at'] },
      ];

      for (const { table, columns } of timestampColumns) {
        const tableColumns = schemaTables[table];
        expect(tableColumns).toBeDefined();
        for (const col of columns) {
          expect(tableColumns.has(col)).toBe(true);
        }
      }
    });

    test('date columns should use _date suffix', () => {
      const dateColumns = [
        { table: 'cohorts', columns: ['start_date', 'end_date'] },
        { table: 'cohort_schedules', columns: ['unlock_date', 'lock_date'] },
        { table: 'assignments', columns: ['due_date'] },
      ];

      for (const { table, columns } of dateColumns) {
        const tableColumns = schemaTables[table];
        expect(tableColumns).toBeDefined();
        for (const col of columns) {
          expect(tableColumns.has(col)).toBe(true);
        }
      }
    });
  });
});

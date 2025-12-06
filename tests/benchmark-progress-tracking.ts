/**
 * Performance Benchmark for Progress Tracking System
 *
 * Tests query performance for:
 * - Student roster view (materialized)
 * - Progress tracking queries
 * - Cohort enrollment queries
 */

import { supabaseAdmin, cleanupTestData } from './integration-setup';

interface BenchmarkResult {
  query: string;
  executionTime: number;
  rowCount: number;
  success: boolean;
  error?: string;
}

async function benchmark(name: string, query: () => Promise<any>): Promise<BenchmarkResult> {
  const start = Date.now();
  try {
    const result = await query();
    const executionTime = Date.now() - start;

    return {
      query: name,
      executionTime,
      rowCount: Array.isArray(result.data) ? result.data.length : 1,
      success: !result.error,
      error: result.error?.message
    };
  } catch (error: any) {
    return {
      query: name,
      executionTime: Date.now() - start,
      rowCount: 0,
      success: false,
      error: error.message
    };
  }
}

async function setupTestData() {
  console.log('Setting up test data...');

  // Create a course
  const { data: course } = await supabaseAdmin.from('courses').insert({
    name: 'Benchmark Course',
    slug: 'benchmark-course-' + Date.now(),
    track: 'animal-advocacy',
    difficulty: 'beginner',
    published: true,
  }).select().single();

  if (!course) throw new Error('Failed to create course');

  // Create a cohort
  const { data: cohort } = await supabaseAdmin.from('cohorts').insert({
    course_id: course.id,
    name: 'Benchmark Cohort',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    max_students: 100,
  }).select().single();

  if (!cohort) throw new Error('Failed to create cohort');

  // Create modules
  const modules = [];
  for (let i = 1; i <= 5; i++) {
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: course.id,
      name: `Module ${i}`,
      order_index: i,
    }).select().single();

    if (module) modules.push(module);
  }

  // Create lessons (5 per module = 25 total)
  const lessons = [];
  for (const module of modules) {
    for (let i = 1; i <= 5; i++) {
      const { data: lesson } = await supabaseAdmin.from('lessons').insert({
        module_id: module.id,
        name: `Lesson ${i}`,
        slug: `lesson-${i}`,
        video_duration_seconds: 300,
        order_index: i,
      }).select().single();

      if (lesson) lessons.push(lesson);
    }
  }

  // Create test enrollments (simulate 50 students)
  const userIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    // We'll use dummy UUIDs for benchmarking
    const userId = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
    userIds.push(userId);

    // Create cohort enrollment
    await supabaseAdmin.from('cohort_enrollments').insert({
      cohort_id: cohort.id,
      user_id: userId,
      completed_lessons: Math.floor(Math.random() * 25),
      last_activity_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Create some lesson progress
    const lessonsToComplete = Math.floor(Math.random() * lessons.length);
    for (let j = 0; j < lessonsToComplete; j++) {
      await supabaseAdmin.from('lesson_progress').insert({
        user_id: userId,
        lesson_id: lessons[j].id,
        cohort_id: cohort.id,
        video_position_seconds: 300,
        completed: Math.random() > 0.3,
        time_spent_seconds: Math.floor(Math.random() * 600),
        watch_count: Math.floor(Math.random() * 3) + 1,
      });
    }
  }

  console.log(`Created test data:
  - 1 course
  - 1 cohort
  - ${modules.length} modules
  - ${lessons.length} lessons
  - 50 student enrollments
  - ~${50 * lessons.length / 2} progress records
  `);

  return { courseId: course.id, cohortId: cohort.id, userIds };
}

async function runBenchmarks() {
  console.log('\n=================================');
  console.log('Progress Tracking Benchmarks');
  console.log('=================================\n');

  const testData = await setupTestData();

  // Refresh materialized view before benchmarking
  await supabaseAdmin.rpc('refresh_student_roster_view');

  const results: BenchmarkResult[] = [];

  // Benchmark 1: Fetch student roster (materialized view)
  results.push(await benchmark(
    'Fetch student roster (materialized view)',
    () => supabaseAdmin
      .from('student_roster_view')
      .select('*')
      .eq('cohort_id', testData.cohortId)
  ));

  // Benchmark 2: Fetch cohort enrollments with joined data (without view)
  results.push(await benchmark(
    'Fetch enrollments with joins (no view)',
    () => supabaseAdmin
      .from('cohort_enrollments')
      .select('*, cohorts(*)')
      .eq('cohort_id', testData.cohortId)
  ));

  // Benchmark 3: Get user progress for all lessons
  results.push(await benchmark(
    'Get user progress for all lessons',
    () => supabaseAdmin
      .from('lesson_progress')
      .select('*')
      .eq('user_id', testData.userIds[0])
  ));

  // Benchmark 4: Count completed lessons
  results.push(await benchmark(
    'Count completed lessons per user',
    () => supabaseAdmin
      .from('lesson_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', testData.userIds[0])
      .eq('completed', true)
  ));

  // Benchmark 5: Get recently active students
  results.push(await benchmark(
    'Get recently active students (last 7 days)',
    () => supabaseAdmin
      .from('cohort_enrollments')
      .select('*')
      .eq('cohort_id', testData.cohortId)
      .gte('last_activity_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('last_activity_at', { ascending: false })
  ));

  // Benchmark 6: Complex query - students with low completion rates
  results.push(await benchmark(
    'Find students with <50% completion',
    () => supabaseAdmin
      .from('cohort_enrollments')
      .select('*')
      .eq('cohort_id', testData.cohortId)
      .lt('completed_lessons', 13) // Less than 50% of 25 lessons
  ));

  // Print results
  console.log('\nBenchmark Results:');
  console.log('=================================\n');

  let totalTime = 0;
  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.query}`);
    console.log(`  Time: ${result.executionTime}ms`);
    console.log(`  Rows: ${result.rowCount}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
    totalTime += result.executionTime;
  }

  console.log('=================================');
  console.log(`Total execution time: ${totalTime}ms`);
  console.log(`Average query time: ${Math.round(totalTime / results.length)}ms`);
  console.log('=================================\n');

  // Cleanup
  console.log('Cleaning up test data...');
  await cleanupTestData();
  console.log('Done!\n');

  // Performance assertions
  const slowQueries = results.filter(r => r.executionTime > 1000);
  if (slowQueries.length > 0) {
    console.warn('⚠️  WARNING: Some queries took longer than 1 second:');
    slowQueries.forEach(q => console.warn(`  - ${q.query}: ${q.executionTime}ms`));
  } else {
    console.log('✓ All queries completed in under 1 second!');
  }

  const failedQueries = results.filter(r => !r.success);
  if (failedQueries.length > 0) {
    console.error('\n❌ FAILED QUERIES:');
    failedQueries.forEach(q => console.error(`  - ${q.query}: ${q.error}`));
    process.exit(1);
  } else {
    console.log('✓ All queries succeeded!\n');
  }
}

// Run benchmarks
runBenchmarks().catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});

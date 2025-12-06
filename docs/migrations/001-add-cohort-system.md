# Migration Guide: Add Cohort System

**Migration Number:** 001
**Version:** 1.0.0
**Date:** October 29, 2025
**Estimated Time:** 15-30 minutes (depending on data size)
**Downtime Required:** No (safe for production)

---

## Overview

This migration adds the cohort-based learning system to C4C Campus, including:
- 6 new tables (cohorts, cohort_enrollments, cohort_schedules, lesson_discussions, course_forums, forum_replies)
- Modifications to existing tables (courses, enrollments, lesson_progress)
- 14+ indexes for performance
- 25+ RLS policies for security
- 5 triggers for auto-updates
- 1 materialized view for roster queries

**Backward Compatibility:** ✅ Fully backward compatible
- Existing enrollments continue to work
- Legacy direct enrollments still supported
- No data loss or breaking changes

---

## Prerequisites

### Before Running Migration

1. **Backup Database**
   ```bash
   # Via Supabase CLI
   supabase db dump > backup_$(date +%Y%m%d).sql

   # Or via pg_dump
   pg_dump -h your-db-host -U postgres -d postgres > backup.sql
   ```

2. **Verify Supabase Version**
   ```bash
   supabase --version
   # Required: v1.0.0 or higher
   ```

3. **Check Database Permissions**
   ```sql
   -- Verify you have CREATE permission
   SELECT has_schema_privilege('public', 'CREATE');
   -- Should return: true
   ```

4. **Review Current Schema**
   ```sql
   -- Verify existing tables
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('courses', 'modules', 'lessons', 'enrollments', 'lesson_progress')
   ORDER BY tablename;
   -- All 5 tables should exist
   ```

---

## Migration Steps

### Step 1: Run Migration Script

**Option A: Via Supabase Dashboard (Recommended)**

1. Navigate to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `/Users/a0/Desktop/c4c website/schema.sql`
3. Click "Run" to execute
4. Verify no errors in output

**Option B: Via Supabase CLI**

```bash
# Navigate to project directory
cd /Users/a0/Desktop/c4c\ website

# Apply migration
supabase db push --file schema.sql

# Verify migration applied
supabase db pull
```

**Option C: Via psql**

```bash
# Connect to database
psql -h your-db-host -U postgres -d postgres

# Run migration
\i schema.sql

# Verify tables created
\dt public.*
```

---

### Step 2: Verify Tables Created

```sql
-- Check new tables
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'cohorts',
  'cohort_enrollments',
  'cohort_schedules',
  'lesson_discussions',
  'course_forums',
  'forum_replies'
)
ORDER BY tablename;
-- Should return all 6 tables
```

**Expected Output:**
```
      tablename
----------------------
 cohort_enrollments
 cohort_schedules
 cohorts
 course_forums
 forum_replies
 lesson_discussions
(6 rows)
```

---

### Step 3: Verify Indexes Created

```sql
-- Check indexes on cohort tables
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE '%cohort%'
OR tablename IN ('lesson_discussions', 'course_forums', 'forum_replies')
ORDER BY tablename, indexname;
-- Should return 14+ indexes
```

**Expected Indexes:**
- idx_cohorts_course_id
- idx_cohorts_status
- idx_cohorts_start_date
- idx_cohort_enrollments_cohort
- idx_cohort_enrollments_user
- idx_cohort_enrollments_status
- idx_cohort_enrollments_activity
- idx_cohort_schedules_cohort
- idx_cohort_schedules_module
- idx_cohort_schedules_unlock
- idx_lesson_discussions_lesson
- idx_lesson_discussions_cohort
- idx_lesson_discussions_user
- idx_lesson_discussions_parent
- (... and more)

---

### Step 4: Verify RLS Policies

```sql
-- Check RLS is enabled on new tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND (
  tablename LIKE '%cohort%'
  OR tablename IN ('lesson_discussions', 'course_forums', 'forum_replies')
)
ORDER BY tablename;
-- All should show rowsecurity = true
```

**Expected Output:**
```
      tablename       | rowsecurity
----------------------+-------------
 cohort_enrollments   | t
 cohort_schedules     | t
 cohorts              | t
 course_forums        | t
 forum_replies        | t
 lesson_discussions   | t
(6 rows)
```

---

### Step 5: Verify Triggers

```sql
-- Check triggers exist
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN (
  'cohorts',
  'cohort_enrollments',
  'lesson_discussions',
  'course_forums',
  'forum_replies',
  'lesson_progress'
)
ORDER BY event_object_table, trigger_name;
-- Should return 5+ triggers
```

**Expected Triggers:**
- update_cohorts_updated_at
- auto_update_cohort_status
- update_lesson_discussions_updated_at
- update_course_forums_updated_at
- update_forum_replies_updated_at
- auto_increment_completed_lessons

---

### Step 6: Verify Materialized View

```sql
-- Check materialized view exists
SELECT matviewname
FROM pg_matviews
WHERE schemaname = 'public'
AND matviewname = 'student_roster_view';
-- Should return 1 row

-- Verify refresh function exists
SELECT proname
FROM pg_proc
WHERE proname = 'refresh_student_roster_view';
-- Should return 1 row
```

---

### Step 7: Verify Table Modifications

```sql
-- Check courses table has new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'courses'
AND column_name IN ('is_cohort_based', 'default_duration_weeks', 'enrollment_type')
ORDER BY column_name;
-- Should return 3 rows

-- Check enrollments table has cohort_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'enrollments'
AND column_name = 'cohort_id';
-- Should return 1 row

-- Check lesson_progress table has cohort_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'lesson_progress'
AND column_name = 'cohort_id';
-- Should return 1 row
```

---

### Step 8: Test Basic Operations

```sql
-- Test 1: Create a test cohort
INSERT INTO cohorts (course_id, name, start_date, end_date, status, max_students, created_by)
SELECT
  id as course_id,
  'Test Migration Cohort' as name,
  CURRENT_DATE as start_date,
  CURRENT_DATE + INTERVAL '30 days' as end_date,
  'active' as status,
  50 as max_students,
  created_by
FROM courses
WHERE published = true
LIMIT 1
RETURNING id, name, status;
-- Should return cohort_id

-- Test 2: Enroll test user (replace with real user_id)
INSERT INTO cohort_enrollments (cohort_id, user_id, status)
SELECT
  (SELECT id FROM cohorts WHERE name = 'Test Migration Cohort'),
  (SELECT id FROM auth.users LIMIT 1),
  'active'
RETURNING id, cohort_id, user_id;
-- Should succeed if user exists

-- Test 3: Create schedule
INSERT INTO cohort_schedules (cohort_id, module_id, unlock_date)
SELECT
  (SELECT id FROM cohorts WHERE name = 'Test Migration Cohort'),
  m.id,
  CURRENT_DATE + (m.order_index * INTERVAL '7 days')
FROM modules m
WHERE m.course_id = (SELECT course_id FROM cohorts WHERE name = 'Test Migration Cohort')
LIMIT 3
RETURNING cohort_id, module_id, unlock_date;
-- Should create 3 schedule entries

-- Test 4: Query materialized view
SELECT * FROM student_roster_view
WHERE cohort_id = (SELECT id FROM cohorts WHERE name = 'Test Migration Cohort');
-- Should return the enrolled user

-- Test 5: Refresh materialized view
SELECT refresh_student_roster_view();
-- Should succeed

-- Clean up test data
DELETE FROM cohorts WHERE name = 'Test Migration Cohort';
-- Should cascade delete enrollments and schedules
```

---

## Data Backfill (Optional)

### Migrate Existing Enrollments to Cohorts

If you have existing enrollments and want to organize them into cohorts:

```sql
-- Step 1: Create "Legacy" cohorts for existing courses
INSERT INTO cohorts (course_id, name, start_date, status, max_students, created_by)
SELECT
  id as course_id,
  'Legacy Cohort' as name,
  created_at::date as start_date,
  'active' as status,
  1000 as max_students,
  created_by
FROM courses
WHERE published = true
AND id NOT IN (SELECT DISTINCT course_id FROM cohorts WHERE course_id IS NOT NULL)
RETURNING id, course_id, name;
-- Creates one "Legacy Cohort" per course

-- Step 2: Update existing enrollments with cohort_id
UPDATE enrollments e
SET cohort_id = c.id
FROM cohorts c
WHERE e.course_id = c.course_id
AND c.name = 'Legacy Cohort'
AND e.cohort_id IS NULL;
-- Links existing enrollments to legacy cohorts

-- Step 3: Backfill cohort_enrollments
INSERT INTO cohort_enrollments (cohort_id, user_id, enrolled_at, status, last_activity_at)
SELECT
  e.cohort_id,
  e.user_id,
  e.enrolled_at,
  e.status,
  COALESCE(e.completed_at, e.enrolled_at) as last_activity_at
FROM enrollments e
WHERE e.cohort_id IS NOT NULL
ON CONFLICT (cohort_id, user_id) DO NOTHING;
-- Creates cohort_enrollment records for existing enrollments

-- Step 4: Backfill lesson_progress with cohort_id
UPDATE lesson_progress lp
SET cohort_id = e.cohort_id
FROM enrollments e
JOIN lessons l ON lp.lesson_id = l.id
JOIN modules m ON l.module_id = m.id
WHERE e.user_id = lp.user_id
AND e.course_id = m.course_id
AND lp.cohort_id IS NULL;
-- Links existing progress to cohorts

-- Step 5: Verify backfill
SELECT
  c.name as cohort_name,
  COUNT(ce.id) as enrollments,
  COUNT(lp.id) as progress_records
FROM cohorts c
LEFT JOIN cohort_enrollments ce ON c.id = ce.cohort_id
LEFT JOIN lesson_progress lp ON c.id = lp.cohort_id
WHERE c.name = 'Legacy Cohort'
GROUP BY c.id, c.name;
-- Should show enrollment and progress counts
```

---

## Post-Migration Checklist

### Verification

- [ ] All 6 new tables created
- [ ] All 14+ indexes exist
- [ ] All 25+ RLS policies active (rowsecurity=true)
- [ ] All 5 triggers firing
- [ ] Materialized view queryable
- [ ] Table modifications applied (courses, enrollments, lesson_progress)
- [ ] Test cohort creation succeeds
- [ ] Test enrollment succeeds
- [ ] Test schedule creation succeeds
- [ ] Test roster view query succeeds

### Performance Testing

```sql
-- Test 1: Roster query performance (should be <200ms)
EXPLAIN ANALYZE
SELECT * FROM student_roster_view WHERE cohort_id = 1;
-- Check for Index Scan (good) vs Seq Scan (bad)

-- Test 2: Schedule lookup performance
EXPLAIN ANALYZE
SELECT * FROM cohort_schedules
WHERE cohort_id = 1 AND unlock_date <= CURRENT_DATE;
-- Should use idx_cohort_schedules_cohort and idx_cohort_schedules_unlock

-- Test 3: Discussion query performance
EXPLAIN ANALYZE
SELECT * FROM lesson_discussions
WHERE lesson_id = 1 AND cohort_id = 1
ORDER BY created_at DESC;
-- Should use indexes
```

### Application Updates Required

After successful migration, update your application code:

1. **Update Enrollment Flow**
   ```typescript
   // OLD: Direct course enrollment
   await supabase.from('enrollments').insert({ user_id, course_id });

   // NEW: Enroll in cohort
   await supabase.from('cohort_enrollments').insert({ user_id, cohort_id });
   ```

2. **Update Course Page**
   - Display available cohorts for enrollment
   - Show unlock schedule for enrolled cohort
   - Filter discussions by cohort

3. **Update Teacher Dashboard**
   - Add cohort management UI
   - Add student roster view
   - Add discussion moderation

4. **Update Admin Panel**
   - Add cohort creation interface
   - Add bulk enrollment tools

---

## Rollback Procedure

If you need to rollback this migration:

### Step 1: Drop New Tables (Preserves Existing Data)

```sql
-- Drop in reverse dependency order
DROP MATERIALIZED VIEW IF EXISTS student_roster_view CASCADE;
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS course_forums CASCADE;
DROP TABLE IF EXISTS lesson_discussions CASCADE;
DROP TABLE IF EXISTS cohort_schedules CASCADE;
DROP TABLE IF EXISTS cohort_enrollments CASCADE;
DROP TABLE IF EXISTS cohorts CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_cohorts_updated_at ON cohorts;
DROP TRIGGER IF EXISTS auto_update_cohort_status ON cohorts;
DROP TRIGGER IF EXISTS update_lesson_discussions_updated_at ON lesson_discussions;
DROP TRIGGER IF EXISTS update_course_forums_updated_at ON course_forums;
DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
DROP TRIGGER IF EXISTS auto_increment_completed_lessons ON lesson_progress;

-- Drop functions
DROP FUNCTION IF EXISTS refresh_student_roster_view();
DROP FUNCTION IF EXISTS update_cohort_status();
DROP FUNCTION IF EXISTS increment_completed_lessons();
```

### Step 2: Revert Table Modifications

```sql
-- Remove new columns from courses
ALTER TABLE courses DROP COLUMN IF EXISTS is_cohort_based;
ALTER TABLE courses DROP COLUMN IF EXISTS default_duration_weeks;
ALTER TABLE courses DROP COLUMN IF EXISTS enrollment_type;

-- Remove cohort_id from enrollments
ALTER TABLE enrollments DROP COLUMN IF EXISTS cohort_id;

-- Remove cohort_id from lesson_progress
ALTER TABLE lesson_progress DROP COLUMN IF EXISTS cohort_id;
```

### Step 3: Restore from Backup (If Needed)

```bash
# Restore full database
psql -h your-db-host -U postgres -d postgres < backup.sql

# Or restore specific tables
pg_restore -h your-db-host -U postgres -d postgres -t enrollments backup.sql
```

---

## Estimated Downtime

**Zero Downtime Migration:** ✅ Yes

This migration is safe to run on a live production database because:
- Only adds new tables (doesn't modify existing data)
- New columns are nullable or have defaults
- RLS policies don't affect existing queries
- Indexes are created concurrently (non-blocking)

**Recommended Maintenance Window:** None required, but consider low-traffic time for peace of mind.

---

## Performance Impact

### During Migration

- **Index Creation:** 10-30 seconds (depends on existing data size)
- **Trigger Creation:** <1 second
- **Materialized View:** Initial build <5 seconds (empty database)

### After Migration

- **Query Performance:** Improved (new indexes optimize common queries)
- **Storage Increase:** Minimal (6 new tables, mostly empty initially)
- **Ongoing Maintenance:** Materialized view refresh (recommended nightly)

---

## Troubleshooting

### Issue 1: Permission Denied

**Error:** `ERROR: permission denied for schema public`

**Solution:**
```sql
-- Grant necessary permissions
GRANT CREATE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO authenticated;
```

---

### Issue 2: Foreign Key Constraint Fails

**Error:** `ERROR: insert or update on table "cohorts" violates foreign key constraint`

**Solution:**
```sql
-- Verify referenced tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('courses', 'modules', 'lessons');
-- All must exist before running migration
```

---

### Issue 3: RLS Prevents Operations

**Error:** `ERROR: new row violates row-level security policy`

**Solution:**
```sql
-- Temporarily disable RLS for admin operations
ALTER TABLE cohorts DISABLE ROW LEVEL SECURITY;
-- Perform operation
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- Or use service_role key for admin operations
```

---

### Issue 4: Materialized View Refresh Fails

**Error:** `ERROR: could not refresh materialized view "student_roster_view"`

**Solution:**
```sql
-- Check for missing data in joined tables
SELECT ce.id, ce.user_id, a.id as app_id
FROM cohort_enrollments ce
LEFT JOIN applications a ON ce.user_id = a.user_id
WHERE a.id IS NULL;
-- If rows returned, some users lack application records

-- Fix by creating placeholder applications
INSERT INTO applications (user_id, name, email, program, status, role)
SELECT DISTINCT
  ce.user_id,
  'Unknown',
  u.email,
  'bootcamp',
  'approved',
  'student'
FROM cohort_enrollments ce
JOIN auth.users u ON ce.user_id = u.id
LEFT JOIN applications a ON ce.user_id = a.user_id
WHERE a.id IS NULL;

-- Retry refresh
SELECT refresh_student_roster_view();
```

---

## Security Considerations

### Service Role Key Protection

**CRITICAL:** Never expose service_role key to client-side code.

```typescript
// ❌ WRONG: Client-side with service role
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, SERVICE_ROLE_KEY); // DON'T DO THIS

// ✅ CORRECT: Server-side API route
// src/pages/api/admin/cohorts.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY // Server-only
);
```

### RLS Policy Testing

Before deploying to production, test all RLS policies:

```bash
# Run RLS test suite
npm run test:integration -- tests/integration/rls-policies.test.ts
```

---

## Related Documentation

- [ERD Diagram](../diagrams/cohort-erd.md) - Visual schema reference
- [RLS Policies](../security/cohort-rls-policies.md) - Security details
- [API Usage](../api/cohorts.md) - Code examples for new features
- [ROADMAP.md](../../ROADMAP.md) - Implementation timeline

---

## Support

**Issues?** Open a GitHub issue or contact the development team.

**Migration Support:**
- Email: dev@codeforcompassion.org
- Slack: #c4c-campus-dev

---

## Changelog

**v1.0.0 (2025-10-29)**
- Initial cohort system migration
- 6 new tables, 14+ indexes, 25+ RLS policies
- Backward compatible with existing enrollments
- Zero downtime deployment

---

**Migration Status:** Ready for Production
**Last Tested:** October 29, 2025
**Approved By:** Development Team

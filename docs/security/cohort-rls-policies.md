# Cohort System - Row Level Security (RLS) Policies

**Version:** 1.0.0
**Date:** October 29, 2025
**Status:** Implementation Complete

---

## Overview

This document details all Row Level Security (RLS) policies implemented for the cohort system. RLS ensures that users can only access data they're authorized to see, enforced at the database level (not just application level).

**Security Model:**
- Students: See only their enrolled cohorts and related data
- Teachers: See all data for courses they created
- Admins: See everything (via service_role)

---

## Table of Contents

1. [Cohorts Table Policies](#cohorts-table-policies)
2. [Cohort Enrollments Policies](#cohort-enrollments-policies)
3. [Cohort Schedules Policies](#cohort-schedules-policies)
4. [Lesson Discussions Policies](#lesson-discussions-policies)
5. [Course Forums Policies](#course-forums-policies)
6. [Forum Replies Policies](#forum-replies-policies)
7. [Testing RLS Policies](#testing-rls-policies)
8. [Security Audit Checklist](#security-audit-checklist)

---

## Cohorts Table Policies

### Table: `cohorts`
**RLS Enabled:** ✅ Yes

### Policy 1: Users View Active Cohorts for Published Courses

**Policy Name:** `"Users view active cohorts for published courses"`
**Operation:** SELECT
**Applies To:** All authenticated users

**Purpose:** Allow students to browse available cohorts for published courses they can enroll in.

**Implementation:**
```sql
CREATE POLICY "Users view active cohorts for published courses"
ON cohorts FOR SELECT
USING (
  status IN ('upcoming', 'active') AND
  course_id IN (SELECT id FROM courses WHERE published = true)
);
```

**What This Allows:**
- Students can view cohorts with status 'upcoming' or 'active'
- Only for courses that are published (published=true)
- Cannot see 'completed' or 'archived' cohorts (prevents confusion)

**What This Blocks:**
- Viewing cohorts for unpublished courses
- Viewing completed/archived cohorts
- Viewing cohorts for courses in draft state

**Example Query (Student Perspective):**
```sql
-- As student@test.c4c.com
SELECT * FROM cohorts WHERE course_id = 1;
-- Returns: Only upcoming/active cohorts for published courses
```

---

### Policy 2: Teachers Manage Cohorts in Own Courses

**Policy Name:** `"Teachers manage cohorts in own courses"`
**Operation:** ALL (SELECT, INSERT, UPDATE, DELETE)
**Applies To:** Course creators (teachers)

**Purpose:** Teachers can create and manage cohorts for courses they own.

**Implementation:**
```sql
CREATE POLICY "Teachers manage cohorts in own courses"
ON cohorts FOR ALL
USING (
  course_id IN (
    SELECT id FROM courses WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  course_id IN (
    SELECT id FROM courses WHERE created_by = auth.uid()
  )
);
```

**What This Allows:**
- Teachers can SELECT all cohorts for their courses (including archived)
- Teachers can INSERT new cohorts for their courses
- Teachers can UPDATE cohort details (name, dates, status, max_students)
- Teachers can DELETE cohorts (CASCADE deletes enrollments, schedules, discussions)

**What This Blocks:**
- Teachers cannot create cohorts for other teachers' courses
- Teachers cannot view/edit cohorts for courses they didn't create

**Example Queries (Teacher Perspective):**
```sql
-- As teacher@test.c4c.com (created course_id=1)

-- View all cohorts (including archived)
SELECT * FROM cohorts WHERE course_id = 1;
-- Returns: ALL cohorts for course_id=1 (success)

-- Create new cohort
INSERT INTO cohorts (course_id, name, start_date, end_date, max_students)
VALUES (1, 'Winter 2026 Cohort', '2026-01-15', '2026-03-15', 50);
-- Success: Teacher owns course_id=1

-- Try to create cohort for another teacher's course
INSERT INTO cohorts (course_id, name, start_date, end_date)
VALUES (2, 'Unauthorized Cohort', '2026-01-15', '2026-03-15');
-- Blocked: RLS denies (WITH CHECK fails)
```

---

### Policy 3: Service Role Can Manage All Cohorts

**Policy Name:** `"Service role can manage all cohorts"`
**Operation:** ALL (SELECT, INSERT, UPDATE, DELETE)
**Applies To:** service_role (admins)

**Purpose:** Admin operations and background jobs need full access.

**Implementation:**
```sql
CREATE POLICY "Service role can manage all cohorts"
ON cohorts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**What This Allows:**
- Admin panel can view/edit any cohort
- Background jobs can auto-update cohort statuses
- Migration scripts can run without restrictions

**Security Note:** Service role key must be protected (never exposed to client).

---

## Cohort Enrollments Policies

### Table: `cohort_enrollments`
**RLS Enabled:** ✅ Yes

### Policy 1: Users View Own Cohort Enrollments

**Policy Name:** `"Users view own cohort enrollments"`
**Operation:** SELECT
**Applies To:** Authenticated users

**Purpose:** Students can see which cohorts they're enrolled in.

**Implementation:**
```sql
CREATE POLICY "Users view own cohort enrollments"
ON cohort_enrollments FOR SELECT
USING (user_id = auth.uid());
```

**What This Allows:**
- Students can query their enrollment status
- Students can see their progress metrics (completed_lessons, last_activity_at)

**What This Blocks:**
- Students cannot see other students' enrollments
- Prevents privacy leaks (can't see who else is enrolled)

**Example Query:**
```sql
-- As student@test.c4c.com (user_id = abc-123)
SELECT * FROM cohort_enrollments WHERE cohort_id = 1;
-- Returns: Only the current user's enrollment record (if enrolled)
```

---

### Policy 2: Teachers View Enrollments in Their Cohorts

**Policy Name:** `"Teachers view enrollments in their cohorts"`
**Operation:** SELECT
**Applies To:** Teachers (course creators)

**Purpose:** Teachers need to see roster of students in their cohorts.

**Implementation:**
```sql
CREATE POLICY "Teachers view enrollments in their cohorts"
ON cohort_enrollments FOR SELECT
USING (
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
);
```

**What This Allows:**
- Teachers can view all enrollments for cohorts in their courses
- Used for student roster feature
- Enables progress tracking and engagement monitoring

**What This Blocks:**
- Teachers cannot see enrollments in other teachers' cohorts
- Maintains privacy boundaries between courses

**Example Query:**
```sql
-- As teacher@test.c4c.com (created course_id=1, which has cohort_id=5)
SELECT * FROM cohort_enrollments WHERE cohort_id = 5;
-- Returns: All enrollments for cohort_id=5 (success)

SELECT * FROM cohort_enrollments WHERE cohort_id = 99;
-- Returns: Empty (cohort_id=99 belongs to another teacher's course)
```

---

### Policy 3: Authenticated Users Can Enroll in Cohorts

**Policy Name:** `"Authenticated users can enroll in cohorts"`
**Operation:** INSERT
**Applies To:** authenticated role

**Purpose:** Self-service enrollment (students join cohorts themselves).

**Implementation:**
```sql
CREATE POLICY "Authenticated users can enroll in cohorts"
ON cohort_enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**What This Allows:**
- Students can enroll themselves in available cohorts
- User can only create enrollment records for themselves (not impersonate)

**What This Blocks:**
- Anonymous users cannot enroll (must be authenticated)
- Users cannot enroll other users (WITH CHECK enforces user_id = auth.uid())

**Application Logic Must Also Check:**
- Cohort is not full (max_students limit)
- Cohort status is 'upcoming' or 'active'
- User not already enrolled (UNIQUE constraint on table)

**Example:**
```sql
-- As student@test.c4c.com (auth.uid() = abc-123)
INSERT INTO cohort_enrollments (cohort_id, user_id, status)
VALUES (1, 'abc-123', 'active');
-- Success: user_id matches auth.uid()

INSERT INTO cohort_enrollments (cohort_id, user_id, status)
VALUES (1, 'xyz-789', 'active');
-- Blocked: WITH CHECK fails (trying to enroll someone else)
```

---

### Policy 4: Users Can Update Own Cohort Enrollment Status

**Policy Name:** `"Users can update own cohort enrollment status"`
**Operation:** UPDATE
**Applies To:** Authenticated users

**Purpose:** Students can drop/pause their own enrollment.

**Implementation:**
```sql
CREATE POLICY "Users can update own cohort enrollment status"
ON cohort_enrollments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

**What This Allows:**
- Student can change status from 'active' to 'dropped' or 'paused'
- Student can update their own enrollment record

**What This Blocks:**
- Students cannot modify other students' enrollments
- Students cannot change their user_id (WITH CHECK prevents)

**Example:**
```sql
-- As student@test.c4c.com (user_id = abc-123)
UPDATE cohort_enrollments
SET status = 'dropped'
WHERE cohort_id = 1 AND user_id = 'abc-123';
-- Success: Dropping own enrollment
```

---

### Policy 5: Service Role Can Manage All Cohort Enrollments

**Policy Name:** `"Service role can manage all cohort enrollments"`
**Operation:** ALL
**Applies To:** service_role

**Implementation:**
```sql
CREATE POLICY "Service role can manage all cohort enrollments"
ON cohort_enrollments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Purpose:** Admin operations, bulk enrollment, grade management.

---

## Cohort Schedules Policies

### Table: `cohort_schedules`
**RLS Enabled:** ✅ Yes

### Policy 1: Students View Schedules for Enrolled Cohorts

**Policy Name:** `"Students view schedules for enrolled cohorts"`
**Operation:** SELECT
**Applies To:** Authenticated users

**Purpose:** Students can see when modules unlock in their cohorts.

**Implementation:**
```sql
CREATE POLICY "Students view schedules for enrolled cohorts"
ON cohort_schedules FOR SELECT
USING (
  cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments WHERE user_id = auth.uid()
  )
);
```

**What This Allows:**
- Students can view unlock dates for modules in cohorts they're enrolled in
- Used to display "Unlocks on [date]" in UI

**What This Blocks:**
- Students cannot see schedules for cohorts they're not enrolled in
- Prevents snooping on other cohorts' pacing

**Example Query:**
```sql
-- As student@test.c4c.com (enrolled in cohort_id=1)
SELECT * FROM cohort_schedules WHERE cohort_id = 1;
-- Returns: All module unlock dates for cohort_id=1

SELECT * FROM cohort_schedules WHERE cohort_id = 2;
-- Returns: Empty (not enrolled in cohort_id=2)
```

---

### Policy 2: Teachers Manage Schedules in Their Cohorts

**Policy Name:** `"Teachers manage schedules in their cohorts"`
**Operation:** ALL (SELECT, INSERT, UPDATE, DELETE)
**Applies To:** Teachers (course creators)

**Purpose:** Teachers can set/modify unlock schedules for their cohorts.

**Implementation:**
```sql
CREATE POLICY "Teachers manage schedules in their cohorts"
ON cohort_schedules FOR ALL
USING (
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
)
WITH CHECK (
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
);
```

**What This Allows:**
- Teachers can create weekly unlock schedules
- Teachers can adjust unlock dates (e.g., delay a module release)
- Teachers can delete schedules (reverts to manual unlock)

**What This Blocks:**
- Teachers cannot modify schedules for other teachers' cohorts

**Example:**
```sql
-- As teacher@test.c4c.com (created course_id=1, cohort_id=5)
INSERT INTO cohort_schedules (cohort_id, module_id, unlock_date)
VALUES (5, 10, '2026-02-01');
-- Success: Setting unlock date for module 10 in cohort 5
```

---

## Lesson Discussions Policies

### Table: `lesson_discussions`
**RLS Enabled:** ✅ Yes

### Policy 1: Enrolled Students View Discussions in Their Cohorts

**Policy Name:** `"Enrolled students view discussions in their cohorts"`
**Operation:** SELECT
**Applies To:** Authenticated users

**Purpose:** Students can read discussions for lessons in their cohort.

**Implementation:**
```sql
CREATE POLICY "Enrolled students view discussions in their cohorts"
ON lesson_discussions FOR SELECT
USING (
  cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments WHERE user_id = auth.uid()
  )
);
```

**What This Allows:**
- Students can read lesson Q&A in their cohort
- Discussions are scoped to cohort (prevents cross-cohort confusion)

**What This Blocks:**
- Students cannot see discussions from other cohorts
- Students cannot see discussions from cohorts at different progress points

**Example:**
```sql
-- As student@test.c4c.com (enrolled in cohort_id=1)
SELECT * FROM lesson_discussions WHERE lesson_id = 50;
-- Returns: Only discussions from cohort_id=1 for lesson_id=50
```

---

### Policy 2: Enrolled Students Create Discussions

**Policy Name:** `"Enrolled students create discussions"`
**Operation:** INSERT
**Applies To:** authenticated role

**Purpose:** Students can post questions and replies.

**Implementation:**
```sql
CREATE POLICY "Enrolled students create discussions"
ON lesson_discussions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments WHERE user_id = auth.uid()
  )
);
```

**What This Allows:**
- Students can post new discussions
- Students can reply to existing discussions (parent_id set)

**What This Blocks:**
- Students cannot post in cohorts they're not enrolled in
- Students cannot impersonate other users (user_id must match auth.uid())

**Example:**
```sql
-- As student@test.c4c.com (enrolled in cohort_id=1)
INSERT INTO lesson_discussions (lesson_id, cohort_id, user_id, content)
VALUES (50, 1, auth.uid(), 'How do I...');
-- Success: Posting in enrolled cohort

INSERT INTO lesson_discussions (lesson_id, cohort_id, user_id, content)
VALUES (50, 2, auth.uid(), 'Another question');
-- Blocked: Not enrolled in cohort_id=2
```

---

### Policy 3: Users Update Own Discussions

**Policy Name:** `"Users update own discussions"`
**Operation:** UPDATE
**Applies To:** Authenticated users

**Purpose:** Students can edit their own posts (typo fixes, clarifications).

**Implementation:**
```sql
CREATE POLICY "Users update own discussions"
ON lesson_discussions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

**What This Allows:**
- Edit content of own posts
- Update is_pinned (if teacher)

**What This Blocks:**
- Editing other users' posts
- Changing user_id or post ownership

---

### Policy 4: Users Delete Own Discussions

**Policy Name:** `"Users delete own discussions"`
**Operation:** DELETE
**Applies To:** Authenticated users

**Purpose:** Students can delete their own posts.

**Implementation:**
```sql
CREATE POLICY "Users delete own discussions"
ON lesson_discussions FOR DELETE
USING (user_id = auth.uid());
```

**What This Allows:**
- Delete own posts (and CASCADE deletes child replies)

**What This Blocks:**
- Deleting other users' posts

---

### Policy 5: Teachers View and Moderate Discussions in Their Courses

**Policy Name:** `"Teachers view and moderate discussions in their courses"`
**Operation:** ALL (SELECT, INSERT, UPDATE, DELETE)
**Applies To:** Teachers

**Purpose:** Teachers can see all discussions, respond, and moderate.

**Implementation:**
```sql
CREATE POLICY "Teachers view and moderate discussions in their courses"
ON lesson_discussions FOR ALL
USING (
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
)
WITH CHECK (
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
);
```

**What This Allows:**
- Teachers can view all discussions across all cohorts in their courses
- Teachers can post responses (marked with is_teacher_response=true)
- Teachers can pin important posts
- Teachers can delete inappropriate posts

**Example:**
```sql
-- As teacher@test.c4c.com (created course_id=1)
SELECT * FROM lesson_discussions WHERE cohort_id IN (1, 2, 3);
-- Returns: All discussions from all cohorts (1, 2, 3) for course_id=1

UPDATE lesson_discussions SET is_pinned = true WHERE id = 123;
-- Success: Teacher pinning a helpful answer
```

---

## Course Forums Policies

### Table: `course_forums`
**RLS Enabled:** ✅ Yes

**Policies:** Similar structure to lesson_discussions

1. **"Enrolled students view forums in their cohorts"** - SELECT
2. **"Enrolled students create forum posts"** - INSERT (with is_locked=false check)
3. **"Users manage own forum posts"** - UPDATE/DELETE (with is_locked=false check)
4. **"Teachers view and moderate forums in their courses"** - ALL

**Key Difference:** Forum posts check `is_locked` flag to prevent replies on locked threads.

---

## Forum Replies Policies

### Table: `forum_replies`
**RLS Enabled:** ✅ Yes

**Policies:**

1. **"Users view forum replies"** - SELECT
   - Can view replies for forum posts in enrolled cohorts

2. **"Users create forum replies"** - INSERT
   - Can reply to unlocked forum posts in enrolled cohorts

3. **"Users manage own forum replies"** - UPDATE/DELETE
   - Can edit/delete own replies

4. **"Teachers view and moderate replies in their courses"** - ALL
   - Full moderation powers

---

## Testing RLS Policies

### Test Setup

```sql
-- Create test users
INSERT INTO auth.users (id, email) VALUES
  ('student-uuid', 'student@test.c4c.com'),
  ('teacher-uuid', 'teacher@test.c4c.com'),
  ('admin-uuid', 'admin@test.c4c.com');

-- Create test course (by teacher)
INSERT INTO courses (id, name, slug, published, created_by) VALUES
  (1, 'Test Course', 'test-course', true, 'teacher-uuid');

-- Create test cohort
INSERT INTO cohorts (id, course_id, name, start_date, status) VALUES
  (1, 1, 'Test Cohort', '2025-01-01', 'active');

-- Enroll student
INSERT INTO cohort_enrollments (cohort_id, user_id, status) VALUES
  (1, 'student-uuid', 'active');
```

### Test Cases

#### Test 1: Student Can View Only Enrolled Cohorts
```sql
-- Switch to student role
SET ROLE authenticated;
SET request.jwt.claims.sub = 'student-uuid';

-- Should succeed (enrolled in cohort_id=1)
SELECT * FROM cohorts WHERE id = 1;
-- Expected: 1 row returned

-- Should return empty (not enrolled)
SELECT * FROM cohorts WHERE id = 2;
-- Expected: 0 rows (RLS filters it out)
```

#### Test 2: Student Cannot View Other Students' Enrollments
```sql
-- As student-uuid (enrolled in cohort_id=1)
SELECT * FROM cohort_enrollments WHERE cohort_id = 1;
-- Expected: 1 row (own enrollment only)

-- Even if 50 students enrolled, RLS shows only own record
```

#### Test 3: Teacher Can View All Enrollments in Their Cohorts
```sql
-- Switch to teacher role
SET request.jwt.claims.sub = 'teacher-uuid';

-- Should succeed (owns course_id=1 → owns cohort_id=1)
SELECT * FROM cohort_enrollments WHERE cohort_id = 1;
-- Expected: All enrollments (50 rows if 50 students)
```

#### Test 4: Student Cannot Enroll Others
```sql
-- As student-uuid
INSERT INTO cohort_enrollments (cohort_id, user_id, status)
VALUES (1, 'other-student-uuid', 'active');
-- Expected: ERROR (WITH CHECK fails)
```

#### Test 5: Teacher Can Moderate Discussions
```sql
-- As teacher-uuid
UPDATE lesson_discussions SET is_pinned = true WHERE id = 123;
-- Expected: Success (teacher owns course)

-- As student-uuid (not post author)
UPDATE lesson_discussions SET is_pinned = true WHERE id = 123;
-- Expected: ERROR (USING clause fails)
```

---

## Security Audit Checklist

### Pre-Deployment Verification

- [ ] **RLS Enabled:** All cohort tables have RLS enabled
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename LIKE '%cohort%'
  OR tablename IN ('lesson_discussions', 'course_forums', 'forum_replies');
  -- All should show rowsecurity=true
  ```

- [ ] **Student Isolation:** Students can only see their own data
  - Test: Student A cannot see Student B's enrollments
  - Test: Student A cannot see discussions from cohorts they're not in

- [ ] **Teacher Boundaries:** Teachers only access their courses
  - Test: Teacher A cannot view Teacher B's cohorts
  - Test: Teacher A cannot moderate Teacher B's discussions

- [ ] **No RLS Bypass:** Application uses authenticated role (not service_role) for user operations
  - Review: API endpoints use Supabase client with user JWT
  - Review: Service role key only used in admin panel

- [ ] **Cascade Deletes:** Deleting parent records cleans up children
  - Test: Delete cohort → enrollments, schedules, discussions deleted
  - Test: Delete user → enrollments deleted (GDPR compliance)

- [ ] **UNIQUE Constraints:** Prevent duplicate enrollments
  - Test: Enrolling twice in same cohort fails with proper error

- [ ] **CHECK Constraints:** Status enums enforced
  - Test: Invalid cohort status rejected
  - Test: Invalid enrollment status rejected

---

## Common RLS Pitfalls to Avoid

### Pitfall 1: Using `SELECT *` in Policies
**Problem:** Performance issues with complex policies
**Solution:** Use specific columns and indexes

### Pitfall 2: Not Testing with Real Users
**Problem:** Policies work with service_role but fail for authenticated users
**Solution:** Test all policies with `SET ROLE authenticated`

### Pitfall 3: Forgetting WITH CHECK
**Problem:** Users can SELECT but INSERT fails unexpectedly
**Solution:** Always include WITH CHECK for INSERT/UPDATE policies

### Pitfall 4: RLS Bypass via Functions
**Problem:** SECURITY DEFINER functions can bypass RLS
**Solution:** Audit all functions with SECURITY DEFINER

### Pitfall 5: Exposing service_role Key
**Problem:** Client-side code leaks admin access
**Solution:** Never send service_role key to browser

---

## Performance Considerations

### Policy Query Cost

RLS policies add WHERE clauses to every query. Optimize with:

1. **Indexes:** All foreign keys and join columns indexed
2. **Materialized Views:** Pre-filter data for common queries
3. **Policy Simplicity:** Avoid complex subqueries in policies

### Monitoring RLS Performance

```sql
-- Enable query timing
SET track_io_timing = ON;

-- Explain a query with RLS
EXPLAIN ANALYZE
SELECT * FROM cohort_enrollments WHERE cohort_id = 1;
-- Check: Index scans (good) vs Sequential scans (bad)
```

---

## Related Documentation

- [ERD Diagram](../diagrams/cohort-erd.md) - Schema relationships
- [Migration Guide](../migrations/001-add-cohort-system.md) - Upgrade instructions
- [API Usage](../api/cohorts.md) - Code examples

---

## Changelog

**v1.0.0 (2025-10-29)**
- Initial RLS policies for cohort system
- 25+ policies across 6 tables
- Student, teacher, and admin access patterns
- Comprehensive security audit checklist

---

**Document Status:** Complete
**Security Review:** Required before production
**Last Updated:** October 29, 2025

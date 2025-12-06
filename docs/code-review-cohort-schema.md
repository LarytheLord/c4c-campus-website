# Code Review: Cohort System Database Schema

**Review Date:** October 29, 2025
**Reviewer:** Code Review Agent
**Scope:** Database schema analysis for cohort system implementation
**Related Tasks:** ROADMAP.md Task 1.1.2 (Week 1-2: Database Schema Implementation)

---

## Executive Summary

This code review analyzes the current C4C Campus database schema (`/Users/a0/Desktop/c4c website/schema.sql`) and identifies all changes needed to implement the cohort-based learning system as specified in the platform vision document.

**Current State:** The database has a working e-learning platform with courses, modules, lessons, enrollments, and progress tracking. However, it lacks cohort support entirely.

**Required Changes:**
- 6 new tables to add
- 2 existing tables to modify (ALTER statements)
- 1 materialized view to create
- Multiple RLS policies to implement
- 12+ indexes to add
- Foreign key relationships to establish

**Risk Assessment:** LOW - All changes are additive except for 2 non-breaking ALTER statements

---

## 1. Current Schema Analysis

### 1.1 Existing Tables

The current schema (`schema.sql` v1.0.0, dated 2025-01-29) contains 6 tables:

| Table | Primary Key | Purpose | Related Tables |
|-------|-------------|---------|----------------|
| `applications` | UUID | Bootcamp/accelerator applications | auth.users |
| `courses` | BIGSERIAL | Course catalog | auth.users (creator) |
| `modules` | BIGSERIAL | Course content grouping | courses |
| `lessons` | BIGSERIAL | Individual lesson content | modules |
| `enrollments` | BIGSERIAL | Student-course relationships | courses, auth.users |
| `lesson_progress` | BIGSERIAL | Video playback & completion tracking | lessons, auth.users |

### 1.2 Current Indexes (14 total)

**Applications (4 indexes):**
- `idx_applications_user_id` - User lookup
- `idx_applications_program` - Filter by program type
- `idx_applications_status` - Filter by status
- `idx_applications_created_at` - Sort by date (DESC)
- `idx_applications_role` - Filter by role

**E-Learning Platform (10 indexes):**
- `idx_courses_published_track` - Published courses by track
- `idx_courses_slug` - URL lookup
- `idx_modules_course` - Modules per course with ordering
- `idx_lessons_module` - Lessons per module with ordering
- `idx_enrollments_user` - User's enrollments
- `idx_enrollments_course` - Course enrollments
- `idx_progress_user` - User progress lookup
- `idx_progress_lesson` - Lesson progress lookup

**Index Quality:** Good coverage for current use cases, properly ordered, uses composite indexes where beneficial.

### 1.3 Current RLS Policies (15 total)

**Applications (5 policies):**
- Users can view/create/update own applications
- Admins (service_role) can view/update all applications

**Courses (2 policies):**
- Public can view published courses
- Teachers manage own courses (all operations)

**Modules (2 policies):**
- Users view modules of accessible courses
- Teachers manage modules in own courses

**Lessons (2 policies):**
- Users view lessons of accessible courses
- Teachers manage lessons in own courses

**Enrollments (3 policies):**
- Users view own enrollments
- Authenticated users can enroll themselves
- Service role can manage all enrollments

**Lesson Progress (1 policy):**
- Users manage own progress (all operations)

**RLS Pattern Analysis:**
- Uses `auth.uid()` for user identification
- Uses `auth.jwt() ->> 'role' = 'service_role'` for admin operations
- Properly separates SELECT, INSERT, UPDATE permissions
- Uses USING clause for row filtering, WITH CHECK for data validation
- Inheritance pattern: lessons inherit access from courses via joins

### 1.4 Current Triggers (2 total)

- `update_applications_updated_at` - Auto-update applications.updated_at
- `update_courses_updated_at` - Auto-update courses.updated_at

**Function:** `update_updated_at_column()` - Generic timestamp updater

### 1.5 Current Naming Conventions

- **Tables:** Plural lowercase (applications, courses, modules, lessons)
- **Columns:** Snake_case (user_id, created_at, video_position_seconds)
- **Indexes:** `idx_{table}_{columns}` pattern
- **Policies:** Descriptive English names in quotes
- **Foreign Keys:** {referenced_table}_id pattern
- **Timestamps:** TIMESTAMPTZ for timezone support
- **IDs:** Mixed strategy
  - Applications: UUID (for security/privacy)
  - E-learning: BIGSERIAL (for performance/simplicity)

### 1.6 Data Type Patterns

- **IDs:** UUID for users, BIGSERIAL for content
- **Text:** TEXT for flexible length, with CHECK constraints for enums
- **Booleans:** BOOLEAN with DEFAULT values
- **Arrays:** TEXT[] for interests
- **JSON:** JSONB for resources (structured data)
- **Timestamps:** TIMESTAMPTZ with DEFAULT NOW()
- **Numbers:** INT for counts, BIGINT for large numbers

---

## 2. Required Changes - Gap Analysis

### 2.1 New Tables Required (6 tables)

Based on `/Users/a0/Desktop/c4c website/docs/C4C_CAMPUS_PLATFORM_VISION.md` Section 1.2:

#### 2.1.1 `cohorts` Table

**Purpose:** Represent time-bound groups of students taking a course together

**Required Columns:**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
course_id UUID REFERENCES courses(id) ON DELETE CASCADE
name TEXT NOT NULL
start_date DATE NOT NULL
end_date DATE
status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'archived'))
max_students INTEGER DEFAULT 50
created_by UUID REFERENCES auth.users(id)
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Gap Analysis:**
- ⚠️ **ID Type Mismatch:** Vision uses UUID, but existing courses table uses BIGSERIAL
- ⚠️ **Foreign Key Type:** course_id references courses(id) which is BIGINT, not UUID
- ✅ Status enum is well-defined
- ✅ Timestamp pattern matches existing schema
- ❌ Missing trigger for updated_at auto-update

**Required Indexes (3):**
- `idx_cohorts_course_id` - Lookup cohorts by course
- `idx_cohorts_status` - Filter by status (upcoming/active/completed)
- Recommended: `idx_cohorts_start_date` - Sort by start date

**Required RLS Policies:**
- Students: View cohorts they're enrolled in
- Teachers: View/manage cohorts for their courses
- Service role: Full access

#### 2.1.2 `cohort_enrollments` Table

**Purpose:** Link students to specific cohorts with progress tracking

**Required Columns:**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused'))
progress JSONB DEFAULT '{}'
last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
UNIQUE(cohort_id, user_id)
```

**Gap Analysis:**
- ✅ Similar to enrollments table structure
- ✅ UNIQUE constraint prevents duplicate enrollments
- ✅ JSONB for progress tracking is flexible
- ⚠️ Progress schema needs documentation (what keys/structure?)
- ❌ No trigger for last_activity_at auto-update

**Required Indexes (3):**
- `idx_cohort_enrollments_cohort` - Lookup enrollments by cohort
- `idx_cohort_enrollments_user` - Lookup user's cohorts
- `idx_cohort_enrollments_status` - Filter by enrollment status

**Required RLS Policies:**
- Students: View/update own enrollments
- Teachers: View enrollments in their cohorts
- Service role: Full access

#### 2.1.3 `cohort_schedules` Table

**Purpose:** Define when modules unlock/lock for each cohort (time-gating)

**Required Columns:**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE
module_id UUID REFERENCES modules(id) ON DELETE CASCADE
unlock_date DATE NOT NULL
lock_date DATE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
UNIQUE(cohort_id, module_id)
```

**Gap Analysis:**
- ⚠️ **Critical ID Type Mismatch:** module_id references modules(id) which is BIGINT, not UUID
- ✅ UNIQUE constraint prevents duplicate schedules per module/cohort
- ✅ Optional lock_date is good for re-locking content
- ⚠️ Uses DATE not TIMESTAMPTZ - may need timezone consideration for unlock times

**Required Indexes (2):**
- `idx_cohort_schedules_cohort` - Lookup schedule by cohort
- `idx_cohort_schedules_unlock` - Query by unlock date (time-gating queries)

**Required RLS Policies:**
- Students: View schedules for enrolled cohorts
- Teachers: Manage schedules for their cohorts
- Service role: Full access

#### 2.1.4 `lesson_discussions` Table

**Purpose:** Cohort-specific threaded discussions per lesson

**Required Columns:**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE
cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
parent_id UUID REFERENCES lesson_discussions(id) ON DELETE CASCADE
content TEXT NOT NULL
is_teacher_response BOOLEAN DEFAULT FALSE
is_pinned BOOLEAN DEFAULT FALSE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Gap Analysis:**
- ⚠️ **Critical ID Type Mismatch:** lesson_id references lessons(id) which is BIGINT, not UUID
- ✅ Self-referencing parent_id enables threaded replies
- ✅ Teacher badge support (is_teacher_response)
- ✅ Pin functionality for important discussions
- ❌ Missing trigger for updated_at auto-update
- ⚠️ No XSS protection mentioned - content should be sanitized at application layer
- ⚠️ No character limit on content (could allow abuse)

**Required Indexes (4):**
- `idx_lesson_discussions_lesson` - Discussions per lesson
- `idx_lesson_discussions_cohort` - Discussions per cohort
- `idx_lesson_discussions_user` - User's discussions
- `idx_lesson_discussions_parent` - Threaded reply lookup

**Required RLS Policies:**
- Students: View/create discussions in enrolled cohorts
- Teachers: Full access to discussions in their cohorts
- Service role: Full access

#### 2.1.5 `course_forums` Table

**Purpose:** Course-wide forum posts per cohort

**Required Columns:**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
course_id UUID REFERENCES courses(id) ON DELETE CASCADE
cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
title TEXT NOT NULL
content TEXT NOT NULL
is_pinned BOOLEAN DEFAULT FALSE
is_locked BOOLEAN DEFAULT FALSE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Gap Analysis:**
- ⚠️ **Critical ID Type Mismatch:** course_id references courses(id) which is BIGINT, not UUID
- ✅ Separate title and content for forum posts
- ✅ Pin and lock features for moderation
- ❌ Missing trigger for updated_at auto-update
- ⚠️ No character limits on title/content

**Required Indexes (2):**
- `idx_course_forums_course` - Forums per course
- `idx_course_forums_cohort` - Forums per cohort

**Required RLS Policies:**
- Students: View/create posts in enrolled cohorts
- Teachers: Full access + lock/unlock capability
- Service role: Full access

#### 2.1.6 `forum_replies` Table

**Purpose:** Replies to forum posts

**Required Columns:**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
forum_post_id UUID REFERENCES course_forums(id) ON DELETE CASCADE
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
content TEXT NOT NULL
is_teacher_response BOOLEAN DEFAULT FALSE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Gap Analysis:**
- ✅ Simple reply structure
- ✅ Teacher badge support
- ❌ Missing trigger for updated_at auto-update
- ⚠️ No character limit on content

**Required Indexes (2):**
- `idx_forum_replies_post` - Replies per forum post
- `idx_forum_replies_user` - User's replies

**Required RLS Policies:**
- Students: View/create replies in enrolled cohorts
- Teachers: Full access to replies in their cohorts
- Service role: Full access

### 2.2 Modified Tables Required (2 tables)

#### 2.2.1 `courses` Table - Add Cohort Support

**Required ALTER Statements:**
```sql
ALTER TABLE courses ADD COLUMN is_cohort_based BOOLEAN DEFAULT TRUE;
ALTER TABLE courses ADD COLUMN default_duration_weeks INTEGER DEFAULT 8;
ALTER TABLE courses ADD COLUMN enrollment_type TEXT DEFAULT 'open'
  CHECK (enrollment_type IN ('open', 'cohort_only', 'hybrid'));
```

**Gap Analysis:**
- ✅ Non-breaking changes (all have defaults)
- ✅ Backward compatible with existing courses
- ✅ enrollment_type enum is well-designed
- ⚠️ DEFAULT TRUE for is_cohort_based may affect existing courses unexpectedly
- Recommendation: Consider DEFAULT FALSE for existing courses, TRUE for new ones

**Impact on Existing Data:**
- All existing courses will become cohort_based=TRUE unless explicitly set
- All existing courses will have 8-week default duration
- All existing courses will be 'open' enrollment

**No RLS Changes Required** - Existing policies sufficient

#### 2.2.2 `enrollments` Table - Link to Cohorts

**Required ALTER Statements:**
```sql
ALTER TABLE enrollments ADD COLUMN cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;
CREATE INDEX idx_enrollments_cohort ON enrollments(cohort_id);
```

**Gap Analysis:**
- ⚠️ **Critical Type Mismatch:** cohort_id is UUID but cohorts.id will also be UUID
- ✅ ON DELETE SET NULL is correct (preserve enrollment if cohort deleted)
- ✅ Nullable column is backward compatible
- ✅ Index added for performance

**Impact on Existing Data:**
- All existing enrollments will have cohort_id=NULL (standalone enrollments)
- No data migration needed initially
- Application logic must handle NULL cohort_id

**No RLS Changes Required** - Existing policies sufficient

### 2.3 Materialized View Required (1 view)

#### 2.3.1 `student_roster_view`

**Purpose:** Performance-optimized view for teacher dashboards showing student rosters

**Required Definition:**
```sql
CREATE MATERIALIZED VIEW student_roster_view AS
SELECT
  ce.cohort_id,
  c.course_id,
  ce.user_id,
  a.name,
  a.email,
  ce.enrolled_at,
  ce.status,
  ce.last_activity_at,
  COALESCE((ce.progress->>'completed_lessons')::INTEGER, 0) as completed_lessons,
  COUNT(DISTINCT ld.id) as discussion_posts,
  COUNT(DISTINCT cf.id) as forum_posts
FROM cohort_enrollments ce
JOIN applications a ON a.user_id = ce.user_id
JOIN cohorts c ON c.id = ce.cohort_id
LEFT JOIN lesson_discussions ld ON ld.user_id = ce.user_id AND ld.cohort_id = ce.cohort_id
LEFT JOIN course_forums cf ON cf.user_id = ce.user_id AND cf.cohort_id = ce.cohort_id
GROUP BY ce.cohort_id, c.course_id, ce.user_id, a.name, a.email,
         ce.enrolled_at, ce.status, ce.last_activity_at, ce.progress;
```

**Required Indexes (2):**
```sql
CREATE INDEX ON student_roster_view(cohort_id);
CREATE INDEX ON student_roster_view(course_id);
```

**Gap Analysis:**
- ✅ Joins necessary tables efficiently
- ✅ Aggregates discussion activity
- ✅ COALESCE handles NULL progress gracefully
- ⚠️ **Critical Issue:** Uses applications table for user info (name, email)
  - Problem: Not all users may have applications (teachers, admins)
  - Recommendation: Consider using auth.users metadata or separate profiles table
- ⚠️ No refresh strategy documented
  - Needs: Refresh schedule (manual? pg_cron? trigger-based?)
- ⚠️ Performance concern: Large cohorts (1000+ students) may have slow COUNT operations
- ⚠️ No RLS on materialized views - must be handled at application layer

**Refresh Strategy Needed:**
- Option 1: Manual refresh via cron job
- Option 2: pg_cron extension (requires superuser)
- Option 3: Trigger-based refresh on cohort_enrollments INSERT/UPDATE
- Recommendation: Start with manual, optimize later

---

## 3. Critical ID Type Mismatch Issues

### 3.1 The Problem

**Vision Document Uses:** UUID for all new table primary keys
**Current Schema Uses:** BIGSERIAL for courses, modules, lessons

**Foreign Key Mismatches:**
- `cohorts.course_id UUID` → `courses.id BIGINT` ❌
- `cohort_schedules.module_id UUID` → `modules.id BIGINT` ❌
- `lesson_discussions.lesson_id UUID` → `lessons.id BIGINT` ❌
- `course_forums.course_id UUID` → `courses.id BIGINT` ❌

### 3.2 Impact Assessment

**Severity:** HIGH - Will cause schema creation failure

**Affected Tables:**
- cohorts
- cohort_schedules
- lesson_discussions
- course_forums

### 3.3 Resolution Options

#### Option A: Change Vision Document Foreign Keys to BIGINT (RECOMMENDED)

**Pros:**
- No changes to existing schema
- Consistent with current e-learning platform
- BIGINT is sufficient for content IDs (can handle billions of records)
- Simpler migration

**Cons:**
- Inconsistent ID types within cohort system (UUID for cohorts, BIGINT for references)

**Changes Required:**
```sql
-- cohorts table
course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE

-- cohort_schedules table
module_id BIGINT REFERENCES modules(id) ON DELETE CASCADE

-- lesson_discussions table
lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE

-- course_forums table
course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE
```

#### Option B: Migrate Existing Tables to UUID (NOT RECOMMENDED)

**Pros:**
- Consistent UUID usage across all tables
- Better for distributed systems
- More secure (non-sequential IDs)

**Cons:**
- Complex migration required
- Downtime needed
- Risk of data loss
- All existing foreign keys must be updated
- Application code must be updated
- May break existing integrations

**Not recommended for production system with existing data**

### 3.4 Recommended Solution

**Use Option A:** Update vision document foreign keys to BIGINT

**Rationale:**
1. Current schema works well with BIGSERIAL
2. No need for distributed ID generation
3. Avoids risky migration
4. Can still use UUID for new cohort tables (user-facing entities)
5. BIGINT foreign keys are industry standard

---

## 4. Integration Points Analysis

### 4.1 Cohorts ↔ Courses Integration

**Relationship:** One course can have many cohorts (one-to-many)

**Current State:**
- `courses` table exists with BIGINT id
- No cohort support

**Integration Changes:**
```sql
-- courses table modifications
ALTER TABLE courses ADD COLUMN is_cohort_based BOOLEAN DEFAULT TRUE;
ALTER TABLE courses ADD COLUMN default_duration_weeks INTEGER DEFAULT 8;
ALTER TABLE courses ADD COLUMN enrollment_type TEXT DEFAULT 'open';

-- New cohorts table
CREATE TABLE cohorts (
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  -- ... other columns
);
```

**Application Logic Required:**
- When creating cohort, validate course exists and is cohort-enabled
- When displaying course catalog, show cohort information if available
- When teacher creates course, ask if cohort-based or self-paced
- Filter cohorts by course in teacher dashboard

**Query Pattern Example:**
```sql
-- Get all cohorts for a course
SELECT * FROM cohorts WHERE course_id = ? ORDER BY start_date DESC;

-- Get active cohorts for a course
SELECT * FROM cohorts WHERE course_id = ? AND status = 'active';
```

### 4.2 Cohort Enrollments ↔ Enrollments Integration

**Relationship:** Parallel tracking systems

**Current State:**
- `enrollments` table tracks user-course relationships
- No cohort concept

**Integration Changes:**
```sql
-- Add cohort_id to existing enrollments
ALTER TABLE enrollments ADD COLUMN cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;
```

**Two Enrollment Patterns:**
1. **Legacy/Self-Paced:** enrollments.cohort_id = NULL
2. **Cohort-Based:** enrollments.cohort_id = {cohort_uuid} AND cohort_enrollments record exists

**Data Consistency Considerations:**
- ⚠️ **Potential Issue:** Two sources of truth (enrollments vs cohort_enrollments)
- **Recommendation:**
  - Keep enrollments as master enrollment record
  - cohort_enrollments adds cohort-specific tracking (progress, activity)
  - Ensure both are created together for cohort students
  - Consider trigger or transaction to maintain consistency

**Application Logic Required:**
- When student enrolls in cohort:
  1. Create enrollment record with cohort_id
  2. Create cohort_enrollment record
  3. Use transaction to ensure both succeed
- When querying enrollments:
  - Check cohort_id to determine if cohort-based
  - Join cohort_enrollments for additional data

**Query Pattern Example:**
```sql
-- Get student's enrollments with cohort info
SELECT
  e.*,
  c.name as cohort_name,
  ce.progress,
  ce.last_activity_at
FROM enrollments e
LEFT JOIN cohorts c ON e.cohort_id = c.id
LEFT JOIN cohort_enrollments ce ON ce.cohort_id = c.id AND ce.user_id = e.user_id
WHERE e.user_id = ?;
```

### 4.3 Lesson Progress ↔ Cohort Tracking Integration

**Relationship:** lesson_progress tracks video playback, cohort_enrollments tracks overall progress

**Current State:**
- `lesson_progress` table tracks per-lesson completion
- `lesson_progress.completed` boolean indicates completion
- No cohort concept

**Integration Challenges:**
- ✅ No schema changes needed to lesson_progress
- ⚠️ `cohort_enrollments.progress JSONB` duplicates completion data
- ⚠️ Two sources of truth for progress

**Recommended Architecture:**

**Option 1: Keep lesson_progress as single source of truth (RECOMMENDED)**
- lesson_progress remains authoritative
- cohort_enrollments.progress stores aggregated summary only
- Update summary periodically or via trigger

**Option 2: Migrate progress to cohort_enrollments**
- Risky, complex migration
- Breaks existing non-cohort enrollments

**Application Logic Required:**
```javascript
// Calculate cohort progress from lesson_progress
function updateCohortProgress(userId, cohortId) {
  // 1. Get all lessons in cohort's course
  // 2. Count completed lessons from lesson_progress
  // 3. Update cohort_enrollments.progress JSONB
  // 4. Store: { completed_lessons: X, total_lessons: Y, percentage: Z }
}
```

**Trigger Recommendation:**
```sql
-- Trigger on lesson_progress to update cohort summary
CREATE OR REPLACE FUNCTION update_cohort_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- When lesson completed, update cohort_enrollments summary
  IF NEW.completed = TRUE THEN
    UPDATE cohort_enrollments
    SET progress = jsonb_set(
      progress,
      '{completed_lessons}',
      to_jsonb(COALESCE((progress->>'completed_lessons')::INTEGER, 0) + 1)
    ),
    last_activity_at = NOW()
    WHERE user_id = NEW.user_id
    AND cohort_id IN (
      SELECT c.id FROM cohorts c
      JOIN courses co ON c.course_id = co.id
      JOIN modules m ON m.course_id = co.id
      JOIN lessons l ON l.module_id = m.id
      WHERE l.id = NEW.lesson_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4.4 Materialized View ↔ Existing Tables

**Relationship:** student_roster_view aggregates data from multiple tables

**Dependencies:**
- cohort_enrollments (master)
- applications (user info)
- cohorts (cohort info)
- lesson_discussions (activity)
- course_forums (activity)

**Performance Considerations:**

**Strengths:**
- ✅ Pre-computed aggregations (COUNT operations)
- ✅ Single query for roster display
- ✅ Reduces load on transactional tables

**Weaknesses:**
- ⚠️ Stale data (not real-time)
- ⚠️ Full refresh can be slow with large datasets
- ⚠️ No incremental refresh built-in

**Refresh Strategy Recommendations:**

1. **Frequency:**
   - High-activity courses: Every 5-15 minutes
   - Low-activity courses: Hourly
   - Off-peak: Every 30 minutes

2. **Concurrency:**
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY student_roster_view;
   ```
   - Requires UNIQUE index on cohort_id
   - Allows reads during refresh

3. **Selective Refresh:**
   ```sql
   -- Only refresh specific cohort (via view filter)
   -- Not directly supported, need to rebuild view design
   ```

**Alternative: Real-time Roster Query**
- Consider if materialized view is premature optimization
- Modern databases handle joins well
- Could use regular view with caching at application layer

---

## 5. Migration Strategy

### 5.1 Migration Safety Assessment

**Risk Level:** LOW to MEDIUM

**Safe Operations (Zero Downtime):**
- Creating new tables (cohorts, cohort_enrollments, etc.)
- Adding indexes to new tables
- Creating new RLS policies
- Creating materialized view

**Potentially Risky Operations:**
- ALTER TABLE courses (adding columns with defaults)
- ALTER TABLE enrollments (adding foreign key column)
- Creating indexes on existing tables (locks table briefly)

### 5.2 Recommended Migration Order

#### Phase 1: Prepare Foundation (Can run in production)
```sql
-- Step 1: Create new standalone tables (no dependencies)
CREATE TABLE cohorts (...);
CREATE TABLE cohort_schedules (...);
CREATE TABLE lesson_discussions (...);
CREATE TABLE course_forums (...);
CREATE TABLE forum_replies (...);
CREATE TABLE cohort_enrollments (...);

-- Step 2: Create indexes on new tables
CREATE INDEX idx_cohorts_course_id ON cohorts(course_id);
-- ... (all other indexes)

-- Step 3: Enable RLS on new tables
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
-- ... (all other tables)
```

**Downtime:** None - New tables don't affect existing functionality

#### Phase 2: Modify Existing Tables (Brief lock)
```sql
-- Step 4: Add columns to courses (has DEFAULT, quick operation)
ALTER TABLE courses ADD COLUMN is_cohort_based BOOLEAN DEFAULT TRUE;
ALTER TABLE courses ADD COLUMN default_duration_weeks INTEGER DEFAULT 8;
ALTER TABLE courses ADD COLUMN enrollment_type TEXT DEFAULT 'open'
  CHECK (enrollment_type IN ('open', 'cohort_only', 'hybrid'));

-- Step 5: Add cohort_id to enrollments (nullable, quick operation)
ALTER TABLE enrollments ADD COLUMN cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;
CREATE INDEX idx_enrollments_cohort ON enrollments(cohort_id);
```

**Downtime:** < 1 second per ALTER statement (table lock)
**Best Practice:** Run during low-traffic window

#### Phase 3: Create RLS Policies (Safe)
```sql
-- Step 6: Create policies for all new tables
CREATE POLICY "Students view enrolled cohorts" ON cohorts ...;
-- ... (all policies)
```

**Downtime:** None - Policies don't lock tables

#### Phase 4: Create Materialized View (Safe)
```sql
-- Step 7: Create materialized view
CREATE MATERIALIZED VIEW student_roster_view AS ...;
CREATE INDEX ON student_roster_view(cohort_id);
CREATE INDEX ON student_roster_view(course_id);
```

**Downtime:** None - View creation doesn't affect existing tables

#### Phase 5: Create Triggers (Safe)
```sql
-- Step 8: Add updated_at triggers to new tables
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- ... (all other triggers)
```

**Downtime:** None

### 5.3 Rollback Strategy

**Rollback Script:**
```sql
-- Rollback in reverse order
DROP TRIGGER IF EXISTS update_cohorts_updated_at ON cohorts;
-- ... (all triggers)

DROP MATERIALIZED VIEW IF EXISTS student_roster_view;

DROP POLICY IF EXISTS "Students view enrolled cohorts" ON cohorts;
-- ... (all policies)

ALTER TABLE enrollments DROP COLUMN IF EXISTS cohort_id;
ALTER TABLE courses DROP COLUMN IF EXISTS is_cohort_based;
ALTER TABLE courses DROP COLUMN IF EXISTS default_duration_weeks;
ALTER TABLE courses DROP COLUMN IF EXISTS enrollment_type;

DROP TABLE IF EXISTS forum_replies;
DROP TABLE IF EXISTS course_forums;
DROP TABLE IF EXISTS lesson_discussions;
DROP TABLE IF EXISTS cohort_schedules;
DROP TABLE IF EXISTS cohort_enrollments;
DROP TABLE IF EXISTS cohorts;
```

**Rollback Safety:**
- ✅ All operations are DROP statements (safe if no data exists)
- ⚠️ If cohort data exists, will be permanently deleted
- ✅ Existing applications/courses/enrollments unaffected
- ⚠️ Dropping columns loses data permanently

**Recommendation:**
- Test migration on staging environment first
- Backup database before migration
- Keep rollback script ready
- Monitor for 24 hours before considering stable

### 5.4 Data Migration Considerations

**No Data Migration Needed for Initial Deployment:**
- All new tables start empty
- Existing enrollments remain functional (cohort_id = NULL)
- Existing courses remain functional (new columns have defaults)

**Future Data Migration (If Needed):**
If you want to migrate existing enrollments to cohorts:
```sql
-- 1. Create a cohort for each course
INSERT INTO cohorts (course_id, name, start_date, status, max_students)
SELECT
  id,
  name || ' - Legacy Cohort',
  NOW()::DATE,
  'active',
  1000
FROM courses;

-- 2. Link existing enrollments to new cohorts
UPDATE enrollments e
SET cohort_id = (SELECT id FROM cohorts WHERE course_id = e.course_id LIMIT 1)
WHERE cohort_id IS NULL;

-- 3. Create cohort_enrollments records
INSERT INTO cohort_enrollments (cohort_id, user_id, enrolled_at, status)
SELECT cohort_id, user_id, enrolled_at, status
FROM enrollments
WHERE cohort_id IS NOT NULL;
```

**Not recommended initially** - Better to start fresh with new cohorts

### 5.5 Backward Compatibility Analysis

**Existing Functionality Preserved:**
- ✅ Students can still enroll in courses directly (enrollments.cohort_id = NULL)
- ✅ Courses without cohorts still work (is_cohort_based flag)
- ✅ All existing RLS policies unchanged
- ✅ All existing indexes still work
- ✅ All existing triggers still work
- ✅ Lesson progress tracking unchanged

**New Functionality Gated:**
- Cohort features only activate when:
  1. Course has is_cohort_based = TRUE
  2. Cohort exists for course
  3. Student enrolled in cohort

**Application Code Compatibility:**
- ⚠️ Must check for cohort_id NULL before accessing cohort_enrollments
- ⚠️ Must handle mixed enrollment types (cohort vs non-cohort)
- ✅ Existing queries still work without modification

---

## 6. Security Review

### 6.1 Current RLS Policy Patterns

**Authentication Method:**
- `auth.uid()` - Gets current user's UUID from Supabase Auth JWT
- `auth.jwt() ->> 'role'` - Extracts role from JWT (used for service_role checks)

**Pattern 1: User-Scoped Access**
```sql
-- Users can only access their own data
USING (auth.uid() = user_id)
```
Used in: applications, enrollments, lesson_progress

**Pattern 2: Content Access Through Relationships**
```sql
-- Access based on enrollment or ownership
USING (
  course_id IN (
    SELECT course_id FROM enrollments WHERE user_id = auth.uid()
  )
)
```
Used in: modules, lessons (inherit course access)

**Pattern 3: Creator Ownership**
```sql
-- Teachers manage their own content
USING (created_by = auth.uid())
```
Used in: courses (teachers manage own courses)

**Pattern 4: Service Role (Admin)**
```sql
-- Bypass all restrictions for service role
USING (auth.jwt() ->> 'role' = 'service_role')
```
Used in: applications (admin access)

**Pattern 5: Public Read**
```sql
-- Everyone can view published content
USING (published = true)
```
Used in: courses (public catalog)

### 6.2 Recommended RLS Policies for New Tables

#### 6.2.1 Cohorts Table

```sql
-- Students view cohorts they're enrolled in
CREATE POLICY "Students view enrolled cohorts"
ON cohorts FOR SELECT
USING (
  id IN (
    SELECT cohort_id FROM cohort_enrollments
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Teachers view cohorts for their courses
CREATE POLICY "Teachers view own course cohorts"
ON cohorts FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses WHERE created_by = auth.uid()
  )
);

-- Teachers manage cohorts for their courses
CREATE POLICY "Teachers manage own course cohorts"
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

-- Service role full access
CREATE POLICY "Service role manage all cohorts"
ON cohorts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Security Strengths:**
- ✅ Students can only see cohorts they're enrolled in
- ✅ Teachers can't access other teachers' cohorts
- ✅ No anonymous access (all require auth)
- ✅ Service role has admin access

**Potential Issues:**
- ⚠️ No public view of cohort listings (by design?)
- ⚠️ Students can't browse available cohorts before enrolling
  - **Recommendation:** Add policy for viewing 'upcoming' cohorts of published courses
  ```sql
  CREATE POLICY "Public view upcoming cohorts"
  ON cohorts FOR SELECT
  USING (
    status = 'upcoming' AND
    course_id IN (SELECT id FROM courses WHERE published = true)
  );
  ```

#### 6.2.2 Cohort Enrollments Table

```sql
-- Students view their own enrollments
CREATE POLICY "Students view own cohort enrollments"
ON cohort_enrollments FOR SELECT
USING (auth.uid() = user_id);

-- Students update their own enrollments (for progress)
CREATE POLICY "Students update own cohort enrollments"
ON cohort_enrollments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Teachers view enrollments in their cohorts
CREATE POLICY "Teachers view cohort enrollments"
ON cohort_enrollments FOR SELECT
USING (
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
);

-- Authenticated users can enroll themselves
CREATE POLICY "Users enroll in cohorts"
ON cohort_enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role manage enrollments"
ON cohort_enrollments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Security Strengths:**
- ✅ Users can only see their own enrollment data
- ✅ Teachers can see enrollments in their cohorts (roster)
- ✅ Self-enrollment supported

**Potential Issues:**
- ⚠️ **Critical Security Flaw:** INSERT policy allows enrolling in ANY cohort
  - No check for max_students capacity
  - No check for enrollment_type restrictions
  - No check for cohort status (could enroll in completed cohort)

**Recommended Fix:**
```sql
-- Replace INSERT policy with capacity and status checks
CREATE POLICY "Users enroll in open cohorts"
ON cohort_enrollments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  cohort_id IN (
    SELECT c.id FROM cohorts c
    JOIN courses co ON c.course_id = co.id
    WHERE c.status IN ('upcoming', 'active')
    AND (co.enrollment_type IN ('open', 'hybrid'))
    AND (
      SELECT COUNT(*) FROM cohort_enrollments
      WHERE cohort_id = c.id AND status = 'active'
    ) < c.max_students
  )
);
```

#### 6.2.3 Cohort Schedules Table

```sql
-- Students view schedules for enrolled cohorts
CREATE POLICY "Students view cohort schedules"
ON cohort_schedules FOR SELECT
USING (
  cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments
    WHERE user_id = auth.uid()
  )
);

-- Teachers manage schedules for their cohorts
CREATE POLICY "Teachers manage cohort schedules"
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

-- Service role full access
CREATE POLICY "Service role manage schedules"
ON cohort_schedules FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Security Strengths:**
- ✅ Students can only see schedules for enrolled cohorts
- ✅ Teachers can only manage schedules for their courses

**No Critical Issues Identified**

#### 6.2.4 Discussion Tables (lesson_discussions, course_forums, forum_replies)

```sql
-- Students view discussions in enrolled cohorts
CREATE POLICY "Students view cohort discussions"
ON lesson_discussions FOR SELECT
USING (
  cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments
    WHERE user_id = auth.uid()
  )
);

-- Students create discussions in enrolled cohorts
CREATE POLICY "Students create discussions"
ON lesson_discussions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Users update their own discussions
CREATE POLICY "Users update own discussions"
ON lesson_discussions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Teachers manage discussions in their cohorts (including pin/delete)
CREATE POLICY "Teachers manage cohort discussions"
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

-- Service role full access
CREATE POLICY "Service role manage discussions"
ON lesson_discussions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Security Strengths:**
- ✅ Cohort isolation (students can't see other cohorts' discussions)
- ✅ Teachers can moderate their cohorts
- ✅ Users can edit own discussions

**Potential Issues:**
- ⚠️ No moderation for inappropriate content
- ⚠️ No rate limiting on discussion creation
- ⚠️ Users can update is_teacher_response on their own comments
  - **Recommendation:** Add check to prevent users from marking themselves as teachers
  ```sql
  WITH CHECK (
    auth.uid() = user_id AND
    (is_teacher_response = OLD.is_teacher_response OR
     user_id IN (SELECT created_by FROM courses ...))
  )
  ```

**Similar policies needed for course_forums and forum_replies**

### 6.3 Authentication Pattern Analysis

**Current Implementation:**
- Supabase Auth manages authentication
- JWT contains user_id and role
- `auth.uid()` function extracts user_id
- `auth.jwt()` function extracts full JWT

**Strengths:**
- ✅ Industry-standard JWT authentication
- ✅ Stateless (no session table needed)
- ✅ Supabase handles token refresh
- ✅ Built-in security (token signing, expiration)

**Potential Weaknesses:**
- ⚠️ Role stored in JWT (can't instantly revoke admin access)
  - Workaround: Short token expiry (e.g., 1 hour)
- ⚠️ No user profile table (using applications table as proxy)
  - Issue: Not all users have applications (teachers, admins)
  - **Recommendation:** Create dedicated user_profiles table
  ```sql
  CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

### 6.4 Potential Security Issues to Avoid

#### Issue 1: SQL Injection in Application Code
- ⚠️ If application code concatenates SQL, vulnerable to injection
- ✅ Supabase client uses parameterized queries by default
- **Recommendation:** Always use Supabase client methods, never raw SQL from frontend

#### Issue 2: Insecure Direct Object References (IDOR)
- ⚠️ If APIs accept cohort_id without validation, users could access other cohorts
- ✅ RLS policies prevent unauthorized access at database level
- **Recommendation:** Still validate in API layer for better error messages

#### Issue 3: Mass Assignment Vulnerabilities
- ⚠️ If API accepts all fields without filtering, users could set is_teacher_response=true
- ✅ RLS WITH CHECK prevents unauthorized field updates
- **Recommendation:** Explicitly whitelist allowed fields in API layer

#### Issue 4: Rate Limiting
- ⚠️ No rate limiting on discussion/forum posts
- ⚠️ Could enable spam or abuse
- **Recommendation:** Implement rate limiting at API or Edge Function layer
  ```javascript
  // Example: Limit to 10 posts per hour
  const recent = await supabase
    .from('lesson_discussions')
    .select('count')
    .eq('user_id', userId)
    .gt('created_at', new Date(Date.now() - 3600000));
  if (recent.count >= 10) throw new Error('Rate limit exceeded');
  ```

#### Issue 5: Content Moderation
- ⚠️ No content filtering for inappropriate language
- ⚠️ No mechanism to report/flag content
- **Recommendation:**
  - Add reported/flagged columns to discussion tables
  - Implement moderation queue for teachers/admins
  - Consider automated content filtering (profanity, spam)

#### Issue 6: Privacy Concerns
- ⚠️ student_roster_view exposes email addresses to teachers
- ✅ This is intended functionality (teachers need contact info)
- **Recommendation:** Document privacy policy clearly

#### Issue 7: Cascade Deletes
- ✅ ON DELETE CASCADE used appropriately
- ⚠️ Deleting a course will delete all cohorts, enrollments, discussions
- ✅ This is correct behavior (course owns all content)
- **Recommendation:** Implement soft deletes for courses
  ```sql
  ALTER TABLE courses ADD COLUMN deleted_at TIMESTAMPTZ;
  -- Update queries to filter WHERE deleted_at IS NULL
  ```

---

## 7. Performance Considerations

### 7.1 Index Coverage Analysis

**New Indexes Required: 19 total**

| Table | Indexes | Purpose | Priority |
|-------|---------|---------|----------|
| cohorts | 3 | course_id, status, start_date | HIGH |
| cohort_enrollments | 3 | cohort_id, user_id, status | HIGH |
| cohort_schedules | 2 | cohort_id, unlock_date | HIGH |
| lesson_discussions | 4 | lesson_id, cohort_id, user_id, parent_id | MEDIUM |
| course_forums | 2 | course_id, cohort_id | MEDIUM |
| forum_replies | 2 | forum_post_id, user_id | MEDIUM |
| student_roster_view | 2 | cohort_id, course_id | HIGH |
| enrollments (new) | 1 | cohort_id | HIGH |

**Index Strategy Quality:**
- ✅ All foreign keys indexed (critical for joins)
- ✅ Frequently filtered columns indexed (status, dates)
- ✅ Composite indexes not over-used (good balance)

**Potential Optimizations:**

1. **Composite Index Opportunity:**
   ```sql
   -- Instead of separate indexes on cohorts(status) and cohorts(course_id)
   CREATE INDEX idx_cohorts_course_status ON cohorts(course_id, status);
   ```
   - Benefits queries filtering by both course and status
   - Single index serves multiple queries

2. **Partial Index for Active Cohorts:**
   ```sql
   CREATE INDEX idx_cohorts_active ON cohorts(course_id)
   WHERE status = 'active';
   ```
   - Smaller index, faster queries for active cohorts
   - Most common use case

3. **Covering Index for Roster View:**
   ```sql
   CREATE INDEX idx_cohort_enrollments_roster ON cohort_enrollments
   (cohort_id, user_id)
   INCLUDE (enrolled_at, status, last_activity_at, progress);
   ```
   - Index-only scans (no table lookup needed)
   - Faster materialized view refresh

### 7.2 Query Performance Expectations

**Simple Queries (< 50ms):**
- Get cohorts for a course
- Get student's enrolled cohorts
- Get schedule for a cohort
- Check if module is unlocked

**Medium Queries (50-200ms):**
- Get student roster with progress
- Get all discussions for a lesson
- Get forum posts with replies

**Complex Queries (200-1000ms):**
- Refresh student_roster_view (with 1000+ students)
- Aggregate progress across all cohorts

**Load Test Scenarios Needed:**
- 1000+ student cohort roster load
- 100+ concurrent students accessing schedules
- 1000+ discussions on popular lesson

### 7.3 Scalability Concerns

**Potential Bottlenecks:**

1. **Materialized View Refresh:**
   - With 100 cohorts × 100 students = 10,000 rows
   - COUNT aggregations on discussions/forums could be slow
   - **Mitigation:**
     - Refresh only during off-peak hours
     - Use CONCURRENTLY option
     - Consider partitioning by cohort_id

2. **Discussion Pagination:**
   - Thread display requires recursive queries (parent_id)
   - Could be slow with deeply nested comments
   - **Mitigation:**
     - Limit nesting depth (e.g., max 5 levels)
     - Paginate at top level only
     - Use WITH RECURSIVE with LIMIT

3. **Schedule Unlock Queries:**
   - Every page load checks module unlock status
   - Could be high query volume
   - **Mitigation:**
     - Cache schedule in application layer
     - Cache by cohort_id (invalidate when schedule changes)
     - Use Redis/Memcached

4. **Enrollment Capacity Checks:**
   - Counting enrollments on every INSERT could be slow
   - Race condition possible (over-enrollment)
   - **Mitigation:**
     - Use transaction isolation
     - Consider enrollment queue system
     - Cache current enrollment count

### 7.4 Database Connection Pooling

**Current Setup:** Not documented in schema

**Recommendation:** Configure Supabase pooler
- Transaction mode for APIs
- Session mode for long-running operations
- Connection limit per user role

### 7.5 Monitoring and Alerts

**Recommended Metrics:**
- Query duration (P95, P99)
- Index hit ratio (should be > 95%)
- Table bloat (VACUUM needed?)
- Materialized view staleness

**Alert Thresholds:**
- Query > 1 second: WARNING
- Query > 5 seconds: CRITICAL
- Index hit ratio < 90%: WARNING
- Materialized view not refreshed in 1 hour: WARNING

---

## 8. Data Integrity and Validation

### 8.1 Constraint Coverage

**UNIQUE Constraints:**
- ✅ cohort_enrollments (cohort_id, user_id) - No duplicate enrollments
- ✅ cohort_schedules (cohort_id, module_id) - No duplicate schedules
- ✅ Existing: enrollments (user_id, course_id)
- ✅ Existing: lessons (module_id, slug)

**CHECK Constraints:**
- ✅ cohorts.status IN ('upcoming', 'active', 'completed', 'archived')
- ✅ cohort_enrollments.status IN ('active', 'completed', 'dropped', 'paused')
- ✅ courses.enrollment_type IN ('open', 'cohort_only', 'hybrid')
- ✅ Existing: All status and enum fields have CHECK constraints

**Foreign Key Constraints:**
- ✅ All foreign keys have ON DELETE CASCADE or SET NULL
- ✅ Cascade behavior is logical (delete course → delete cohorts)

**NOT NULL Constraints:**
- ✅ Critical fields marked NOT NULL (name, dates, status)
- ✅ Optional fields allow NULL (end_date, lock_date)

**Missing Validations:**
- ⚠️ No check: start_date < end_date
- ⚠️ No check: unlock_date <= lock_date
- ⚠️ No check: max_students > 0
- ⚠️ No check: default_duration_weeks > 0
- ⚠️ No length limits on TEXT fields (title, content)

**Recommended Additional Constraints:**
```sql
-- cohorts table
ALTER TABLE cohorts ADD CONSTRAINT check_dates
  CHECK (end_date IS NULL OR end_date >= start_date);
ALTER TABLE cohorts ADD CONSTRAINT check_max_students
  CHECK (max_students > 0);

-- cohort_schedules table
ALTER TABLE cohort_schedules ADD CONSTRAINT check_schedule_dates
  CHECK (lock_date IS NULL OR lock_date > unlock_date);

-- courses table
ALTER TABLE courses ADD CONSTRAINT check_duration
  CHECK (default_duration_weeks > 0);

-- discussion tables (prevent abuse)
ALTER TABLE lesson_discussions ADD CONSTRAINT check_content_length
  CHECK (length(content) BETWEEN 1 AND 10000);
ALTER TABLE course_forums ADD CONSTRAINT check_title_length
  CHECK (length(title) BETWEEN 1 AND 200);
```

### 8.2 Data Consistency Risks

**Risk 1: Orphaned Enrollments**
- **Scenario:** Student enrolled in cohort, cohort deleted, enrollment remains
- **Current Behavior:** cohort_id SET NULL (correct)
- ✅ Safe

**Risk 2: Double Enrollment**
- **Scenario:** Student enrolled via enrollments AND cohort_enrollments
- **Current Behavior:** No enforcement of single enrollment method
- ⚠️ **Risk:** Inconsistent state
- **Mitigation:** Application logic must enforce OR add CHECK constraint
  ```sql
  -- Pseudo-constraint (not directly supported)
  -- If cohort_id is NOT NULL in enrollments,
  -- must have matching cohort_enrollment record
  ```

**Risk 3: Progress Sync**
- **Scenario:** lesson_progress updated but cohort_enrollments.progress not updated
- **Current Behavior:** Manual sync required
- ⚠️ **Risk:** Stale progress data
- **Mitigation:** Use trigger (recommended in section 4.3)

**Risk 4: Capacity Overflow**
- **Scenario:** More students enrolled than max_students
- **Current Behavior:** No enforcement at database level
- ⚠️ **Risk:** Over-enrollment
- **Mitigation:** RLS policy WITH CHECK (recommended in section 6.2.2)

**Risk 5: Materialized View Staleness**
- **Scenario:** Roster view shows old data
- **Current Behavior:** Manual refresh required
- ⚠️ **Risk:** Teachers see incorrect student data
- **Mitigation:** Automated refresh schedule

### 8.3 Transaction Boundaries

**Critical Operations Requiring Transactions:**

1. **Cohort Enrollment:**
   ```sql
   BEGIN;
     INSERT INTO enrollments (user_id, course_id, cohort_id) VALUES (...);
     INSERT INTO cohort_enrollments (cohort_id, user_id) VALUES (...);
   COMMIT;
   ```

2. **Cohort Creation with Schedule:**
   ```sql
   BEGIN;
     INSERT INTO cohorts (...) RETURNING id;
     INSERT INTO cohort_schedules (cohort_id, ...) VALUES (...);
   COMMIT;
   ```

3. **Progress Update:**
   ```sql
   BEGIN;
     UPDATE lesson_progress SET completed = true WHERE ...;
     UPDATE cohort_enrollments SET progress = ... WHERE ...;
   COMMIT;
   ```

**Recommendation:** Use Supabase client's transaction support or Edge Functions with proper error handling

---

## 9. Testing Recommendations

### 9.1 Schema Testing (TDD Requirements per ROADMAP.md)

**Required Test Coverage: 95%+**

**Test Categories:**

#### 1. Table Creation Tests
```sql
-- Test: cohorts table exists
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE tablename = 'cohorts' AND schemaname = 'public'
);

-- Test: All columns exist with correct types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cohorts';
```

#### 2. Constraint Tests
```sql
-- Test: Duplicate cohort names allowed (different courses)
INSERT INTO cohorts (course_id, name) VALUES (1, 'Fall 2025');
INSERT INTO cohorts (course_id, name) VALUES (2, 'Fall 2025'); -- Should succeed

-- Test: Invalid status rejected
INSERT INTO cohorts (status) VALUES ('invalid'); -- Should fail

-- Test: Cascade delete
INSERT INTO cohorts (id, course_id) VALUES ('uuid1', 1);
DELETE FROM courses WHERE id = 1;
SELECT * FROM cohorts WHERE id = 'uuid1'; -- Should return 0 rows
```

#### 3. RLS Policy Tests
```sql
-- Test: Student can view enrolled cohort
SET request.jwt.claim.sub = 'student_uuid';
SELECT * FROM cohorts WHERE id = 'enrolled_cohort'; -- Should succeed

-- Test: Student cannot view other cohorts
SELECT * FROM cohorts WHERE id = 'other_cohort'; -- Should return 0 rows

-- Test: Enrollment capacity limit
-- (Enroll max_students, then try one more - should fail)
```

#### 4. Index Tests
```sql
-- Test: Index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'cohorts' AND indexname = 'idx_cohorts_course_id';

-- Test: Index is used in query plan
EXPLAIN SELECT * FROM cohorts WHERE course_id = 1;
-- Should show "Index Scan using idx_cohorts_course_id"
```

#### 5. Performance Tests
```sql
-- Test: Query completes in < 200ms
-- Load 1000 students into cohort_enrollments
-- Time: SELECT * FROM student_roster_view WHERE cohort_id = 'test_cohort';
```

### 9.2 Integration Tests

**Test Scenarios:**

1. **Cohort Lifecycle:**
   - Create course
   - Create cohort
   - Enroll students
   - Update schedule
   - Mark cohort complete

2. **Time-Gating:**
   - Verify locked modules inaccessible
   - Update schedule unlock date
   - Verify modules now accessible

3. **Discussion System:**
   - Create discussion
   - Add threaded replies
   - Pin discussion (teacher)
   - Verify cohort isolation

4. **Roster View:**
   - Enroll 100 students
   - Create discussions
   - Refresh materialized view
   - Verify counts accurate

5. **Enrollment Flow:**
   - Student enrolls in cohort
   - Verify enrollments AND cohort_enrollments created
   - Verify progress tracking initialized

### 9.3 Load Testing

**Scenarios from ROADMAP.md:**

1. **Test with 100+ student cohort:**
   - Create cohort
   - Enroll 150 students
   - Measure query performance on roster view

2. **Query performance < 200ms:**
   - Benchmark all major queries
   - Ensure indexes are used

3. **Concurrent enrollment handling:**
   - 50 students try to enroll simultaneously
   - Verify no race conditions
   - Verify capacity limit enforced

**Recommended Tool:** k6 or Apache JMeter

---

## 10. Documentation Gaps

### 10.1 Missing Documentation

**Schema Documentation:**
- ❌ ERD diagram for cohort system
- ❌ Data dictionary for JSONB fields (progress structure)
- ❌ Migration guide for existing installations
- ❌ Rollback procedures

**API Documentation:**
- ❌ Cohort API endpoints
- ❌ Enrollment API
- ❌ Discussion API
- ❌ Request/response examples

**Security Documentation:**
- ❌ RLS policy decisions explained
- ❌ Privacy policy for student data
- ❌ Access control matrix

**Operational Documentation:**
- ❌ Materialized view refresh schedule
- ❌ Backup and restore procedures
- ❌ Monitoring and alerting setup
- ❌ Database maintenance (VACUUM, ANALYZE)

### 10.2 Recommended Documentation

**1. ERD Diagram (Priority: HIGH)**
Create visual diagram showing:
- All tables and relationships
- Foreign key constraints
- Cardinality (one-to-many, etc.)
- New tables highlighted

**2. JSONB Schema Documentation (Priority: HIGH)**
Document structure of:
- `cohort_enrollments.progress`
  ```json
  {
    "completed_lessons": 5,
    "total_lessons": 20,
    "percentage": 25,
    "last_lesson_id": 42
  }
  ```
- `lessons.resources`
  ```json
  [
    {
      "name": "Starter workflow.json",
      "path": "resources/course-1/starter.json",
      "size": 1024
    }
  ]
  ```

**3. Migration Checklist (Priority: HIGH)**
Step-by-step guide for deploying cohort system:
- [ ] Backup database
- [ ] Run migration script
- [ ] Verify tables created
- [ ] Test RLS policies
- [ ] Deploy application code
- [ ] Monitor for errors
- [ ] Update documentation

**4. RLS Policy Decision Log (Priority: MEDIUM)**
Document why each policy exists:
- Why students can only view enrolled cohorts
- Why materialized view has no RLS (application-layer)
- Why service_role bypasses all policies

---

## 11. Critical Issues Summary

### 11.1 Blocking Issues (Must Fix Before Implementation)

#### Issue #1: ID Type Mismatches (CRITICAL)
**Problem:** Vision document uses UUID foreign keys to BIGINT primary keys
**Impact:** Schema creation will fail
**Resolution:** Change foreign keys to BIGINT (see Section 3.3)
**Files Affected:** Vision document Section 1.2

#### Issue #2: Progress Tracking Duplication (HIGH)
**Problem:** Two sources of truth (lesson_progress vs cohort_enrollments.progress)
**Impact:** Data inconsistency, confusion
**Resolution:** Make lesson_progress authoritative, sync to cohort_enrollments via trigger (see Section 4.3)

#### Issue #3: Enrollment Capacity Not Enforced (HIGH)
**Problem:** RLS policy allows enrolling beyond max_students
**Impact:** Over-enrollment possible
**Resolution:** Add capacity check to RLS WITH CHECK (see Section 6.2.2)

### 11.2 High-Priority Improvements

#### Improvement #1: Add Date Validation Constraints
**Current:** No check that start_date < end_date
**Recommendation:** Add CHECK constraints (see Section 8.1)
**Impact:** Prevent invalid date ranges

#### Improvement #2: Add Content Length Limits
**Current:** TEXT fields have no limits
**Recommendation:** Add CHECK constraints (1-10000 chars for content)
**Impact:** Prevent abuse, improve storage

#### Improvement #3: Create User Profiles Table
**Current:** Using applications table for user info
**Recommendation:** Create dedicated user_profiles table
**Impact:** Support users without applications (teachers, admins)

#### Improvement #4: Implement Soft Deletes
**Current:** Hard deletes cascade through all related tables
**Recommendation:** Add deleted_at column to courses/cohorts
**Impact:** Prevent accidental data loss

### 11.3 Medium-Priority Improvements

1. Add composite indexes for common query patterns
2. Add partial indexes for active cohorts
3. Implement rate limiting on discussions
4. Add content moderation flags
5. Create automated materialized view refresh
6. Add monitoring and alerting
7. Document JSONB schemas

---

## 12. Recommendations & Next Steps

### 12.1 Immediate Actions (Before Starting Implementation)

1. **Fix ID Type Mismatches (Blocker)**
   - Update vision document foreign keys from UUID to BIGINT
   - Document decision in commit message
   - Estimated Time: 15 minutes

2. **Create Migration Scripts**
   - Write complete migration SQL file
   - Write rollback SQL file
   - Test on local database
   - Estimated Time: 2 hours

3. **Design Progress Sync Strategy**
   - Document authoritative source (lesson_progress)
   - Write trigger for cohort_enrollments sync
   - Test with sample data
   - Estimated Time: 1 hour

4. **Write Capacity Check RLS Policy**
   - Update cohort_enrollments INSERT policy
   - Test with enrollment scenarios
   - Estimated Time: 30 minutes

### 12.2 Implementation Phase Actions

1. **Phase 1: Schema Creation**
   - Run migration script on staging
   - Verify all tables, indexes, policies created
   - Run test suite (TDD)
   - Estimated Time: 4 hours

2. **Phase 2: Validation**
   - Add CHECK constraints
   - Add triggers for updated_at
   - Test constraint violations
   - Estimated Time: 2 hours

3. **Phase 3: RLS Policies**
   - Create all policies (see Section 6.2)
   - Test with different user roles
   - Verify security isolation
   - Estimated Time: 4 hours

4. **Phase 4: Materialized View**
   - Create student_roster_view
   - Test refresh performance
   - Set up refresh schedule
   - Estimated Time: 2 hours

### 12.3 Post-Implementation Actions

1. **Documentation**
   - Create ERD diagram
   - Document JSONB schemas
   - Write migration guide
   - Update ROADMAP.md
   - Estimated Time: 4 hours

2. **Testing**
   - Run integration tests
   - Load test with 1000+ students
   - Security audit
   - Estimated Time: 8 hours

3. **Monitoring Setup**
   - Configure performance monitoring
   - Set up alerts
   - Create dashboard
   - Estimated Time: 2 hours

### 12.4 Future Enhancements (Post-MVP)

1. Create user_profiles table (separate from applications)
2. Implement soft deletes for courses/cohorts
3. Add content moderation system
4. Optimize indexes based on production query patterns
5. Implement caching strategy for schedules
6. Add rate limiting on discussions/forums
7. Create automated backup system
8. Implement audit logging for sensitive operations

---

## 13. Approval Checklist

Before proceeding with implementation, verify:

- [ ] ID type mismatches resolved (UUID vs BIGINT)
- [ ] Migration script written and tested on staging
- [ ] Rollback script prepared
- [ ] Progress tracking strategy documented
- [ ] RLS policies include capacity checks
- [ ] All foreign keys have correct ON DELETE behavior
- [ ] Indexes cover all foreign keys and frequent filters
- [ ] CHECK constraints added for data validation
- [ ] Triggers created for updated_at columns
- [ ] Materialized view refresh strategy defined
- [ ] Test suite covers 95%+ of schema functionality
- [ ] Documentation updated (ERD, migration guide)
- [ ] Security review completed
- [ ] Performance benchmarks established
- [ ] ROADMAP.md updated with completion status

---

## Appendix A: Quick Reference

### Tables Summary
| Table | Purpose | PK Type | Status |
|-------|---------|---------|--------|
| applications | Application forms | UUID | Exists |
| courses | Course catalog | BIGINT | Exists (modify) |
| modules | Course sections | BIGINT | Exists |
| lessons | Course content | BIGINT | Exists |
| enrollments | Student-course link | BIGINT | Exists (modify) |
| lesson_progress | Video tracking | BIGINT | Exists |
| **cohorts** | **Time-bound cohorts** | **UUID** | **NEW** |
| **cohort_enrollments** | **Cohort membership** | **UUID** | **NEW** |
| **cohort_schedules** | **Module unlocking** | **UUID** | **NEW** |
| **lesson_discussions** | **Lesson comments** | **UUID** | **NEW** |
| **course_forums** | **Course forums** | **UUID** | **NEW** |
| **forum_replies** | **Forum replies** | **UUID** | **NEW** |

### Indexes Summary
- Existing: 14 indexes
- New: 19 indexes
- Total: 33 indexes

### RLS Policies Summary
- Existing: 15 policies
- New: ~24 policies (4 per table × 6 tables)
- Total: ~39 policies

### Migration Impact
- New Tables: 6
- Modified Tables: 2 (non-breaking)
- Downtime: < 1 minute
- Rollback: Safe (if no data created)

---

## Document Metadata

**Review Completed:** October 29, 2025
**Schema Version Reviewed:** 1.0.0 (dated 2025-01-29)
**Vision Document:** C4C_CAMPUS_PLATFORM_VISION.md Section 1.2
**Roadmap Reference:** Task 1.1.2 (Week 1-2)
**Next Review:** After implementation completion
**Review Status:** ✅ COMPLETE - Ready for implementation

---

**Reviewer Notes:**

This code review identified 3 critical blocking issues that must be resolved before implementation:
1. UUID/BIGINT type mismatches in foreign keys
2. Missing enforcement of enrollment capacity limits
3. Undefined progress tracking synchronization strategy

Once these are addressed, the schema design is solid, well-thought-out, and ready for implementation. The migration is low-risk with clear rollback procedures. Security through RLS is comprehensive with minor improvements needed. Performance considerations are well-covered with appropriate indexes.

**Confidence Level:** HIGH - This implementation can proceed safely once blocking issues are resolved.

**Estimated Implementation Time:** 2-3 days (including testing)

---

**END OF CODE REVIEW**

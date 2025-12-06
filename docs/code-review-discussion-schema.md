# Code Review: Discussion System Integration Analysis

**Date:** October 29, 2025
**Roadmap Reference:** Task 1.2.2 - Discussion System Schema
**Status:** Pre-Implementation Analysis
**Reviewer:** Code Review Agent

---

## Executive Summary

This code review analyzes the C4C Campus platform's current state to inform the integration of a discussion system (lesson discussions, course forums, and threaded replies) as outlined in the roadmap and vision document. The analysis reveals a well-structured foundation with established patterns for RLS, authentication, and data modeling that can be leveraged for the discussion system.

**Key Findings:**
- No existing discussion/comment infrastructure detected
- Strong RLS patterns established for user-generated content
- Cohort-based access control is planned but not yet implemented
- Existing pagination patterns are minimal; will need enhancement
- Service role pattern established for admin operations
- Hard delete pattern currently used; soft delete recommended for discussions

---

## 1. Current Comment/Discussion Infrastructure

### 1.1 Existing Discussion Systems
**Status:** ❌ NONE FOUND

**Search Results:**
- Searched entire codebase for: `comment`, `discussion`, `forum`, `reply`, `thread`
- Found only 1 match in `/src/pages/api/contact.ts` (unrelated - contact form)
- No Astro components for discussions
- No API endpoints for discussions
- No database tables for discussions

**Conclusion:** The discussion system will be built from scratch. This is actually beneficial as we can design it correctly from the ground up without legacy constraints.

---

## 2. Integration Analysis

### 2.1 Linking Discussions to Lessons Table

**Current Lessons Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  video_path TEXT,
  youtube_url TEXT,
  video_size_bytes BIGINT,
  video_duration_seconds INT,
  text_content TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, slug)
);
```

**Index Coverage:**
```sql
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, order_index);
```

**Integration Requirements:**

1. **Foreign Key Relationship:**
   - `lesson_discussions.lesson_id` → `lessons.id` (ON DELETE CASCADE)
   - Proper index needed: `CREATE INDEX idx_lesson_discussions_lesson ON lesson_discussions(lesson_id);`
   - ✅ Already specified in vision document

2. **Access Pattern:**
   - Lessons are accessed via module → course hierarchy
   - Discussions inherit this hierarchy but add cohort dimension
   - Query pattern: `lesson_id` + `cohort_id` → discussions for that lesson in specific cohort

3. **Data Integrity:**
   - CASCADE delete is appropriate: if lesson deleted, discussions should be removed
   - Alternative: soft delete lessons and preserve discussions (see Section 5.3)

**Recommendation:** ✅ The vision document's schema is well-designed for lesson integration.

---

### 2.2 Linking Forums to Courses Table

**Current Courses Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  track TEXT CHECK (track IN ('animal-advocacy', 'climate', 'ai-safety', 'general')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  estimated_hours INT,
  published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Index Coverage:**
```sql
CREATE INDEX IF NOT EXISTS idx_courses_published_track ON courses(published, track);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
```

**Integration Requirements:**

1. **Foreign Key Relationship:**
   - `course_forums.course_id` → `courses.id` (ON DELETE CASCADE)
   - Index needed: `CREATE INDEX idx_course_forums_course ON course_forums(course_id);`
   - ✅ Already specified in vision document

2. **Access Pattern:**
   - Forums are course-level (not lesson-specific)
   - Still scoped by cohort (same course, different cohorts have separate forums)
   - Query pattern: `course_id` + `cohort_id` → forum posts for that course cohort

3. **Teacher Permissions:**
   - Current pattern: `courses.created_by` identifies course owner
   - Forum moderation: teachers should moderate their own course forums
   - Query join needed: `course_forums JOIN courses ON course_id = courses.id WHERE created_by = auth.uid()`

**Recommendation:** ✅ Schema is sound. Need to add RLS policy for teacher moderation (see Section 3.3).

---

### 2.3 Integration with Cohort Enrollments

**Current State:** ⚠️ Cohort system NOT YET IMPLEMENTED

**Planned Cohort Tables (from vision doc):**
```sql
CREATE TABLE cohort_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  progress JSONB DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);
```

**Integration Requirements for Activity Tracking:**

1. **Last Activity Timestamp:**
   - `cohort_enrollments.last_activity_at` should update on discussion posts
   - Trigger or application-level update needed
   - Vision doc API includes this: `UPDATE cohort_enrollments SET last_activity_at = NOW() WHERE ...`

2. **Discussion Metrics in Roster View:**
   ```sql
   CREATE MATERIALIZED VIEW student_roster_view AS
   SELECT
     -- ... other fields ...
     COUNT(DISTINCT ld.id) as discussion_posts,
     COUNT(DISTINCT cf.id) as forum_posts
   FROM cohort_enrollments ce
   LEFT JOIN lesson_discussions ld ON ld.user_id = ce.user_id AND ld.cohort_id = ce.cohort_id
   LEFT JOIN course_forums cf ON cf.user_id = ce.user_id AND cf.cohort_id = ce.cohort_id
   GROUP BY ...;
   ```
   - ✅ Already included in vision document's materialized view

3. **Access Control:**
   - Users must be enrolled in cohort to post discussions
   - RLS policy needs subquery: `WHERE cohort_id IN (SELECT cohort_id FROM cohort_enrollments WHERE user_id = auth.uid())`

**Recommendation:**
- ⚠️ Cohort tables must be implemented BEFORE discussion tables (dependency)
- ✅ Vision document correctly sequences this: cohort schema (1.1) before discussion schema (1.2)

---

### 2.4 User Profile Integration

**Current User Model:**
- Auth: `auth.users` (Supabase built-in)
- Profile data: `applications` table

**Applications Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program TEXT NOT NULL CHECK (program IN ('bootcamp', 'accelerator', 'hackathon')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  location TEXT,
  discord TEXT,
  -- ... other fields ...
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin'))
);
```

**Integration Requirements:**

1. **Author Information Display:**
   - Discussions need to show: author name, role badge (teacher/student)
   - Join pattern: `lesson_discussions ld JOIN applications a ON ld.user_id = a.user_id`
   - Need: `a.name`, `a.role`

2. **Teacher Badge Logic:**
   - Vision doc includes: `is_teacher_response BOOLEAN DEFAULT FALSE`
   - Set on insert based on: `applications.role IN ('teacher', 'admin')`
   - Vision doc API correctly implements this check

3. **User Profile Link:**
   - Future enhancement: link to user profile page
   - Current: no user profile pages exist yet
   - Can defer this to Phase 2 (AI assistant integration includes user features)

**Recommendation:** ✅ Current user model is sufficient. Query joins will work.

---

## 3. RLS (Row Level Security) Strategy

### 3.1 Existing RLS Patterns Analysis

**Pattern 1: User-Owned Content**
```sql
-- Users manage their own content
CREATE POLICY "Users manage own progress"
ON lesson_progress FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```
- ✅ Proven pattern for user-generated content
- Apply to discussions: users can edit/delete their own posts

**Pattern 2: Hierarchical Access (Inherit from Parent)**
```sql
-- Modules inherit course access
CREATE POLICY "Users view modules of accessible courses"
ON modules FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses WHERE published = true
    OR id IN (
      SELECT course_id FROM enrollments WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
```
- ✅ Subquery pattern for inherited permissions
- Apply to discussions: inherit from cohort enrollment

**Pattern 3: Public Read, Owner Write**
```sql
CREATE POLICY "Public view published courses"
ON courses FOR SELECT
USING (published = true);

CREATE POLICY "Teachers manage own courses"
ON courses FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
```
- ✅ Clear separation of read vs write permissions
- Apply to discussions: cohort members read, author edits own

**Pattern 4: Service Role Bypass**
```sql
CREATE POLICY "Service role can manage all enrollments"
ON enrollments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```
- ✅ Admin operations bypass RLS
- Apply to discussions: admins can moderate all content

---

### 3.2 Cohort-Based Access Control Patterns

**Requirement:** Students in Cohort A should NOT see discussions from Cohort B (same course, different cohort).

**Recommended RLS Policy for Lesson Discussions:**

```sql
-- Students can view discussions in their cohorts only
CREATE POLICY "Students view cohort discussions"
ON lesson_discussions FOR SELECT
USING (
  cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
);

-- Students can create discussions in their cohorts
CREATE POLICY "Students create cohort discussions"
ON lesson_discussions FOR INSERT
WITH CHECK (
  cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
);

-- Users can update their own discussions
CREATE POLICY "Users update own discussions"
ON lesson_discussions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own discussions
CREATE POLICY "Users delete own discussions"
ON lesson_discussions FOR DELETE
USING (user_id = auth.uid());
```

**RLS Policy for Course Forums:**

```sql
-- Same pattern as lesson_discussions
CREATE POLICY "Students view cohort forums"
ON course_forums FOR SELECT
USING (
  cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
);

-- Similar INSERT, UPDATE, DELETE policies...
```

**RLS Policy for Forum Replies:**

```sql
-- Inherit access from parent forum post
CREATE POLICY "Users view replies to accessible forums"
ON forum_replies FOR SELECT
USING (
  forum_post_id IN (
    SELECT id FROM course_forums
    WHERE cohort_id IN (
      SELECT cohort_id
      FROM cohort_enrollments
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  )
);
```

**Performance Consideration:**
- These subqueries run on EVERY query
- Supabase/Postgres query planner should handle this efficiently
- Index requirements:
  - ✅ `idx_cohort_enrollments_user` (already planned)
  - ✅ `idx_cohort_enrollments_cohort` (already planned)

---

### 3.3 Teacher/Admin Permission Patterns

**Requirement:** Teachers should be able to moderate discussions in their courses (pin, lock, delete).

**Recommended Additional RLS Policies:**

```sql
-- Teachers can view all discussions in their courses
CREATE POLICY "Teachers view course discussions"
ON lesson_discussions FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = lesson_discussions.lesson_id
      AND c.created_by = auth.uid()
  )
);

-- Teachers can moderate discussions in their courses (pin/unpin)
CREATE POLICY "Teachers moderate course discussions"
ON lesson_discussions FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = lesson_discussions.lesson_id
      AND c.created_by = auth.uid()
  )
);

-- Teachers can delete any discussion in their courses
CREATE POLICY "Teachers delete course discussions"
ON lesson_discussions FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = lesson_discussions.lesson_id
      AND c.created_by = auth.uid()
  )
);
```

**Admin Override:**
```sql
-- Admins can manage all discussions (service role)
CREATE POLICY "Service role manages all discussions"
ON lesson_discussions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Moderation Flags:**
- `is_pinned`: Teachers can set this to highlight important discussions
- `is_locked` (for forums): Teachers can prevent further replies
- Application-level checks needed in API endpoints to verify teacher status

**Recommendation:** ✅ Implement teacher policies for full moderation control.

---

## 4. Performance Considerations

### 4.1 Existing Pagination Patterns

**Current State:** ⚠️ MINIMAL PAGINATION

**Analysis:**
- Searched codebase for: `limit`, `offset`, `page`, `pagination`
- Found only test setup files and integration tests
- No production API endpoints implement pagination
- Current pattern: fetch all records (acceptable for early stage, but not scalable)

**Example from Admin Dashboard:**
```javascript
// src/pages/admin.astro - fetches ALL applications
const { data: applications } = await supabaseAdmin
  .from('applications')
  .select('*')
  .order('created_at', { ascending: false });
```

**Risk for Discussions:**
- Lessons can have 100+ comments (especially if course is popular)
- Forums can have 1000+ posts over time
- Fetching all comments will cause performance issues

---

### 4.2 Recommended Pagination Strategy

**API Pagination Pattern (Cursor-Based):**

```typescript
// src/pages/api/discussions/[lessonId].ts
export const GET: APIRoute = async ({ params, url }) => {
  const lessonId = params.lessonId;
  const cursor = url.searchParams.get('cursor'); // timestamp of last item
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let query = supabase
    .from('lesson_discussions')
    .select('*')
    .eq('lesson_id', lessonId)
    .is('parent_id', null) // Top-level comments only
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  return new Response(JSON.stringify({
    discussions: data,
    nextCursor: data.length === limit ? data[data.length - 1].created_at : null
  }));
};
```

**Why Cursor-Based Over Offset-Based:**
- ✅ Consistent results (no duplicate/missing items when new posts added)
- ✅ Better performance (no need to skip N rows)
- ✅ Works well with real-time updates

**Frontend Implementation:**
```javascript
// Infinite scroll pattern
let cursor = null;
async function loadMoreDiscussions() {
  const url = `/api/discussions/${lessonId}?limit=20${cursor ? `&cursor=${cursor}` : ''}`;
  const res = await fetch(url);
  const { discussions, nextCursor } = await res.json();

  // Append to existing discussions
  allDiscussions.push(...discussions);
  cursor = nextCursor;
}
```

**Recommendation:** ✅ Implement cursor-based pagination for all discussion endpoints.

---

### 4.3 Indexing Strategy for Threaded Comments

**Requirement:** Support deeply nested replies (parent → child → grandchild...).

**Planned Schema:**
```sql
CREATE TABLE lesson_discussions (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id),
  cohort_id UUID REFERENCES cohorts(id),
  user_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES lesson_discussions(id), -- Self-referencing FK
  content TEXT NOT NULL,
  is_teacher_response BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Index Analysis:**

1. **Primary Access Pattern: Fetch all comments for a lesson**
   ```sql
   SELECT * FROM lesson_discussions
   WHERE lesson_id = ? AND cohort_id = ?
   ORDER BY created_at DESC;
   ```
   - **Index Needed:** `CREATE INDEX idx_discussions_lesson_cohort ON lesson_discussions(lesson_id, cohort_id, created_at DESC);`
   - ✅ Composite index covers query entirely

2. **Threaded Replies: Fetch children of parent comment**
   ```sql
   SELECT * FROM lesson_discussions
   WHERE parent_id = ?
   ORDER BY created_at ASC;
   ```
   - **Index Needed:** `CREATE INDEX idx_discussions_parent ON lesson_discussions(parent_id, created_at);`
   - ✅ Already in vision doc: `CREATE INDEX idx_lesson_discussions_parent ON lesson_discussions(parent_id);`
   - 🔧 Enhancement: add `created_at` to index for sort optimization

3. **User Activity: Fetch user's discussions**
   ```sql
   SELECT * FROM lesson_discussions
   WHERE user_id = ?
   ORDER BY created_at DESC;
   ```
   - **Index Needed:** `CREATE INDEX idx_discussions_user ON lesson_discussions(user_id, created_at DESC);`
   - ✅ Already in vision doc: `CREATE INDEX idx_lesson_discussions_user ON lesson_discussions(user_id);`
   - 🔧 Enhancement: add `created_at DESC` for sort optimization

4. **Pinned Comments: Fetch pinned discussions first**
   ```sql
   SELECT * FROM lesson_discussions
   WHERE lesson_id = ? AND cohort_id = ?
   ORDER BY is_pinned DESC, created_at DESC;
   ```
   - **Index Needed:** `CREATE INDEX idx_discussions_pinned ON lesson_discussions(lesson_id, cohort_id, is_pinned, created_at DESC);`
   - ⚠️ NOT in vision doc - need to add

**Recommended Index Set:**
```sql
-- Core access pattern (lesson + cohort)
CREATE INDEX idx_discussions_lesson_cohort ON lesson_discussions(lesson_id, cohort_id, created_at DESC);

-- Threaded replies
CREATE INDEX idx_discussions_parent ON lesson_discussions(parent_id, created_at ASC);

-- User activity
CREATE INDEX idx_discussions_user ON lesson_discussions(user_id, created_at DESC);

-- Pinned posts (for teachers)
CREATE INDEX idx_discussions_pinned ON lesson_discussions(lesson_id, cohort_id, is_pinned, created_at DESC);

-- Cohort-based access (for RLS)
CREATE INDEX idx_discussions_cohort ON lesson_discussions(cohort_id);
```

**Disk Space Estimate:**
- UUID: 16 bytes
- Timestamps: 8 bytes each
- Boolean: 1 byte
- Assume 10,000 discussions: ~2-3 MB per index
- Total index overhead: ~15 MB (negligible)

**Recommendation:** ✅ Add pinned index. Otherwise, vision doc's indexes are solid.

---

### 4.4 Query Optimization for Deeply Nested Replies

**Challenge:** Recursive queries for threaded comments can be expensive.

**Strategy 1: Limit Nesting Depth**
```sql
-- Application-level constraint
-- Disallow replies deeper than 3 levels:
-- Comment → Reply → Reply to Reply (STOP)
```
- ✅ Simplifies UI (avoids ultra-thin comment threads)
- ✅ Prevents infinite recursion
- Recommendation: Max depth = 3 or 4

**Strategy 2: Use Recursive CTE (Common Table Expression)**
```sql
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level comments
  SELECT id, parent_id, content, user_id, created_at, 0 as depth
  FROM lesson_discussions
  WHERE lesson_id = ? AND cohort_id = ? AND parent_id IS NULL

  UNION ALL

  -- Recursive case: replies to existing comments
  SELECT ld.id, ld.parent_id, ld.content, ld.user_id, ld.created_at, ct.depth + 1
  FROM lesson_discussions ld
  INNER JOIN comment_tree ct ON ld.parent_id = ct.id
  WHERE ct.depth < 3  -- Limit depth
)
SELECT * FROM comment_tree ORDER BY created_at;
```
- ✅ Single query for entire thread
- ✅ Postgres optimizes CTEs well
- ⚠️ Can be slow for very deep threads (mitigated by depth limit)

**Strategy 3: Denormalize Thread Path (Advanced)**
```sql
ALTER TABLE lesson_discussions ADD COLUMN thread_path TEXT[];
-- Store: ['parent_uuid', 'child_uuid', 'grandchild_uuid']
-- Query: WHERE thread_path[1] = 'root_comment_id'
```
- ✅ Extremely fast queries
- ⚠️ Complex to maintain (triggers needed)
- Recommendation: Defer to Phase 2 if performance issues arise

**Recommendation:**
- ✅ Start with Strategy 1 (depth limit) + Strategy 2 (recursive CTE)
- ⚠️ Monitor query performance with EXPLAIN ANALYZE
- Consider Strategy 3 only if >1000 comments per lesson

---

## 5. Moderation Features

### 5.1 Current Admin Capabilities

**Admin Dashboard Analysis:**
- File: `/src/pages/admin.astro`
- Current powers:
  - View all applications
  - Filter by status/program
  - Approve/reject applications
  - Assign roles (student, teacher, admin)
- Uses: Service role API calls (bypasses RLS)

**Admin Patterns:**
```javascript
// Admin uses service role key
const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

// Bypass RLS for full access
const { data } = await supabaseAdmin
  .from('applications')
  .select('*');
```

**Moderation Requirements for Discussions:**
- View all discussions (across all cohorts)
- Delete inappropriate content
- Pin/unpin discussions globally
- Lock/unlock forum threads
- Ban users (future: add `banned` flag to applications table)

**Recommendation:** ✅ Extend admin dashboard with "Moderation" tab for discussions.

---

### 5.2 Teacher Role Permissions

**Current Teacher Capabilities:**
- File: `/src/pages/teacher.astro`
- Current powers:
  - Create/edit/delete own courses
  - View enrolled students (planned in roadmap, not implemented yet)
  - Manage course content (modules/lessons)

**Teacher Permissions for Discussions:**
- View all discussions in their courses (all cohorts)
- Pin important discussions
- Delete inappropriate comments in their courses
- Lock forum threads to prevent further replies
- Mark their own posts with "Teacher" badge

**Implementation Strategy:**
```typescript
// API endpoint: src/pages/api/discussions/[id]/moderate.ts
export const PATCH: APIRoute = async ({ request, params, cookies }) => {
  // Check if user is teacher or admin
  const { data: app } = await supabase
    .from('applications')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!['teacher', 'admin'].includes(app?.role)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Verify teacher owns the course (if not admin)
  if (app.role === 'teacher') {
    const { data: discussion } = await supabase
      .from('lesson_discussions')
      .select('lesson_id')
      .eq('id', params.id)
      .single();

    // Check course ownership
    const { data: course } = await supabase
      .from('lessons')
      .select('modules(course_id, courses(created_by))')
      .eq('id', discussion.lesson_id)
      .single();

    if (course.modules.courses.created_by !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }
  }

  // Apply moderation action (pin, delete, etc.)
  const { action } = await request.json();
  // ... perform action
};
```

**Recommendation:** ✅ Implement teacher moderation via dedicated API endpoints.

---

### 5.3 Soft Delete vs Hard Delete Patterns

**Current Pattern Analysis:**

**Hard Delete (Current):**
```sql
ON DELETE CASCADE
```
- All current foreign keys use CASCADE
- When course deleted → modules/lessons deleted
- When user deleted → applications deleted
- ✅ Simplifies data integrity
- ⚠️ Permanent data loss

**Soft Delete Pattern:**
```sql
ALTER TABLE lesson_discussions ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_discussions_deleted ON lesson_discussions(deleted_at) WHERE deleted_at IS NULL;
```

**Pros of Soft Delete for Discussions:**
- ✅ Moderation audit trail (who deleted what, when)
- ✅ Can restore accidentally deleted content
- ✅ Preserve conversation context (show "[deleted]" placeholder)
- ✅ Comply with data retention policies

**Cons of Soft Delete:**
- ⚠️ Requires filtering `WHERE deleted_at IS NULL` in all queries
- ⚠️ Increased storage (deleted rows remain)
- ⚠️ More complex RLS policies

**Recommendation for Discussion System:**

**Hybrid Approach:**
1. **Soft delete for user-deleted content:**
   ```sql
   ALTER TABLE lesson_discussions ADD COLUMN deleted_at TIMESTAMP;
   ALTER TABLE lesson_discussions ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
   ```
   - Users deleting their own posts → soft delete
   - Shows "[Comment deleted by author]" in UI

2. **Hard delete for moderation:**
   ```sql
   -- When teacher/admin deletes (policy violations)
   DELETE FROM lesson_discussions WHERE id = ?;
   ```
   - Removes content completely
   - No trace left (for severe violations)

3. **Soft delete for archived cohorts:**
   ```sql
   -- When cohort archived, hide all discussions
   UPDATE lesson_discussions SET deleted_at = NOW() WHERE cohort_id = ?;
   ```
   - Preserves data for analytics
   - Hidden from students

**Implementation Example:**
```sql
-- RLS policy: hide soft-deleted content
CREATE POLICY "Users view active discussions"
ON lesson_discussions FOR SELECT
USING (
  deleted_at IS NULL
  AND cohort_id IN (
    SELECT cohort_id FROM cohort_enrollments WHERE user_id = auth.uid()
  )
);
```

**Recommendation:** ✅ Implement hybrid soft delete with moderation hard delete option.

---

## 6. Migration Safety Checklist

### 6.1 Pre-Migration Verification

**Dependencies Check:**
- [ ] Verify cohort tables exist before creating discussion tables
  - `cohorts` table
  - `cohort_enrollments` table
  - `cohort_schedules` table
- [ ] Verify all prerequisite indexes exist
  - Course indexes
  - Lesson indexes
  - Cohort enrollment indexes

**Schema Validation:**
- [ ] Test schema SQL in local Supabase instance
- [ ] Verify foreign key constraints work correctly
- [ ] Test CASCADE delete behavior with sample data
- [ ] Ensure unique constraints prevent duplicate posts

**RLS Policy Testing:**
- [ ] Create test users in different cohorts
- [ ] Verify cohort isolation (Cohort A can't see Cohort B discussions)
- [ ] Test teacher moderation permissions
- [ ] Test admin override permissions
- [ ] Verify service role bypass works

---

### 6.2 Migration Steps (Recommended Order)

**Step 1: Cohort System (Prerequisite)**
```bash
# Run cohort migration first
psql -f migrations/001_add_cohort_tables.sql
```

**Step 2: Discussion Tables**
```sql
-- lesson_discussions table
-- course_forums table
-- forum_replies table
```

**Step 3: Indexes**
```sql
-- All discussion indexes
-- Including recommended pinned index
```

**Step 4: RLS Policies**
```sql
-- Enable RLS
-- Student policies
-- Teacher policies
-- Admin policies
```

**Step 5: Materialized View Update**
```sql
-- Refresh student_roster_view to include discussion metrics
```

**Step 6: Verification Queries**
```sql
-- Test queries to verify data access
```

---

### 6.3 Rollback Strategy

**Immediate Rollback (Within Transaction):**
```sql
BEGIN;
  -- Run migration
  -- Test queries
  -- If any fail:
ROLLBACK;
```

**Post-Deployment Rollback:**
```sql
-- Drop tables (reverse order to avoid FK constraint errors)
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS course_forums CASCADE;
DROP TABLE IF EXISTS lesson_discussions CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_discussions_lesson_cohort;
-- ... etc
```

**Backup Strategy:**
```bash
# Before migration
pg_dump -t lesson_discussions > backup_discussions.sql
pg_dump -t course_forums > backup_forums.sql
```

**Recommendation:** ✅ Use Supabase Dashboard's "Migration History" for rollback.

---

### 6.4 Performance Monitoring Post-Migration

**Queries to Monitor:**
```sql
-- Slow query log
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%lesson_discussions%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename IN ('lesson_discussions', 'course_forums', 'forum_replies')
ORDER BY idx_scan ASC;

-- Table size monitoring
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('lesson_discussions', 'course_forums', 'forum_replies');
```

**Performance Targets:**
- Query latency: <200ms (90th percentile)
- Page load: <2s (with 50 comments)
- Index usage: >90% (all indexes should be used)

**Alerting:**
- Set up Supabase alerts for slow queries
- Monitor table growth (alert if >10GB)
- Track RLS policy performance (subquery overhead)

---

## 7. Recommended RLS Policies (Complete Set)

### 7.1 Lesson Discussions Policies

```sql
-- Enable RLS
ALTER TABLE lesson_discussions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Students view discussions in their cohorts
CREATE POLICY "Students view cohort discussions"
ON lesson_discussions FOR SELECT
USING (
  deleted_at IS NULL
  AND cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
);

-- Policy 2: Teachers view all discussions in their courses
CREATE POLICY "Teachers view course discussions"
ON lesson_discussions FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = lesson_discussions.lesson_id
      AND c.created_by = auth.uid()
  )
);

-- Policy 3: Students create discussions in their cohorts
CREATE POLICY "Students create cohort discussions"
ON lesson_discussions FOR INSERT
WITH CHECK (
  cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
  AND user_id = auth.uid()
);

-- Policy 4: Users update their own discussions
CREATE POLICY "Users update own discussions"
ON lesson_discussions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 5: Teachers moderate discussions in their courses
CREATE POLICY "Teachers moderate course discussions"
ON lesson_discussions FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = lesson_discussions.lesson_id
      AND c.created_by = auth.uid()
  )
);

-- Policy 6: Users soft delete their own discussions
CREATE POLICY "Users delete own discussions"
ON lesson_discussions FOR UPDATE
USING (user_id = auth.uid() AND deleted_at IS NULL)
WITH CHECK (deleted_at IS NOT NULL); -- Only allow setting deleted_at

-- Policy 7: Teachers hard delete discussions in their courses
CREATE POLICY "Teachers delete course discussions"
ON lesson_discussions FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = lesson_discussions.lesson_id
      AND c.created_by = auth.uid()
  )
);

-- Policy 8: Service role (admins) manage all discussions
CREATE POLICY "Service role manages all discussions"
ON lesson_discussions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

### 7.2 Course Forums Policies

```sql
-- Enable RLS
ALTER TABLE course_forums ENABLE ROW LEVEL SECURITY;

-- Similar policies as lesson_discussions, adapted for course-level forums
CREATE POLICY "Students view cohort forums"
ON course_forums FOR SELECT
USING (
  deleted_at IS NULL
  AND cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
);

CREATE POLICY "Teachers view course forums"
ON course_forums FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM courses c
    WHERE c.id = course_forums.course_id
      AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Students create forum posts"
ON course_forums FOR INSERT
WITH CHECK (
  cohort_id IN (
    SELECT cohort_id
    FROM cohort_enrollments
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
  AND user_id = auth.uid()
  AND is_locked = false -- Can't post to locked threads
);

CREATE POLICY "Users update own forum posts"
ON course_forums FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers moderate forums"
ON course_forums FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM courses c
    WHERE c.id = course_forums.course_id
      AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Teachers delete forum posts"
ON course_forums FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM courses c
    WHERE c.id = course_forums.course_id
      AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Service role manages all forums"
ON course_forums FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

### 7.3 Forum Replies Policies

```sql
-- Enable RLS
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Policy 1: View replies to accessible forum posts
CREATE POLICY "Users view replies to accessible forums"
ON forum_replies FOR SELECT
USING (
  deleted_at IS NULL
  AND forum_post_id IN (
    SELECT id FROM course_forums
    WHERE cohort_id IN (
      SELECT cohort_id
      FROM cohort_enrollments
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  )
);

-- Policy 2: Teachers view all replies in their courses
CREATE POLICY "Teachers view course replies"
ON forum_replies FOR SELECT
USING (
  deleted_at IS NULL
  AND forum_post_id IN (
    SELECT cf.id FROM course_forums cf
    JOIN courses c ON cf.course_id = c.id
    WHERE c.created_by = auth.uid()
  )
);

-- Policy 3: Create replies (inherit from parent forum post access)
CREATE POLICY "Users create forum replies"
ON forum_replies FOR INSERT
WITH CHECK (
  forum_post_id IN (
    SELECT id FROM course_forums
    WHERE cohort_id IN (
      SELECT cohort_id
      FROM cohort_enrollments
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
    AND is_locked = false -- Can't reply to locked threads
  )
  AND user_id = auth.uid()
);

-- Policy 4: Update own replies
CREATE POLICY "Users update own replies"
ON forum_replies FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 5: Teachers moderate replies
CREATE POLICY "Teachers moderate replies"
ON forum_replies FOR UPDATE
USING (
  forum_post_id IN (
    SELECT cf.id FROM course_forums cf
    JOIN courses c ON cf.course_id = c.id
    WHERE c.created_by = auth.uid()
  )
);

-- Policy 6: Delete own replies
CREATE POLICY "Users delete own replies"
ON forum_replies FOR DELETE
USING (user_id = auth.uid());

-- Policy 7: Teachers delete replies
CREATE POLICY "Teachers delete replies"
ON forum_replies FOR DELETE
USING (
  forum_post_id IN (
    SELECT cf.id FROM course_forums cf
    JOIN courses c ON cf.course_id = c.id
    WHERE c.created_by = auth.uid()
  )
);

-- Policy 8: Service role override
CREATE POLICY "Service role manages all replies"
ON forum_replies FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## 8. Performance Optimization Strategy

### 8.1 Index Strategy (Enhanced from Vision Doc)

```sql
-- Lesson Discussions Indexes
CREATE INDEX idx_discussions_lesson_cohort ON lesson_discussions(lesson_id, cohort_id, created_at DESC);
CREATE INDEX idx_discussions_parent ON lesson_discussions(parent_id, created_at ASC);
CREATE INDEX idx_discussions_user ON lesson_discussions(user_id, created_at DESC);
CREATE INDEX idx_discussions_cohort ON lesson_discussions(cohort_id);
CREATE INDEX idx_discussions_pinned ON lesson_discussions(lesson_id, cohort_id, is_pinned, created_at DESC);
CREATE INDEX idx_discussions_deleted ON lesson_discussions(deleted_at) WHERE deleted_at IS NULL; -- Partial index

-- Course Forums Indexes
CREATE INDEX idx_forums_course_cohort ON course_forums(course_id, cohort_id, created_at DESC);
CREATE INDEX idx_forums_user ON course_forums(user_id, created_at DESC);
CREATE INDEX idx_forums_pinned ON course_forums(course_id, cohort_id, is_pinned, created_at DESC);
CREATE INDEX idx_forums_deleted ON course_forums(deleted_at) WHERE deleted_at IS NULL;

-- Forum Replies Indexes
CREATE INDEX idx_replies_post ON forum_replies(forum_post_id, created_at ASC);
CREATE INDEX idx_replies_user ON forum_replies(user_id, created_at DESC);
CREATE INDEX idx_replies_deleted ON forum_replies(deleted_at) WHERE deleted_at IS NULL;
```

**Index Maintenance:**
```sql
-- Vacuum regularly to prevent index bloat
VACUUM ANALYZE lesson_discussions;
VACUUM ANALYZE course_forums;
VACUUM ANALYZE forum_replies;
```

---

### 8.2 Materialized View Refresh Strategy

**Current Roster View:**
```sql
CREATE MATERIALIZED VIEW student_roster_view AS
SELECT
  ce.cohort_id,
  c.course_id,
  ce.user_id,
  -- ... other fields ...
  COUNT(DISTINCT ld.id) as discussion_posts,
  COUNT(DISTINCT cf.id) as forum_posts
FROM cohort_enrollments ce
LEFT JOIN lesson_discussions ld ON ld.user_id = ce.user_id AND ld.cohort_id = ce.cohort_id
LEFT JOIN course_forums cf ON cf.user_id = ce.user_id AND cf.cohort_id = ce.cohort_id
GROUP BY ...;
```

**Refresh Strategy:**
1. **Manual refresh (initial):**
   ```sql
   REFRESH MATERIALIZED VIEW student_roster_view;
   ```

2. **Scheduled refresh (pg_cron):**
   ```sql
   SELECT cron.schedule('refresh-roster', '*/15 * * * *', $$
     REFRESH MATERIALIZED VIEW CONCURRENTLY student_roster_view;
   $$);
   ```
   - Every 15 minutes
   - `CONCURRENTLY` allows queries during refresh

3. **Trigger-based refresh (real-time):**
   ```sql
   CREATE OR REPLACE FUNCTION refresh_roster_on_discussion()
   RETURNS TRIGGER AS $$
   BEGIN
     REFRESH MATERIALIZED VIEW CONCURRENTLY student_roster_view;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_refresh_roster
   AFTER INSERT OR UPDATE OR DELETE ON lesson_discussions
   FOR EACH STATEMENT
   EXECUTE FUNCTION refresh_roster_on_discussion();
   ```
   - ⚠️ Can be expensive if many discussions posted
   - Recommendation: use scheduled refresh instead

**Recommendation:** ✅ Start with 15-minute scheduled refresh. Monitor performance.

---

### 8.3 Caching Strategy

**Application-Level Caching:**
```typescript
// Cache discussion counts (Redis or in-memory)
const cache = new Map();

async function getDiscussionCount(lessonId: string, cohortId: string) {
  const cacheKey = `discussions:${lessonId}:${cohortId}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const { count } = await supabase
    .from('lesson_discussions')
    .select('*', { count: 'exact', head: true })
    .eq('lesson_id', lessonId)
    .eq('cohort_id', cohortId);

  cache.set(cacheKey, count);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min TTL

  return count;
}
```

**CDN Caching (for public discussions):**
- If forums become public-facing, use Vercel edge caching
- Cache header: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

**Recommendation:** ✅ Implement application-level caching for counts and metadata.

---

## 9. Integration Requirements Summary

### 9.1 Database Dependencies

**Required Before Discussion Schema:**
- ✅ Cohorts table
- ✅ Cohort enrollments table
- ✅ Lessons table (already exists)
- ✅ Courses table (already exists)
- ✅ Applications table (already exists)

**Foreign Key Integrity:**
- ✅ All foreign keys use appropriate ON DELETE CASCADE
- ✅ Self-referencing FK (parent_id) handled correctly
- ✅ No circular dependencies

---

### 9.2 API Endpoints to Implement

**Lesson Discussions:**
- `POST /api/discussions/create` - Create discussion/reply
- `GET /api/discussions/[lessonId]` - Get discussions for lesson (with pagination)
- `PATCH /api/discussions/[id]` - Edit own discussion
- `DELETE /api/discussions/[id]` - Delete own discussion (soft delete)
- `POST /api/discussions/[id]/pin` - Pin discussion (teacher only)
- `DELETE /api/discussions/[id]/moderate` - Hard delete (teacher/admin only)

**Course Forums:**
- `POST /api/forums/create` - Create forum post
- `GET /api/forums/[courseId]` - Get forum posts for course
- `POST /api/forums/[id]/reply` - Reply to forum post
- `PATCH /api/forums/[id]/lock` - Lock thread (teacher only)
- `DELETE /api/forums/[id]` - Delete forum post

---

### 9.3 UI Components to Build

**Components:**
- `LessonDiscussion.astro` - Discussion component for lesson pages
- `ForumPost.astro` - Forum post card component
- `CommentThread.astro` - Threaded comment display
- `CommentForm.astro` - Comment input form
- `TeacherBadge.astro` - Visual indicator for teacher posts

**Pages:**
- Update `src/pages/courses/[courseSlug]/[lessonSlug].astro` - Add discussion section
- Create `src/pages/courses/[courseSlug]/forum.astro` - Course forum page
- Update `src/pages/teacher/courses.astro` - Add "Discussions" tab

---

### 9.4 User Profile Integration

**Required Joins:**
```sql
-- Display author info in discussions
SELECT
  ld.*,
  a.name as author_name,
  a.role as author_role
FROM lesson_discussions ld
JOIN applications a ON ld.user_id = a.user_id
WHERE ld.lesson_id = ? AND ld.cohort_id = ?
ORDER BY ld.created_at DESC;
```

**Future Enhancement:**
- Add user avatars (store in `applications` or separate `profiles` table)
- Add user reputation/badges (contributor, top poster, etc.)
- Link to user profile page (deferred to Phase 2)

---

## 10. Migration Safety Checklist

### 10.1 Pre-Migration Checks

- [ ] Cohort tables deployed and verified
- [ ] Test users created in multiple cohorts
- [ ] Schema SQL validated in staging environment
- [ ] Indexes tested with EXPLAIN ANALYZE
- [ ] RLS policies tested with test users
- [ ] Backup of production database created

### 10.2 Migration Execution

- [ ] Run migration during low-traffic window
- [ ] Monitor error logs during migration
- [ ] Verify all tables created successfully
- [ ] Verify all indexes created
- [ ] Verify RLS policies applied
- [ ] Run smoke tests (create/read/update/delete)

### 10.3 Post-Migration Validation

- [ ] Test discussion creation as student
- [ ] Test discussion viewing (cohort isolation)
- [ ] Test teacher moderation features
- [ ] Test admin override
- [ ] Monitor query performance
- [ ] Check index usage statistics
- [ ] Verify materialized view includes discussion metrics

### 10.4 Rollback Criteria

**Trigger rollback if:**
- Migration fails midway
- RLS policies not working correctly
- Critical performance degradation (>5s query times)
- Data integrity issues detected

**Rollback Procedure:**
1. Stop application traffic
2. Run rollback SQL script
3. Restore from backup if necessary
4. Investigate failure in staging
5. Fix issues and retry

---

## 11. Recommendations Summary

### 11.1 High Priority (Must-Have)

1. ✅ **Implement cohort schema first** (roadmap dependency)
2. ✅ **Add RLS policies exactly as specified** in Section 7
3. ✅ **Add pinned discussion index** (performance)
4. ✅ **Implement pagination** (cursor-based, not offset)
5. ✅ **Add soft delete columns** (deleted_at, deleted_by)
6. ✅ **Limit thread nesting depth** to 3-4 levels

### 11.2 Medium Priority (Should-Have)

1. ⚠️ **Enhance indexes** with `created_at` for sort optimization
2. ⚠️ **Implement application-level caching** for counts
3. ⚠️ **Create moderation API endpoints** for teachers
4. ⚠️ **Build admin moderation dashboard**
5. ⚠️ **Set up materialized view refresh** (15-min schedule)

### 11.3 Low Priority (Nice-to-Have)

1. 🔵 **Real-time updates** (Supabase Realtime subscriptions)
2. 🔵 **Notification system** (email on teacher reply)
3. 🔵 **Rich text editor** (markdown support)
4. 🔵 **Mention system** (@username notifications)
5. 🔵 **Reaction emojis** (upvote/helpful buttons)

---

## 12. Conclusion

The C4C Campus platform has a solid foundation for adding the discussion system. The planned schema in the vision document is well-designed and aligns with best practices. Key strengths include:

- ✅ Strong RLS patterns established
- ✅ Cohort-based access control properly scoped
- ✅ Teacher/admin permissions clearly defined
- ✅ Materialized view for roster includes discussion metrics

**Critical Path:**
1. Implement cohort schema (Task 1.1)
2. Implement discussion schema (Task 1.2.2) ← THIS TASK
3. Build discussion UI components (Week 6)
4. Integrate with lesson pages and forums

**Risk Areas:**
- ⚠️ Performance at scale (1000+ comments per lesson)
  - Mitigation: Pagination, caching, indexes
- ⚠️ Moderation complexity (teachers managing multiple cohorts)
  - Mitigation: Clear UI, dedicated moderation endpoints
- ⚠️ RLS policy performance (subquery overhead)
  - Mitigation: Proper indexes, monitor query plans

**Next Steps:**
1. Review this document with development team
2. Finalize RLS policy implementation details
3. Create migration SQL script with rollback
4. Implement in staging environment first
5. Load test with 10,000 sample discussions
6. Deploy to production during low-traffic window

---

**Document Status:** COMPLETE ✅
**Ready for Implementation:** YES ✅
**Blocking Issues:** NONE

**Approved for Task 1.2.2 Implementation**

# Discussion System - Entity Relationship Diagram (ERD)

**Date:** October 29, 2025
**Version:** 1.0.0
**Status:** Production Ready

---

## Overview

This document provides the Entity Relationship Diagram for the C4C Campus discussion system, showing the relationships between lesson discussions, course forums, forum replies, and their integration with the cohort and course systems.

---

## ERD Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DISCUSSION SYSTEM                               │
│                         (Cohort-Scoped Communication)                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────┐
│   auth.users     │                    │    cohorts       │
│                  │                    │                  │
│ • id (UUID) PK   │◄───────────┬──────►│ • id (BIGSERIAL) │
└──────────────────┘            │       │ • course_id      │
                                │       │ • name           │
                                │       │ • start_date     │
                                │       │ • end_date       │
                                │       │ • status         │
                                │       └──────────────────┘
                                │              ▲
                                │              │
┌──────────────────┐            │              │
│    courses       │            │       ┌──────┴──────────┐
│                  │            │       │ course_forums    │
│ • id (BIGSERIAL) │◄───────────┼───────┤                  │
│ • name           │            │       │ • id (PK)        │
│ • slug           │            │       │ • course_id (FK) │
│ • description    │            │       │ • cohort_id (FK) │
│ • created_by     │            │       │ • user_id (FK)   │
└──────────────────┘            │       │ • title          │
       ▲                        │       │ • content        │
       │                        │       │ • is_pinned      │
       │                        │       │ • is_locked      │
┌──────┴──────────┐             │       │ • created_at     │
│    modules      │             │       │ • updated_at     │
│                 │             │       └──────────────────┘
│ • id (BIGSERIAL)│             │              │
│ • course_id     │             │              │
│ • name          │             │              │ 1:N
│ • order_index   │             │              ▼
└─────────────────┘             │       ┌──────────────────┐
       ▲                        │       │  forum_replies   │
       │                        │       │                  │
┌──────┴──────────┐             │       │ • id (PK)        │
│    lessons      │             │       │ • forum_post_id  │
│                 │             │       │ • user_id (FK)   │
│ • id (BIGSERIAL)│◄────────────┼───────┤ • content        │
│ • module_id     │             │       │ • is_teacher_... │
│ • name          │             │       │ • created_at     │
│ • slug          │             │       │ • updated_at     │
│ • video_path    │             │       └──────────────────┘
│ • order_index   │             │
└─────────────────┘             │
       ▲                        │
       │                        │
       │                        │
┌──────┴────────────┐           │
│ lesson_discussions│◄──────────┘
│                   │
│ • id (PK)         │
│ • lesson_id (FK)  │
│ • cohort_id (FK)  │
│ • user_id (FK)    │
│ • parent_id (FK)  │──┐ Self-referencing
│ • content         │  │ (Threaded Replies)
│ • is_teacher_...  │  │
│ • is_pinned       │  │
│ • created_at      │  │
│ • updated_at      │  │
└───────────────────┘  │
       ▲               │
       └───────────────┘
```

---

## Detailed Table Relationships

### 1. Lesson Discussions (Threaded Comments)

**Table:** `lesson_discussions`

**Relationships:**
- **Many-to-One** with `lessons` (lesson_id → lessons.id)
  - Each discussion belongs to one lesson
  - One lesson can have many discussions
  - CASCADE delete: deleting a lesson removes all discussions

- **Many-to-One** with `cohorts` (cohort_id → cohorts.id)
  - Each discussion is scoped to one cohort
  - One cohort can have many discussions
  - CASCADE delete: deleting a cohort removes all discussions

- **Many-to-One** with `auth.users` (user_id → auth.users.id)
  - Each discussion is authored by one user
  - One user can create many discussions
  - CASCADE delete: deleting a user removes all their discussions

- **Self-Referential** (parent_id → lesson_discussions.id)
  - Enables threaded replies
  - Each discussion can have a parent discussion
  - CASCADE delete: deleting a parent removes all child replies
  - NULL parent_id indicates top-level discussion

**Access Pattern:**
```sql
-- Get all top-level discussions for a lesson in a cohort
SELECT * FROM lesson_discussions
WHERE lesson_id = ? AND cohort_id = ? AND parent_id IS NULL
ORDER BY is_pinned DESC, created_at DESC;

-- Get all replies to a specific discussion
SELECT * FROM lesson_discussions
WHERE parent_id = ?
ORDER BY created_at ASC;
```

---

### 2. Course Forums (General Discussions)

**Table:** `course_forums`

**Relationships:**
- **Many-to-One** with `courses` (course_id → courses.id)
  - Each forum post belongs to one course
  - One course can have many forum posts
  - CASCADE delete: deleting a course removes all forums

- **Many-to-One** with `cohorts` (cohort_id → cohorts.id)
  - Each forum post is scoped to one cohort
  - One cohort can have many forum posts
  - CASCADE delete: deleting a cohort removes all forums

- **Many-to-One** with `auth.users` (user_id → auth.users.id)
  - Each forum post is authored by one user
  - One user can create many forum posts
  - CASCADE delete: deleting a user removes all their posts

- **One-to-Many** with `forum_replies`
  - Each forum post can have many replies
  - See forum_replies section below

**Access Pattern:**
```sql
-- Get all forum posts for a course cohort
SELECT * FROM course_forums
WHERE course_id = ? AND cohort_id = ?
ORDER BY is_pinned DESC, created_at DESC;
```

**Moderation Features:**
- `is_pinned` - Teachers can pin important posts to top
- `is_locked` - Teachers can lock threads to prevent new replies

---

### 3. Forum Replies (Flat Reply Structure)

**Table:** `forum_replies`

**Relationships:**
- **Many-to-One** with `course_forums` (forum_post_id → course_forums.id)
  - Each reply belongs to one forum post
  - One forum post can have many replies
  - CASCADE delete: deleting a forum post removes all replies

- **Many-to-One** with `auth.users` (user_id → auth.users.id)
  - Each reply is authored by one user
  - One user can create many replies
  - CASCADE delete: deleting a user removes all their replies

**Access Pattern:**
```sql
-- Get all replies to a forum post
SELECT * FROM forum_replies
WHERE forum_post_id = ?
ORDER BY created_at ASC;
```

**Note:** Forum replies use a flat structure (no nesting), while lesson discussions support full threading via `parent_id`.

---

## Integration with Existing Schema

### Cohort System Integration

The discussion system is fully integrated with the cohort system to provide:

1. **Cohort-Scoped Visibility**
   - Students only see discussions in cohorts they're enrolled in
   - Prevents cross-cohort information leakage
   - Enforced via RLS policies

2. **Cohort Enrollment Check**
   ```sql
   -- RLS policy pattern
   WHERE cohort_id IN (
     SELECT cohort_id FROM cohort_enrollments
     WHERE user_id = auth.uid() AND status = 'active'
   )
   ```

3. **Activity Tracking**
   - Discussion posts update `cohort_enrollments.last_activity_at`
   - Materialized view `student_roster_view` includes discussion counts

### Course/Lesson Hierarchy

```
courses
  └─ modules
       └─ lessons
            └─ lesson_discussions (cohort-scoped)

courses
  └─ course_forums (cohort-scoped)
       └─ forum_replies
```

---

## Cascade Delete Behavior

Understanding the cascade delete chain is critical:

### Scenario 1: Course Deletion
```
DELETE courses WHERE id = 1

Cascades to:
├─ modules (all modules in course)
│  └─ lessons (all lessons in modules)
│     └─ lesson_discussions (all discussions on lessons)
│        └─ lesson_discussions (all child replies via parent_id)
│
└─ course_forums (all forum posts in course)
   └─ forum_replies (all replies to forum posts)
```

### Scenario 2: Cohort Deletion
```
DELETE cohorts WHERE id = 1

Cascades to:
├─ lesson_discussions (all discussions in cohort)
│  └─ lesson_discussions (all child replies)
│
├─ course_forums (all forum posts in cohort)
│  └─ forum_replies (all replies)
│
└─ cohort_enrollments (all student enrollments)
```

### Scenario 3: User Deletion
```
DELETE auth.users WHERE id = 'uuid'

Cascades to:
├─ lesson_discussions (all discussions by user)
├─ course_forums (all forum posts by user)
└─ forum_replies (all replies by user)
```

### Scenario 4: Discussion Deletion (Threaded)
```
DELETE lesson_discussions WHERE id = 123 AND parent_id IS NULL

Cascades to:
└─ lesson_discussions (all child replies via parent_id)
   └─ lesson_discussions (all grandchild replies, recursively)
```

---

## Indexes and Performance

### Lesson Discussions Indexes (4)

```sql
idx_lesson_discussions_lesson (lesson_id)
  -- Use case: Fetch all discussions for a lesson

idx_lesson_discussions_cohort (cohort_id)
  -- Use case: RLS policy enforcement, cohort filtering

idx_lesson_discussions_user (user_id)
  -- Use case: Fetch user's discussion history

idx_lesson_discussions_parent (parent_id)
  -- Use case: Fetch threaded replies
```

### Course Forums Indexes (3)

```sql
idx_course_forums_course (course_id)
  -- Use case: Fetch all forums for a course

idx_course_forums_cohort (cohort_id)
  -- Use case: RLS policy enforcement, cohort filtering

idx_course_forums_user (user_id)
  -- Use case: Fetch user's forum posts
```

### Forum Replies Indexes (2)

```sql
idx_forum_replies_post (forum_post_id)
  -- Use case: Fetch all replies to a forum post

idx_forum_replies_user (user_id)
  -- Use case: Fetch user's reply history
```

**Performance Targets:**
- Query latency: <200ms (90th percentile)
- Supports 1000+ discussions per lesson without degradation
- Cohort isolation queries remain fast with proper indexing

---

## Security Model (RLS Policies)

### Student Access Rules

**SELECT (Read) Policies:**
- Students can view discussions/forums in cohorts they're enrolled in
- Enforced via `cohort_enrollments` check
- Prevents cross-cohort viewing

**INSERT (Create) Policies:**
- Students can post in cohorts they're enrolled in
- `user_id` must match `auth.uid()`
- Cannot post to locked forums

**UPDATE/DELETE Policies:**
- Students can edit/delete their own posts only
- Cannot modify posts created by others

### Teacher Moderation Powers

Teachers have elevated permissions in courses they created:

**Full Access (ALL operations):**
- View all discussions/forums in their courses (across all cohorts)
- Pin important discussions to highlight them
- Lock forum threads to prevent further replies
- Edit any discussion/forum/reply content
- Delete inappropriate content

**Implementation:**
```sql
-- Teacher policy pattern
WHERE EXISTS (
  SELECT 1 FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE l.id = lesson_discussions.lesson_id
    AND c.created_by = auth.uid()
)
```

### Admin Override

Service role (admins) can perform all operations on all discussions, bypassing RLS entirely.

---

## Data Integrity Constraints

### Required Fields

**lesson_discussions:**
- `lesson_id` (NOT NULL) - Must reference valid lesson
- `cohort_id` (NOT NULL) - Must reference valid cohort
- `user_id` (NOT NULL) - Must reference valid user
- `content` (NOT NULL) - Discussion must have content
- `parent_id` (NULLABLE) - NULL for top-level, ID for replies

**course_forums:**
- `course_id` (NOT NULL) - Must reference valid course
- `cohort_id` (NOT NULL) - Must reference valid cohort
- `user_id` (NOT NULL) - Must reference valid user
- `title` (NOT NULL) - Forum post must have title
- `content` (NOT NULL) - Forum post must have content

**forum_replies:**
- `forum_post_id` (NOT NULL) - Must reference valid forum post
- `user_id` (NOT NULL) - Must reference valid user
- `content` (NOT NULL) - Reply must have content

### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity:
- Deleting parent entities automatically removes child discussions
- No orphaned discussions remain in database
- Prevents broken references

### Boolean Defaults

- `is_teacher_response` defaults to `FALSE`
- `is_pinned` defaults to `FALSE`
- `is_locked` defaults to `FALSE`

### Timestamps

- `created_at` defaults to `NOW()` on insert
- `updated_at` defaults to `NOW()` and auto-updates via trigger

---

## Threaded Discussion Architecture

### Structure

Lesson discussions support unlimited nesting via self-referential foreign key:

```
Top-level discussion (parent_id = NULL)
├─ Reply 1 (parent_id = top-level ID)
│  ├─ Reply 1.1 (parent_id = Reply 1 ID)
│  └─ Reply 1.2 (parent_id = Reply 1 ID)
│     └─ Reply 1.2.1 (parent_id = Reply 1.2 ID)
└─ Reply 2 (parent_id = top-level ID)
```

### Query Strategy

**Recursive CTE for Full Thread:**
```sql
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level discussions
  SELECT id, parent_id, content, user_id, created_at, 0 as depth
  FROM lesson_discussions
  WHERE lesson_id = ? AND cohort_id = ? AND parent_id IS NULL

  UNION ALL

  -- Recursive case: replies
  SELECT ld.id, ld.parent_id, ld.content, ld.user_id, ld.created_at, ct.depth + 1
  FROM lesson_discussions ld
  INNER JOIN comment_tree ct ON ld.parent_id = ct.id
  WHERE ct.depth < 10  -- Depth limit for performance
)
SELECT * FROM comment_tree ORDER BY created_at;
```

**Recommendation:** Consider limiting nesting depth to 3-4 levels for better UX and performance.

---

## Materialized View Integration

### Student Roster View

The discussion system integrates with the `student_roster_view` materialized view to provide activity metrics:

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
  ce.completed_lessons,
  COUNT(DISTINCT ld.id) as discussion_posts,    -- ← Discussion count
  COUNT(DISTINCT cf.id) as forum_posts          -- ← Forum count
FROM cohort_enrollments ce
JOIN applications a ON a.user_id = ce.user_id
JOIN cohorts c ON c.id = ce.cohort_id
LEFT JOIN lesson_discussions ld ON ld.user_id = ce.user_id AND ld.cohort_id = ce.cohort_id
LEFT JOIN course_forums cf ON cf.user_id = ce.user_id AND cf.cohort_id = ce.cohort_id
GROUP BY ce.cohort_id, c.course_id, ce.user_id, a.name, a.email, ce.enrolled_at, ce.status, ce.last_activity_at, ce.completed_lessons;
```

**Refresh Strategy:**
- Manual: `REFRESH MATERIALIZED VIEW student_roster_view;`
- Scheduled: Every 15 minutes via pg_cron
- Concurrent refresh to allow queries during update

---

## Usage Examples

### Example 1: Create Top-Level Discussion

```sql
INSERT INTO lesson_discussions (lesson_id, cohort_id, user_id, content, is_teacher_response)
VALUES (42, 10, 'user-uuid', 'How do I configure the webhook node?', FALSE);
```

### Example 2: Reply to Discussion (Threaded)

```sql
INSERT INTO lesson_discussions (lesson_id, cohort_id, user_id, parent_id, content, is_teacher_response)
VALUES (42, 10, 'teacher-uuid', 123, 'Click the plus icon and select "Webhook" from the list.', TRUE);
```

### Example 3: Create Forum Post

```sql
INSERT INTO course_forums (course_id, cohort_id, user_id, title, content)
VALUES (5, 10, 'user-uuid', 'Project Ideas', 'What are some good beginner projects?');
```

### Example 4: Pin Discussion (Teacher)

```sql
UPDATE lesson_discussions
SET is_pinned = TRUE
WHERE id = 123;
-- Requires teacher RLS policy to succeed
```

### Example 5: Lock Forum Thread (Teacher)

```sql
UPDATE course_forums
SET is_locked = TRUE
WHERE id = 456;
-- Prevents students from posting new replies
```

---

## Migration Checklist

When deploying this schema:

- [ ] Verify `cohorts` table exists (prerequisite)
- [ ] Verify `courses` and `lessons` tables exist
- [ ] Run schema.sql to create discussion tables
- [ ] Verify all 3 tables created successfully
- [ ] Verify all 9 indexes created
- [ ] Verify RLS enabled on all tables
- [ ] Verify all 13 RLS policies created
- [ ] Verify all 3 triggers created
- [ ] Test as student: create discussion, view only own cohort
- [ ] Test as teacher: pin discussion, lock forum
- [ ] Test cascade deletes with sample data
- [ ] Refresh materialized view to include discussion counts
- [ ] Monitor query performance with EXPLAIN ANALYZE

---

## Conclusion

The discussion system ERD demonstrates a well-architected schema with:

- **Cohort-scoped security** preventing information leakage
- **Teacher moderation powers** for content management
- **Threaded discussions** for rich conversations
- **Flat forum replies** for simpler Q&A
- **Cascade deletes** maintaining referential integrity
- **Comprehensive indexes** for query performance
- **RLS policies** enforcing authorization at database level
- **Integration** with existing cohort and course systems

This architecture supports scalable, secure, and feature-rich discussions for the C4C Campus platform.

---

**Document Status:** Complete
**Last Updated:** October 29, 2025
**Maintained By:** C4C Platform Team

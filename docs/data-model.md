# C4C Campus Data Model

This document describes the domain entities, their relationships, and key business rules. It provides the conceptual model needed to understand how data flows through the system.

## Entity Overview

The database contains **34 tables** organized into logical categories:

| Category | Tables | Purpose |
|----------|--------|---------|
| Users | 3 | User accounts and applications |
| Course Structure | 3 | Content hierarchy |
| Cohorts | 5 | Time-gated learning groups |
| Assessments | 6 | Quizzes and assignments |
| Discussions | 3 | Community features |
| Messaging | 4 | Direct messages and notifications |
| AI Assistant | 3 | Future chat integration |
| Certificates | 2 | Completion credentials |
| Payments | 2 | Subscriptions and billing |
| Media/Analytics | 2 | Assets and tracking |

## Core Entities

### User Management

```
auth.users (Supabase-managed)
    │
    ├── applications
    │   - Primary user record for C4C
    │   - Contains: role, program, status
    │   - Links to auth.users via user_id
    │
    └── profiles
        - Extended user info (bio, avatar, timezone)
        - Optional enrichment data
```

**Applications** is the primary user entity. When someone applies to C4C:
1. Supabase creates an `auth.users` record (email/password)
2. The app creates an `applications` record (program, status, role)
3. Admin reviews and approves → user can now log in with their role

### Content Hierarchy

```
courses (BIGSERIAL id)
    │
    ├── modules (BIGSERIAL id)
    │   │
    │   └── lessons (BIGSERIAL id)
    │       │
    │       ├── quizzes (UUID id)
    │       ├── assignments (UUID id)
    │       └── lesson_discussions (UUID id)
    │
    └── cohorts (UUID id)
        │
        ├── cohort_enrollments (UUID id)
        ├── cohort_schedules (UUID id)
        └── course_forums (UUID id)
```

**Key insight**: Courses, modules, and lessons use **BIGSERIAL (number)** IDs. Cohorts and user-generated content use **UUID (string)** IDs. Never confuse these types.

### Cohort System

Cohorts are the heart of C4C's learning model:

| Entity | Purpose |
|--------|---------|
| `cohorts` | Learning group with start/end dates |
| `cohort_enrollments` | Which students are in which cohort |
| `cohort_schedules` | When each module unlocks for the cohort |
| `enrollments` | Legacy course-level enrollment (coexists) |
| `lesson_progress` | Individual lesson completion tracking |

**Time-Gating**: Content unlocks based on `cohort_schedules.unlock_date`. A student in Cohort A might have access to Module 2, while Cohort B (which started later) only has Module 1 unlocked.

### Assessments

```
quizzes
    ├── quiz_questions
    └── quiz_attempts

assignments
    ├── assignment_rubrics
    └── assignment_submissions
```

Both quizzes and assignments can be attached at course, module, or lesson level (flexible placement).

## Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          auth.users                                  │
│                       (Supabase managed)                            │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ applications│      │  profiles   │      │  auth_logs  │
│   (role)    │      │   (bio)     │      │  (events)   │
└─────────────┘      └─────────────┘      └─────────────┘
         │
         │ created_by
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           courses                                    │
│              (title, track, difficulty, is_published)               │
└─────────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐        ┌─────────────────────┐
│       modules       │        │       cohorts       │
│  (order, title)     │        │  (dates, capacity)  │
└─────────────────────┘        └─────────────────────┘
         │                              │
         ▼                              ├──────────────────┐
┌─────────────────────┐                 ▼                  ▼
│       lessons       │        ┌───────────────┐   ┌───────────────┐
│ (video, content)    │        │cohort_schedules│  │cohort_enrollments│
└─────────────────────┘        │(unlock_date)   │  │(student, status)│
         │                     └───────────────┘   └───────────────┘
         │
    ┌────┴────┬──────────────┐
    ▼         ▼              ▼
┌───────┐ ┌──────────┐ ┌────────────────┐
│quizzes│ │assignments│ │lesson_discussions│
└───────┘ └──────────┘ └────────────────┘
    │         │
    ▼         ▼
┌───────────┐ ┌───────────────────┐
│quiz_attempts│ │assignment_submissions│
└───────────┘ └───────────────────┘
```

## ID Type Reference

**CRITICAL**: Using the wrong ID type causes runtime errors.

| Entity | ID Type | Example |
|--------|---------|---------|
| `courses` | BIGSERIAL (number) | `1`, `42` |
| `modules` | BIGSERIAL (number) | `1`, `15` |
| `lessons` | BIGSERIAL (number) | `1`, `200` |
| `enrollments` | BIGSERIAL (number) | `1`, `500` |
| `lesson_progress` | BIGSERIAL (number) | `1`, `10000` |
| `cohorts` | UUID (string) | `"550e8400-e29b-..."` |
| `cohort_enrollments` | UUID (string) | `"..."` |
| `quiz_attempts` | UUID (string) | `"..."` |
| `assignment_submissions` | UUID (string) | `"..."` |
| `applications` | UUID (string) | `"..."` |

## User Roles

Three roles with hierarchical permissions:

### Admin
- Full access to everything
- Can approve/reject applications
- Can manage all users, courses, cohorts

### Teacher
- Can create/edit **own** courses (`courses.created_by = user_id`)
- Can manage cohorts for own courses
- Can grade student submissions
- Cannot access other teachers' content

### Student
- Can view published courses
- Can access enrolled courses/cohorts
- Can submit assignments and take quizzes
- Can participate in cohort discussions

Role is stored in `applications.role` and checked by middleware + RLS policies.

## Time-Gating Logic

Content access is controlled by cohort schedules:

```
Can student access lesson?
    │
    ├── Is user admin/teacher? → YES (bypass)
    │
    ├── Is course self-paced (no cohort)? → YES
    │
    └── Is student enrolled in a cohort?
        │
        └── Check cohort_schedules for lesson's module
            │
            ├── unlock_date <= today? → YES
            │
            └── Otherwise → NO (module locked)
```

## Foreign Key Behaviors

Understanding cascade behavior prevents surprise data loss:

### CASCADE (child deleted with parent)
- `cohort_enrollments.cohort_id` → Deleting cohort removes all enrollments
- `cohort_schedules.cohort_id` → Deleting cohort removes all schedules
- `lesson_discussions.cohort_id` → Cohort discussions deleted with cohort

### SET NULL (preserves history)
- `lesson_progress.cohort_id` → Progress preserved when cohort deleted
- `enrollments.cohort_id` → Enrollment preserved
- `quiz_attempts.cohort_id` → Attempt history preserved

This design preserves student achievement data even when cohorts are archived.

## Progress Tracking

Progress is tracked at multiple levels:

| Level | Table | Key Fields |
|-------|-------|------------|
| Lesson | `lesson_progress` | `completed`, `video_position_seconds`, `time_spent_seconds` |
| Cohort | `cohort_enrollments` | `completed_lessons`, `progress` (JSONB) |
| Course | `enrollments` | `progress_percentage`, `status` |

The `cohort_enrollments.progress` field stores structured data:
```json
{
  "completed_lessons": 5,
  "completed_modules": 1,
  "percentage": 35
}
```

## Key Business Rules

### Enrollment
- Students can only enroll in `upcoming` or `active` cohorts
- Enrollment respects `max_students` capacity
- Unique constraint: one enrollment per user per cohort

### Assignment Submission
- Respects `due_date` unless `allow_late_submissions = true`
- First submission always allowed
- Resubmission requires `allow_resubmission = true`
- Cannot exceed `max_submissions`

### Quiz Attempts
- Respects `max_attempts` limit
- Enforces `time_limit_minutes` if set
- Auto-graded for multiple choice/true-false
- Manual review for essay questions

## Type Safety

The codebase uses a two-layer type system:

### Generated Types (`src/types/generated.ts`)
- Auto-generated from database schema
- Run `npm run db:types` to regenerate
- **NEVER edit manually**

### Application Types (`src/types/index.ts`)
- Extends generated types with stricter constraints
- Adds typed JSONB structures
- Defines API response formats

Example:
```typescript
// Generated type allows null
type CourseRow = { track: string | null; ... }

// Application type enforces non-null
interface Course extends Omit<CourseRow, 'track'> {
  track: 'animal_advocacy' | 'climate' | 'ai_safety' | 'general';
}
```

## Validation

Run these commands to verify schema-code alignment:

```bash
npm run db:types:check      # Schema-types sync
npm run db:field-names:check # snake_case validation
npm run db:validate:all     # All checks
```

CI workflow enforces these checks on every PR touching schema or types.

# CLAUDE.md - AI Development Guidelines for C4C Campus

## Critical Rules

### The Schema is Immutable

**`schema.sql` is the absolute, immutable source of truth for all data in this codebase.**

The database schema CANNOT be changed, modified, edited, or altered in any way. It is set in stone. When working on this codebase:

1. **NEVER suggest changes to `schema.sql`** - The schema is final and unchangeable
2. **NEVER propose new columns, tables, or modifications** to the database structure
3. **NEVER create migration files** that would alter the schema
4. **ALL code must conform to the existing schema** - not the other way around

If you encounter a situation where schema changes seem necessary, you must find a workaround within the existing structure. The schema defines reality; code must adapt to it.

### Defensive Programming Required

The site is predominantly working but contains bugs. When debugging or implementing fixes:

1. **Do not introduce breaking changes** - Every fix must be backward compatible
2. **Preserve existing functionality** - A bug fix should never break something else
3. **Test assumptions** - Never assume code paths work; verify them
4. **Handle edge cases** - Always consider null, undefined, empty arrays, and missing data
5. **Fail gracefully** - Errors should be caught and handled, never crash the user experience

## Schema Reference

### Core Tables (34 total)

The schema defines these table categories:

- **Authentication**: `applications`, `profiles`, `auth_logs`
- **Course Structure**: `courses`, `modules`, `lessons`
- **Cohort System**: `cohorts`, `cohort_enrollments`, `cohort_schedules`, `enrollments`, `lesson_progress`
- **Discussions**: `lesson_discussions`, `course_forums`, `forum_replies`
- **Assessments**: `quizzes`, `quiz_questions`, `quiz_attempts`, `assignments`, `assignment_rubrics`, `assignment_submissions`
- **Messaging**: `message_threads`, `messages`, `notifications`, `announcements`
- **AI Assistant**: `ai_conversations`, `ai_messages`, `ai_usage_logs`
- **Certificates**: `certificates`, `certificate_templates`
- **Payments**: `payments`, `subscriptions`
- **Media & Analytics**: `media_library`, `analytics_events`

### Key Schema Conventions

#### ID Types
- **UUID (string)**: `cohorts.id`, `quiz_attempts.id`, `assignment_submissions.id`, `applications.id`, most UUID primary keys
- **BIGSERIAL (number)**: `courses.id`, `modules.id`, `lessons.id`, `enrollments.id`, `lesson_progress.id`

Never confuse these. Always use the correct type:
```typescript
// CORRECT
const cohortId: string = "550e8400-e29b-41d4-a716-446655440000";
const courseId: number = 1;

// WRONG - will cause runtime errors
const cohortId: number = 1; // cohort IDs are UUIDs (strings)
```

#### Field Naming
- **Database**: snake_case (`user_id`, `created_at`, `max_students`)
- **TypeScript**: snake_case (matching database via generated types)
- **Never use camelCase in database queries**

```typescript
// CORRECT
.select('user_id, course_id')
.eq('created_at', date)

// WRONG - will fail
.select('userId, courseId')
.eq('createdAt', date)
```

#### Nullable Fields
Match the schema exactly:
- `cohort_id` in `lesson_progress` and `enrollments` is nullable (SET NULL on delete)
- `cohort_id` in `cohort_enrollments` and `cohort_schedules` is NOT NULL (CASCADE delete)

#### CHECK Constraints
TypeScript unions must match database constraints exactly:
```typescript
// Must match: CHECK (status IN ('active', 'completed', 'dropped', 'paused'))
type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'paused';

// Must match: CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'multiple_select'))
type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'multiple_select';
```

## Type System

### Generated Types
`src/types/generated.ts` is auto-generated from the database. **NEVER edit this file manually.**

```typescript
// Import types from generated.ts
import type { CourseRow, CohortRow, QuizAttemptRow } from './generated';
```

### Custom Types
`src/types/index.ts` contains application-level types that extend generated types:

```typescript
// Example: Course with stricter non-null constraints
export interface Course extends Omit<CourseRow, 'track' | 'difficulty' | 'created_by'> {
  track: 'animal_advocacy' | 'climate' | 'ai_safety' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_by: string;
}
```

## Debugging Guidelines

### Before Making Changes

1. **Read the relevant code first** - Understand what exists before modifying
2. **Check the schema** - Verify column names, types, and constraints
3. **Run type checking** - `npx astro check` before and after changes
4. **Run validation** - `npm run db:validate:all` to check schema-code sync

### Safe Bug Fixing

1. **Isolate the problem** - Identify the exact location of the bug
2. **Understand the impact** - What else depends on this code?
3. **Make minimal changes** - Fix only what's broken
4. **Add defensive checks** - Handle edge cases the original code missed
5. **Test thoroughly** - Verify the fix works and nothing else broke

### Common Bug Patterns

#### Null/Undefined Handling
```typescript
// DEFENSIVE: Always check for null/undefined
const cohortId = enrollment?.cohort_id ?? null;
const lessons = modules?.flatMap(m => m.lessons ?? []) ?? [];
const progress = enrollment?.progress?.completed_lessons ?? 0;
```

#### Type Coercion
```typescript
// DEFENSIVE: Parse IDs correctly
const courseId = typeof id === 'string' ? parseInt(id, 10) : id;
if (isNaN(courseId)) {
  return { error: 'Invalid course ID' };
}
```

#### Array Safety
```typescript
// DEFENSIVE: Check arrays before operations
if (!Array.isArray(questions) || questions.length === 0) {
  return { error: 'No questions found' };
}
const firstQuestion = questions[0];
```

#### Database Query Safety
```typescript
// DEFENSIVE: Check query results
const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();

if (error) {
  console.error('Database error:', error);
  return { error: 'Failed to fetch course' };
}

if (!data) {
  return { error: 'Course not found' };
}
```

### What NOT to Do

1. **Don't refactor while fixing bugs** - Stay focused on the issue
2. **Don't add features during bug fixes** - Scope creep causes regressions
3. **Don't remove "unnecessary" null checks** - They're probably there for a reason
4. **Don't change API response structures** - Existing clients depend on them
5. **Don't modify shared utilities** without understanding all usages

## API Guidelines

### Response Format
```typescript
interface APIResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
}
```

### Error Handling
```typescript
// Always return structured errors
if (!userId) {
  return new Response(JSON.stringify({
    data: null,
    error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
  }), { status: 401 });
}
```

## Validation Commands

Run these before committing changes:

```bash
# Type check
npx astro check

# Schema-types sync
npm run db:types:check

# Field name validation
npm run db:field-names:check

# All validation
npm run db:validate:all

# Integration tests
npm run test:integration
```

## File Organization

```
src/
├── components/     # React components
├── layouts/        # Astro layouts
├── lib/            # Shared utilities, API helpers
├── pages/          # Astro pages and API routes
│   └── api/        # API endpoints
└── types/          # TypeScript types
    ├── generated.ts  # Auto-generated (DO NOT EDIT)
    └── index.ts      # Application types
```

## Key Files

- `schema.sql` - **IMMUTABLE** database schema (source of truth)
- `src/types/generated.ts` - Auto-generated types (DO NOT EDIT)
- `src/types/index.ts` - Application-level type definitions
- `src/lib/api-handlers.ts` - API utility functions
- `src/lib/time-gating.ts` - Cohort schedule logic

## Summary

1. **Schema is immutable** - Never change it, always adapt code to it
2. **Be defensive** - Handle nulls, validate inputs, catch errors
3. **Don't break things** - Every change must be backward compatible
4. **Match types exactly** - UUID vs BIGSERIAL, snake_case everywhere
5. **Validate before committing** - Run type checks and tests

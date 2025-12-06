# Cohort System Documentation Index

Complete documentation for the C4C Campus Platform cohort and time-gating system.

**Last Updated**: October 29, 2025
**Status**: Implementation Complete

## Quick Navigation

### For Students
- [Student Help Center](./help/students.md) - How to enroll and learn in cohorts

### For Teachers
- [Teacher Training Guide](./training/teacher-guide.md) - Complete guide to create and manage cohorts
- [Cohort Creation Guide](./guides/cohort-creation.md) - Step-by-step cohort creation

### For Developers
- [Cohort API Reference](./api/cohorts.md) - Complete API endpoint documentation
- [Time-Gating Implementation](./guides/time-gating.md) - Technical details on module locking

### For All Users
- [Enrollment Guide](./guides/enrollment.md) - Understanding the enrollment process
- [Troubleshooting Guide](./help/troubleshooting.md) - Common issues and solutions

---

## Documentation by Role

### Student Documentation

**Getting Started:**
- [Student Help Center](./help/students.md) - Main resource for students

**Key Topics:**
- Understanding cohorts
- How to enroll
- Module locking and unlock dates
- Accessing course content
- Tracking progress
- Joining discussions

**FAQ:**
- Common student questions answered
- Troubleshooting video/enrollment issues
- Getting help from teachers

### Teacher Documentation

**Getting Started:**
- [Teacher Training Guide](./training/teacher-guide.md) - Comprehensive guide

**Key Topics:**
- Creating cohorts
- Setting up time-gating schedules
- Managing student enrollments
- Monitoring progress
- Best practices for cohort teaching
- Troubleshooting teacher issues

**References:**
- [Cohort Creation Guide](./guides/cohort-creation.md) - Detailed creation steps
- [Time-Gating Guide](./guides/time-gating.md) - Schedule planning

### Developer Documentation

**API Reference:**
- [Cohort API Documentation](./api/cohorts.md) - Complete endpoint reference
  - Creating cohorts (POST /api/cohorts)
  - Listing cohorts (GET /api/cohorts)
  - Updating cohorts (PATCH /api/cohorts/{id})
  - Enrollment endpoints
  - Schedule management endpoints
  - Time-gating check endpoints

**Implementation Details:**
- [Time-Gating Technical Guide](./guides/time-gating.md) - How time-gating works
  - Module unlock/lock logic
  - Utility functions
  - Database schema
  - Code examples

**Database Schema:**
- See [Cohort Creation Guide - Database Schema](./guides/cohort-creation.md#database-schema)
- See [Type Definitions](../src/types/index.ts)

---

## Documentation Structure

```
docs/
├── COHORT_DOCUMENTATION_INDEX.md (you are here)
├── guides/
│   ├── cohort-creation.md          # How to create cohorts
│   ├── enrollment.md                # Understanding enrollment
│   └── time-gating.md              # Module scheduling
├── training/
│   └── teacher-guide.md            # Comprehensive teacher resource
├── help/
│   ├── students.md                 # Student help center
│   └── troubleshooting.md          # Common issues
├── api/
│   └── cohorts.md                  # API reference
└── [other docs]/
    ├── security/
    │   └── cohort-rls-policies.md  # Row-level security
    ├── diagrams/
    │   └── cohort-erd.md           # Entity relationships
    └── migrations/
        └── 001-add-cohort-system.md # Schema migration guide
```

---

## Feature Overview

### Cohorts

A cohort is a time-based learning group with:
- **Fixed dates**: Start and end dates
- **Group learning**: Students learn together
- **Capacity limits**: Optional max students
- **Status tracking**: upcoming, active, completed, archived

**Key Characteristics:**
- One student per course per cohort
- Multiple cohorts of same course can run in parallel
- Teacher controls all aspects
- Time-gating controlled at cohort level

### Time-Gating

Module unlock/lock system:
- **Unlock Date**: When module becomes available
- **Lock Date**: When module is locked again (optional)
- **Teacher Override**: Teachers always see all content
- **Per-Cohort Schedules**: Each cohort has independent schedule

**Example Schedule:**
```
Module 1: Unlock 2025-03-01
Module 2: Unlock 2025-03-08
Module 3: Unlock 2025-03-15
```

### Enrollment

Student registration for cohorts:
- **Self-enrollment**: Students can self-enroll (if not full)
- **Teacher enrollment**: Teachers can enroll students
- **Capacity checking**: Prevents over-enrollment
- **Status tracking**: active, completed, dropped, paused

### Progress Tracking

Student progress within cohorts:
- **Lesson completion**: Track which lessons watched
- **Time spent**: Analytics on engagement
- **Module completion**: See progress across modules
- **Activity monitoring**: Last access time and frequency

---

## Key Concepts

### Cohort Status

| Status | Meaning | Behavior |
|--------|---------|----------|
| **Upcoming** | Not yet started | Visible, students can enroll, content not released |
| **Active** | Currently running | Visible, students can enroll, content releases per schedule |
| **Completed** | Finished | Visible, students cannot enroll (unless teacher adds), records kept |
| **Archived** | Completed and hidden | Not visible to students, prevents accidental enrollment |

### Enrollment Status

| Status | Meaning | Student Access |
|--------|---------|-----------------|
| **Active** | Currently participating | Full access to cohort content |
| **Paused** | Temporarily stopped | Limited access (at teacher discretion) |
| **Dropped** | Unenrolled | No access (but records kept) |
| **Completed** | Finished course | Access but marked complete |

### Module States

| State | Condition | User Can Access |
|-------|-----------|-----------------|
| **Unlocked** | Today >= unlock_date AND (no lock_date OR today < lock_date) | Yes (everyone) |
| **Locked** | Today < unlock_date | No (except teachers) |
| **Re-locked** | lock_date set AND today >= lock_date | No (except teachers) |
| **Not Scheduled** | No schedule exists | Yes (all students) |

---

## API Quick Reference

### Core Endpoints

**Cohorts:**
```
POST   /api/cohorts                 # Create
GET    /api/cohorts                 # List
GET    /api/cohorts/{id}            # Get one
PATCH  /api/cohorts/{id}            # Update
DELETE /api/cohorts/{id}            # Delete
```

**Enrollment:**
```
POST   /api/cohorts/{id}/enroll     # Enroll student
DELETE /api/cohorts/{id}/enroll     # Unenroll student
```

**Schedules:**
```
POST   /api/cohorts/{id}/schedule               # Create schedule
PATCH  /api/cohorts/{id}/schedule/{module_id}  # Update schedule
DELETE /api/cohorts/{id}/schedule/{module_id}  # Delete schedule
```

**Time-Gating Checks:**
```
GET    /api/cohorts/{id}/modules/status              # All modules
GET    /api/cohorts/{id}/modules/{id}/status        # Single module
```

### Request/Response Examples

**Create Cohort:**
```bash
POST /api/cohorts
{
  "course_id": 1,
  "name": "Spring 2025",
  "start_date": "2025-03-01",
  "max_students": 30
}
```

**Enroll Student:**
```bash
POST /api/cohorts/42/enroll
{}  # Self-enrollment, or
{ "user_id": "..." }  # Teacher enrollment
```

**Set Module Schedule:**
```bash
POST /api/cohorts/42/schedule
{
  "module_id": 1,
  "unlock_date": "2025-03-01"
}
```

See [API Reference](./api/cohorts.md) for complete documentation.

---

## Database Tables

### cohorts

```sql
id (PK)
course_id (FK)
name (unique per course)
start_date (DATE)
end_date (DATE, nullable)
status (upcoming|active|completed|archived)
max_students (INT, nullable)
created_by (UUID, FK to users)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### cohort_enrollments

```sql
id (PK)
cohort_id (FK)
user_id (FK)
enrolled_at (TIMESTAMP)
status (active|completed|dropped|paused)
completed_lessons (INT)
last_activity_at (TIMESTAMP)
created_at (TIMESTAMP)
UNIQUE(cohort_id, user_id)
```

### cohort_schedules

```sql
id (PK)
cohort_id (FK)
module_id (FK)
unlock_date (DATE)
lock_date (DATE, nullable)
created_at (TIMESTAMP)
UNIQUE(cohort_id, module_id)
```

See [Cohort Creation Guide](./guides/cohort-creation.md#database-schema) for full schema.

---

## Common Workflows

### Teacher: Create and Run a Cohort

1. [Create Cohort](./guides/cohort-creation.md#step-1-navigate-to-teacher-dashboard)
   - Name, dates, capacity
2. [Set Time-Gating](./guides/time-gating.md#step-3-configure-schedule-via-api)
   - Module unlock dates
3. [Manage Enrollments](./training/teacher-guide.md#student-management)
   - Enroll students individually or in bulk
4. [Monitor Progress](./training/teacher-guide.md#monitoring-progress)
   - Track completion, engagement, issues
5. [Complete Cohort](./training/teacher-guide.md#after-cohort-completes)
   - Archive, analyze, iterate

### Student: Join and Complete a Cohort

1. [Find Course](./help/students.md#step-1-find-courses)
2. [View Cohorts](./help/students.md#step-2-view-available-cohorts)
3. [Enroll](./help/students.md#step-3-click-enroll)
4. [Start Learning](./help/students.md#step-5-start-learning)
   - Watch unlocked modules
   - Wait for locked modules
   - Participate in discussions
5. [Complete Course](./help/students.md#tracking-progress)
   - Finish all modules
   - Get completion certificate

### Developer: Implement Cohort Features

1. [Understand Architecture](./api/cohorts.md#base-url)
   - Learn API structure
2. [Authentication](./api/cohorts.md#authentication)
   - Implement bearer tokens
3. [CRUD Operations](./api/cohorts.md#endpoints)
   - Create, read, update, delete cohorts
4. [Enrollment Management](./api/cohorts.md#enrollment-endpoints)
   - Handle student enrollments
5. [Time-Gating Logic](./guides/time-gating.md#time-gating-utility-functions)
   - Implement unlock/lock checks
6. [Testing](../tests/) - Write integration tests

---

## Integration Points

### With Authentication
- User must be authenticated for all endpoints
- Bearer token required in Authorization header
- Used to determine permissions (student vs. teacher)

### With Courses
- Cohorts belong to courses
- Only course creators (teachers) can manage cohorts
- Students must enroll in cohort to access course

### With Modules & Lessons
- Time-gating controls access to modules
- Unlock dates based on cohort schedule
- Teachers always bypass time-gating

### With Discussions
- Discussions linked to cohorts
- Cohort members can interact
- Module-specific discussions possible

### With Progress Tracking
- Lesson progress tracked per user
- Cohort enrollment captures start point
- Completion analytics per cohort

---

## Security Considerations

### Row-Level Security (RLS)

Cohort system uses RLS to:
- Students only see their enrolled cohorts
- Teachers only see their created cohorts
- Enrollment data protected

See [RLS Policies](./security/cohort-rls-policies.md) for details.

### Authorization

**Teacher Operations:**
- Only course creator can manage cohorts
- Only course creator can set schedules
- Only course creator can enroll students

**Student Operations:**
- Can enroll in any active, non-full cohort
- Can unenroll from own enrollments
- Can see only their own progress

### Data Protection

- Time-gating uses date comparisons only (no time component)
- Teachers can override time-gating (by design)
- Dropped enrollments kept for auditing
- Cohort deletion cascades to enrollments

---

## Testing

### Unit Tests

Test time-gating logic:
```
tests/unit/time-gating.test.ts
```

### Integration Tests

Test full workflows:
```
tests/integration/cohort-creation.test.ts
tests/integration/cohort-enrollment.test.ts
tests/integration/cohort-schema.test.ts
tests/integration/enrollment-flow.test.ts
```

### Running Tests

```bash
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:all         # Everything
```

---

## Troubleshooting

### Student Issues

- Can't enroll → See [Troubleshooting](./help/students.md#troubleshooting)
- Module locked → See [Module Locks](./help/students.md#understanding-module-locks)
- Progress not updating → See [Progress](./help/students.md#your-progress-bar)

### Teacher Issues

- Students not enrolling → See [Teacher Guide](./training/teacher-guide.md#no-students-are-enrolling)
- Schedule not working → See [Time-Gating](./training/teacher-guide.md#students-say-module-is-locked-but-it-should-be-unlocked)
- Enrollment issues → See [Management](./training/teacher-guide.md#student-management)

### Technical Issues

- API errors → See [API Reference](./api/cohorts.md#error-handling)
- Database issues → See [Migrations](./migrations/001-add-cohort-system.md)
- Time-gating logic → See [Implementation](./guides/time-gating.md)

---

## Version History

### v2.0 (October 29, 2025)
- Comprehensive documentation suite
- Teacher training materials
- Student help center
- Complete API reference
- Troubleshooting guides

### v1.0 (Earlier)
- Initial cohort system implementation
- Time-gating feature
- Enrollment system
- Basic API

---

## Getting Help

### Documentation
- Check relevant guide for your role
- Use table of contents for quick navigation
- Search documentation for keywords

### Support Channels
- **Teachers**: Contact teaching-team@c4c-campus.com
- **Students**: Contact support@c4c-campus.com
- **Developers**: Check API docs and code comments

### Reporting Issues
- Technical bugs: support@c4c-campus.com
- Feature requests: feedback@c4c-campus.com
- Documentation improvements: docs@c4c-campus.com

---

## Related Documentation

Other platform documentation:
- [Platform Architecture](./C4C_CAMPUS_PLATFORM_VISION.md)
- [Security Documentation](./security/)
- [API Guides](./api/)
- [Test Documentation](./tests/)
- [Database Schema](./schema.sql)

---

## Document Maintenance

**Last Updated**: October 29, 2025

### Adding to This Index
When creating new cohort-related documentation:
1. Create file in appropriate directory
2. Add reference to this index
3. Update table of contents if needed
4. Link to related documents

### Keeping Documentation Current
- Review quarterly
- Update for API changes
- Add new guides as features expand
- Gather feedback from users
- Keep examples current with code

---

This documentation is designed to be comprehensive yet accessible. Use the quick navigation links above to find what you need!

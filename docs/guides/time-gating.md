# Time-Gating Guide

## Overview

Time-gating is the mechanism that controls when students can access course modules within a cohort. Instead of making all content immediately available, you can schedule exactly when each module becomes accessible (unlock) and when it becomes inaccessible (lock).

## How Time-Gating Works

### Core Concept

Each cohort has a schedule that specifies:
- **Unlock Date**: When a module becomes available to students
- **Lock Date**: When a module is locked again (optional)

Time comparisons use **date only** (no time component), so:
- If unlock_date is 2025-03-01, the module unlocks at 00:00:00 on March 1st
- If today's date >= unlock_date, the module is unlocked
- If lock_date is set and today's date >= lock_date, the module is locked

### Module States

A module can have three states for a student:

| State | Condition | Explanation |
|-------|-----------|-------------|
| **Locked** | Today < unlock_date | Module is not yet available |
| **Unlocked** | Today >= unlock_date AND (no lock_date OR today < lock_date) | Module is accessible |
| **Locked (Again)** | Today >= lock_date | Module was locked after being available |

### Teacher Override

Teachers always have full access to all modules regardless of unlock/lock dates. This allows them to:
- Preview content before it unlocks
- See what students see
- Test module content
- Verify scheduling is correct

## Setting Up Time-Gating

### Step 1: Create a Cohort

First, create a cohort with a start date. See [Cohort Creation Guide](./cohort-creation.md).

### Step 2: Set Module Unlock Dates

For each module in your course, decide when it should unlock.

**Typical Schedule Example:**

Course: "Animal Advocacy 101"
- Cohort Start Date: 2025-03-01
- Module 1 (Introduction): Unlock 2025-03-01
- Module 2 (History): Unlock 2025-03-08 (1 week later)
- Module 3 (Methods): Unlock 2025-03-15 (2 weeks later)
- Module 4 (Case Studies): Unlock 2025-03-22 (3 weeks later)
- Module 5 (Action Planning): Unlock 2025-04-01 (4 weeks later)

### Step 3: Configure Schedule via API

Use the cohort schedules endpoint to set unlock dates.

#### Create Schedule Entry

```
POST /api/cohorts/{cohort_id}/schedule
```

**Request Body:**
```json
{
  "module_id": 1,
  "unlock_date": "2025-03-01",
  "lock_date": null
}
```

**Fields:**
- `module_id` (required): ID of the module to schedule
- `unlock_date` (required): ISO date (YYYY-MM-DD) when module unlocks
- `lock_date` (optional): ISO date when module locks again (null = stays unlocked)

**Success Response (201 Created):**
```json
{
  "success": true,
  "schedule": {
    "id": 15,
    "cohort_id": 42,
    "module_id": 1,
    "unlock_date": "2025-03-01",
    "lock_date": null,
    "created_at": "2025-01-22T10:00:00Z"
  },
  "message": "Schedule created successfully"
}
```

**Error Responses:**
- **400 Bad Request**: Invalid dates or missing fields
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Not the course creator
- **404 Not Found**: Cohort or module not found
- **409 Conflict**: Schedule already exists for this module in this cohort

#### Update Schedule Entry

```
PATCH /api/cohorts/{cohort_id}/schedule/{module_id}
```

**Request Body (all fields optional):**
```json
{
  "unlock_date": "2025-03-05",
  "lock_date": "2025-04-05"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "schedule": {
    "id": 15,
    "cohort_id": 42,
    "module_id": 1,
    "unlock_date": "2025-03-05",
    "lock_date": "2025-04-05",
    "created_at": "2025-01-22T10:00:00Z"
  },
  "message": "Schedule updated successfully"
}
```

## Real-World Examples

### Example 1: Weekly Release Schedule

**Goal**: Release one module per week for an 8-week course

```json
[
  { "module_id": 1, "unlock_date": "2025-03-01", "lock_date": null },
  { "module_id": 2, "unlock_date": "2025-03-08", "lock_date": null },
  { "module_id": 3, "unlock_date": "2025-03-15", "lock_date": null },
  { "module_id": 4, "unlock_date": "2025-03-22", "lock_date": null },
  { "module_id": 5, "unlock_date": "2025-03-29", "lock_date": null },
  { "module_id": 6, "unlock_date": "2025-04-05", "lock_date": null },
  { "module_id": 7, "unlock_date": "2025-04-12", "lock_date": null },
  { "module_id": 8, "unlock_date": "2025-04-19", "lock_date": null }
]
```

### Example 2: Staggered Release with Lock Dates

**Goal**: Release modules weekly but lock older ones to focus students on current material

```json
[
  { "module_id": 1, "unlock_date": "2025-03-01", "lock_date": "2025-03-15" },
  { "module_id": 2, "unlock_date": "2025-03-08", "lock_date": "2025-03-22" },
  { "module_id": 3, "unlock_date": "2025-03-15", "lock_date": "2025-03-29" },
  { "module_id": 4, "unlock_date": "2025-03-22", "lock_date": "2025-04-05" }
]
```

### Example 3: Front-Load Content Release

**Goal**: Release all content immediately, then lock gradually

```json
[
  { "module_id": 1, "unlock_date": "2025-03-01", "lock_date": null },
  { "module_id": 2, "unlock_date": "2025-03-01", "lock_date": null },
  { "module_id": 3, "unlock_date": "2025-03-01", "lock_date": null },
  { "module_id": 4, "unlock_date": "2025-03-01", "lock_date": null }
]
```

### Example 4: Prerequisite-Based Unlock

**Goal**: Different unlock dates for basic vs. advanced tracks

```json
[
  { "module_id": 1, "unlock_date": "2025-03-01", "lock_date": null },
  { "module_id": 2, "unlock_date": "2025-03-01", "lock_date": null },
  { "module_id": 5, "unlock_date": "2025-03-15", "lock_date": null },
  { "module_id": 6, "unlock_date": "2025-03-15", "lock_date": null }
]
```

## Checking Module Access

### Check if Module is Unlocked

```
GET /api/cohorts/{cohort_id}/modules/{module_id}/status
```

**Response:**
```json
{
  "isUnlocked": true,
  "unlockDate": "2025-03-01",
  "lockDate": null,
  "reason": "unlocked"
}
```

**Possible Reasons:**
- `"unlocked"`: Module is currently accessible
- `"locked"`: Module is scheduled but hasn't unlocked yet
- `"not_scheduled"`: No schedule exists (unlocked by default)
- `"teacher_override"`: User is a teacher (always unlocked)

### Check if Student Can Access Lesson

```
GET /api/lessons/{lesson_id}/access
```

**Response:**
```json
{
  "canAccess": true,
  "moduleUnlocked": true,
  "isEnrolled": true,
  "reason": "accessible"
}
```

**Possible Reasons:**
- `"accessible"`: Student can access this lesson
- `"module_locked"`: Module hasn't unlocked yet
- `"not_enrolled"`: Student is not enrolled in a cohort
- `"no_cohort"`: No cohort for this course
- `"teacher_override"`: User is a teacher

### Get All Module Statuses for a Cohort

```
GET /api/cohorts/{cohort_id}/modules/status
```

**Response:**
```json
{
  "modules": [
    {
      "module_id": 1,
      "isUnlocked": true,
      "unlockDate": "2025-03-01",
      "lockDate": null,
      "reason": "unlocked"
    },
    {
      "module_id": 2,
      "isUnlocked": false,
      "unlockDate": "2025-03-08",
      "lockDate": null,
      "reason": "locked"
    },
    {
      "module_id": 3,
      "isUnlocked": false,
      "unlockDate": "2025-03-15",
      "lockDate": null,
      "reason": "locked"
    }
  ]
}
```

## Time-Gating Utility Functions

The platform provides helper functions for checking unlock status in your code.

### JavaScript/TypeScript

```typescript
import {
  isModuleUnlocked,
  canAccessLesson,
  getCohortModuleStatuses,
  getUnlockDate,
  formatUnlockDate,
  getDaysUntilUnlock
} from '@/lib/time-gating';

// Check if a specific module is unlocked
const status = await isModuleUnlocked(moduleId, cohortId, supabase);
console.log(status.isUnlocked); // true or false
console.log(status.unlockDate); // Date object

// Check if a student can access a lesson
const access = await canAccessLesson(lessonId, userId, supabase);
if (access.canAccess) {
  // Show lesson content
} else {
  console.log(`Locked: ${access.reason}`);
}

// Get all module statuses for display
const statuses = await getCohortModuleStatuses(cohortId, supabase);
statuses.forEach((status, moduleId) => {
  console.log(`Module ${moduleId}: ${status.isUnlocked ? 'unlocked' : 'locked'}`);
});

// Get just the unlock date
const unlockDate = await getUnlockDate(moduleId, cohortId, supabase);
console.log(`Unlocks on: ${formatUnlockDate(unlockDate)}`);

// Calculate days until unlock
const daysUntil = getDaysUntilUnlock(unlockDate);
console.log(`${daysUntil} days until unlock`);
```

## UI Patterns for Locked Content

### Showing Lock Status to Students

When displaying modules to students:

```javascript
const status = await isModuleUnlocked(moduleId, cohortId, supabase);

if (status.isUnlocked) {
  // Show module content as clickable
  showModuleContent(module);
} else {
  // Show locked state with unlock date
  showLockedModule(module, status.unlockDate);
}
```

### Example Locked Module Display

```
[LOCKED] Module 2: Advanced Strategies

Unlocks on March 8, 2025 (2 days remaining)
Preview: Learn advanced strategies for effective advocacy
```

### Example Unlocked Module Display

```
[UNLOCKED] Module 1: Introduction to Animal Advocacy

Available now
Start: Introduction to Animal Advocacy
Progress: 0% complete
```

## Common Patterns and Best Practices

### Pattern 1: Linear Course with Weekly Release

- Release modules one per week
- No lock dates (students can revisit)
- Works well for self-paced learning

```
Week 1: Module 1 unlocks 2025-03-01
Week 2: Module 2 unlocks 2025-03-08
Week 3: Module 3 unlocks 2025-03-15
```

### Pattern 2: Cohort-Based Learning

- Release modules weekly
- Lock previous modules after 2 weeks
- Forces engagement with current material

```
Active Window: 2 weeks per module
As Module 2 opens, Module 1 locks
As Module 3 opens, Module 2 locks
```

### Pattern 3: Self-Paced with Opening Gate

- All content available from day 1
- No lock dates
- Students progress at their own pace
- Best for flexible learners

### Pattern 4: Structured Program with Milestones

- Modules unlock at specific dates
- Focused on achieving checkpoints
- Lock dates create urgency

```
Phase 1 (unlocks 2025-03-01, locks 2025-03-15)
Phase 2 (unlocks 2025-03-15, locks 2025-03-29)
Phase 3 (unlocks 2025-03-29, locks 2025-04-15)
```

## Troubleshooting

### "Module is showing as locked but today is past the unlock date"

**Problem**: Module shows locked even though the unlock date has passed.

**Possible Causes**:
- The time comparison uses date only (not time), but your unlock date might be in the future timezone
- Cache not updated (try refreshing)
- Lock date is set and has passed

**Solution**:
- Verify unlock date is correct (use YYYY-MM-DD format)
- Check if a lock date is set and limiting access
- Clear browser cache and reload

### "How do I change unlock dates for an existing schedule?"

**Solution**: Use the PATCH endpoint to update:

```
PATCH /api/cohorts/{cohort_id}/schedule/{module_id}

{
  "unlock_date": "2025-03-10"
}
```

### "Can I unlock modules only for specific students?"

**Current Implementation**: No, time-gating is at the cohort level - all students in a cohort see the same unlock dates.

**Workaround**: Create separate cohorts for different student groups with different schedules.

### "What happens if I set lock_date in the past?"

**Behavior**: If lock_date <= today's date, the module will be locked immediately.

**Use Case**: To hide completed modules from current view while keeping them accessible via archive.

## Migration Guide: Adding Time-Gating to Existing Cohorts

If you have existing cohorts without schedules:

1. **Create schedules** for each module in each cohort
   ```
   POST /api/cohorts/{cohort_id}/schedule
   ```

2. **Set unlock dates** based on:
   - Cohort start date + module order
   - Typically 1 week per module

3. **Review** by checking module status:
   ```
   GET /api/cohorts/{cohort_id}/modules/status
   ```

4. **Test** as a teacher to verify access control

## Related Documentation

- [Cohort Creation Guide](./cohort-creation.md) - Creating cohorts
- [Enrollment Guide](./enrollment.md) - Student enrollment
- [Time-Gating Source Code](../../src/lib/time-gating.ts) - Implementation details
- [API Documentation](../api/cohorts.md) - Complete API reference

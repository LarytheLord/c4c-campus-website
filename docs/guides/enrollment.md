# Student Enrollment Guide

## Overview

This guide explains how students enroll in cohorts and how the enrollment process works in the C4C Campus Platform. Enrollment links students to specific cohorts, which provides them with time-gated access to course content.

## What is Enrollment?

Enrollment in a cohort means:
- You are registered to take the course with a specific group (cohort)
- You have access to the course content according to the cohort's time-gating schedule
- Your progress is tracked within that cohort
- You can interact with other students in the same cohort (discussions, etc.)

## For Students

### Step 1: Browse Available Cohorts

1. Log in to your student account
2. Go to the "Courses" page
3. Find the course you want to take
4. View available cohorts for that course

**Cohort Information Displayed:**
- Cohort name (e.g., "Spring 2025 Cohort")
- Start date (when the cohort begins)
- End date (when the cohort concludes, if set)
- Current enrollment (number of students enrolled)
- Max capacity (if the cohort has a limit)
- Status (upcoming, active, completed, archived)

### Step 2: Select a Cohort

Choose the cohort that fits your schedule and learning style. Consider:
- **Cohort Status**: Can you join? (Cannot join "archived" cohorts)
- **Start Date**: Does it work with your timeline?
- **Capacity**: Is there still room? (Locked if full)
- **Schedule**: Does the module release schedule match your pace?

### Step 3: Enroll in the Cohort

Click the "Enroll" button on the cohort details page.

**What Happens:**
1. System checks if you're already enrolled
2. System verifies you're not enrolled in a different cohort for this course
3. System checks if the cohort is full
4. System checks if the cohort accepts enrollments (not archived)
5. Your enrollment is created with "active" status
6. You're automatically enrolled in the course (if not already)
7. You're redirected to the cohort dashboard

### Step 4: Access Course Content

After enrollment:
1. Go to the "Courses" or "Dashboard" section
2. Find your enrolled cohort
3. View the modules and lessons

**Important**: Content availability depends on the cohort's time-gating schedule. If a module shows as locked, it hasn't unlocked yet.

## API Endpoint Reference

### Enroll in a Cohort

```
POST /api/cohorts/{cohort_id}/enroll
```

**Request Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
- Empty for self-enrollment
- Optional `user_id` field (teachers only, to enroll other students)

**Self-Enrollment Request:**
```json
{}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "enrollment": {
    "id": 10,
    "cohort_id": 42,
    "user_id": "student-uuid-5678",
    "status": "active",
    "completed_lessons": 0,
    "enrolled_at": "2025-01-22T14:30:00Z",
    "last_activity_at": null,
    "created_at": "2025-01-22T14:30:00Z"
  },
  "message": "Successfully enrolled in cohort"
}
```

**Error Responses:**
- **400 Bad Request**: Invalid cohort ID or archived cohort
- **401 Unauthorized**: Not authenticated
- **404 Not Found**: Cohort not found
- **409 Conflict**: Already enrolled or cohort is full

### Unenroll from a Cohort

```
DELETE /api/cohorts/{cohort_id}/enroll
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
- Empty for self-unenrollment

**Success Response (200 OK):**
```json
{
  "success": true,
  "enrollment": {
    "id": 10,
    "cohort_id": 42,
    "user_id": "student-uuid-5678",
    "status": "dropped",
    "completed_lessons": 0,
    "enrolled_at": "2025-01-22T14:30:00Z",
    "last_activity_at": null,
    "created_at": "2025-01-22T14:30:00Z"
  },
  "message": "Successfully unenrolled from cohort"
}
```

### Check Enrollment Status

```
GET /api/cohorts/{cohort_id}/enrollments/{user_id}
```

**Response:**
```json
{
  "enrollment": {
    "id": 10,
    "cohort_id": 42,
    "user_id": "student-uuid-5678",
    "status": "active",
    "completed_lessons": 15,
    "enrolled_at": "2025-01-22T14:30:00Z",
    "last_activity_at": "2025-01-25T10:30:00Z",
    "created_at": "2025-01-22T14:30:00Z"
  }
}
```

### List Your Enrollments

```
GET /api/cohorts?enrolled=true
```

**Response:**
```json
{
  "cohorts": [
    {
      "id": 42,
      "course_id": 1,
      "name": "Spring 2025 Cohort",
      "start_date": "2025-03-01",
      "end_date": "2025-05-31",
      "status": "active",
      "enrollment": {
        "id": 10,
        "status": "active",
        "completed_lessons": 15,
        "enrolled_at": "2025-01-22T14:30:00Z"
      }
    }
  ]
}
```

## For Teachers

Teachers can enroll or unenroll students in their cohorts.

### Enroll a Student

```
POST /api/cohorts/{cohort_id}/enroll
```

**Request Body (teacher enrolling another student):**
```json
{
  "user_id": "student-uuid-to-enroll"
}
```

**Requirements:**
- You must be the course creator (teacher)
- The student must have a valid user ID
- The cohort must not be archived

**Success Response:**
```json
{
  "success": true,
  "enrollment": {
    "id": 11,
    "cohort_id": 42,
    "user_id": "student-uuid-to-enroll",
    "status": "active",
    "completed_lessons": 0,
    "enrolled_at": "2025-01-22T15:00:00Z"
  },
  "message": "User enrolled successfully"
}
```

### Unenroll a Student

```
DELETE /api/cohorts/{cohort_id}/enroll
```

**Request Body:**
```json
{
  "user_id": "student-uuid-to-unenroll"
}
```

**Success Response:**
```json
{
  "success": true,
  "enrollment": {
    "id": 11,
    "cohort_id": 42,
    "user_id": "student-uuid-to-unenroll",
    "status": "dropped",
    "completed_lessons": 5
  },
  "message": "User unenrolled successfully"
}
```

### View Cohort Enrollments

```
GET /api/cohorts/{cohort_id}
```

**Response includes:**
```json
{
  "cohort": {
    "id": 42,
    "course_id": 1,
    "name": "Spring 2025 Cohort",
    "status": "active",
    "max_students": 30
  },
  "enrollment_count": 25,
  "enrollments": [
    {
      "id": 10,
      "user_id": "student-uuid-5678",
      "status": "active",
      "completed_lessons": 15,
      "enrolled_at": "2025-01-22T14:30:00Z"
    },
    {
      "id": 11,
      "user_id": "student-uuid-9999",
      "status": "active",
      "completed_lessons": 8,
      "enrolled_at": "2025-01-23T10:00:00Z"
    }
  ]
}
```

## Understanding Enrollment Status

### Status Values

| Status | Meaning | User Action | Next States |
|--------|---------|-------------|------------|
| **Active** | Currently enrolled and learning | (default for new enrollments) | dropped, completed, paused |
| **Completed** | Finished the course | Set by teacher/system | archived |
| **Dropped** | Student or teacher removed enrollment | Student unenrolls or teacher removes | none (terminal) |
| **Paused** | Temporarily paused learning | Set by teacher | active, dropped |

### Status Transitions

```
Active → Completed (course finished)
Active → Dropped (unenroll)
Active → Paused (pause learning)
Paused → Active (resume)
Paused → Dropped (give up)
Completed → Paused (exceptional case)
```

## Common Enrollment Scenarios

### Scenario 1: Self-Enrollment (Most Common)

1. Student finds a course page
2. Student clicks "View Cohorts"
3. Student selects a cohort matching their schedule
4. Student clicks "Enroll"
5. System creates enrollment record
6. Student now sees course in dashboard

### Scenario 2: Teacher Enrolls Students (Batch)

1. Teacher has list of students to enroll
2. Teacher uses teacher dashboard
3. Teacher navigates to cohort
4. Teacher selects students to enroll
5. System creates enrollment records for each
6. Students receive notifications (optional)

### Scenario 3: Student Switches Cohorts

**Note**: Current implementation doesn't allow switching - students can only be in one cohort per course.

**Workaround**:
1. Unenroll from current cohort
2. Enroll in new cohort

**Impact**:
- Progress may not transfer (depends on configuration)
- Enrollment records show the drop and new enrollment

### Scenario 4: Mid-Cohort Enrollment

A student enrolls after the cohort has started:

1. Student enrolls in active cohort
2. Enrollment created with status "active"
3. Student can access unlocked modules immediately
4. Student cannot access not-yet-unlocked modules
5. Completed lessons counter starts at 0

### Scenario 5: Student Drops Then Re-enrolls

1. Student unenrolls (status → dropped)
2. Student re-enrolls in same cohort
3. System creates new enrollment record
4. Progress counter resets (starts at 0)
5. Previous dropped enrollment remains in history

## Understanding Capacity Limits

### How Capacity Works

- **max_students**: Maximum number of active enrollments per cohort
- **Counted**: active and paused enrollments
- **Not Counted**: dropped and completed enrollments
- **When Full**: New enrollment attempts get 409 Conflict error

### Example

Cohort has max_students = 30

| Status | Count |
|--------|-------|
| active: 20 | counts |
| paused: 5 | counts |
| dropped: 3 | doesn't count |
| completed: 2 | doesn't count |
| **Total** | **25/30** |

New student can enroll (5 spots remaining).

### Expanding Capacity

If a cohort is full:
- Teacher can increase max_students
- Then more students can enroll

Example:
```
PATCH /api/cohorts/42

{
  "max_students": 40
}
```

## Troubleshooting

### "Already enrolled in this cohort"

**Problem**: You tried to enroll but you're already enrolled.

**Solution**:
- Check your dashboard - you should already be seeing this cohort
- If you want to switch cohorts, unenroll first, then enroll in the new cohort

### "Cohort is full"

**Problem**: Cannot enroll because the cohort reached max student capacity.

**Solution**:
- Wait for a spot to open (another student drops)
- Ask the teacher to increase capacity
- Enroll in a different cohort of the same course

### "Cannot enroll in archived cohort"

**Problem**: The cohort's status is "archived" and closed to new enrollments.

**Solution**:
- Look for an "active" or "upcoming" cohort
- Contact teacher about opening enrollment

### "You are not enrolled in this course"

**Problem**: You tried to access course content but are not enrolled.

**Solution**:
- Visit the course page
- Click "View Cohorts"
- Enroll in a cohort
- Enrollment in cohort automatically enrolls you in the course

### "Module is locked"

**Problem**: You can see a module but it shows as locked.

**Explanation**: The cohort's time-gating schedule hasn't unlocked this module yet.

**Solution**:
- Check the unlock date shown on the module
- Wait until that date passes
- Contact teacher if unlock date seems wrong

## Understanding Time-Gating and Enrollment

### How Time-Gating Affects Enrollment

Time-gating is separate from enrollment. When you enroll:
- You immediately get access to the cohort
- You can see all modules and lessons
- But locked modules show as unavailable until their unlock date

### Module Availability After Enrollment

```
Scenario: Enroll on March 1st in cohort with this schedule:
- Module 1: unlocks March 1 → you see it immediately
- Module 2: unlocks March 8 → you see a "locked" state
- Module 3: unlocks March 15 → you see a "locked" state

As time passes:
- March 8: Module 2 becomes available
- March 15: Module 3 becomes available
```

### Progress Tracking

Your progress is tracked within your cohort:
- **completed_lessons**: Number of lessons you've finished
- **last_activity_at**: When you last accessed the course
- Stored in your enrollment record

## Database Schema

### Cohort Enrollments Table

```sql
CREATE TABLE cohort_enrollments (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
  completed_lessons INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_id, user_id)
);
```

### Key Constraints

- **UNIQUE(cohort_id, user_id)**: One enrollment per student per cohort
- **ON DELETE CASCADE**: If cohort deleted, enrollments deleted
- **status CHECK**: Enforces valid status values

## Related Documentation

- [Cohort Creation Guide](./cohort-creation.md) - Creating cohorts
- [Time-Gating Guide](./time-gating.md) - Understanding module unlocks
- [API Documentation](../api/cohorts.md) - Complete API reference
- [Student Help Center](../help/students.md) - Student-facing help content
- [Teacher Training](../training/teacher-guide.md) - Teacher guide

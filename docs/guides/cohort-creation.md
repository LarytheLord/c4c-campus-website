# Cohort Creation Guide

## Overview

Cohorts are time-gated learning groups that allow teachers to organize students and schedule when course modules become available. This guide explains how to create and manage cohorts in the C4C Campus Platform.

## What is a Cohort?

A cohort represents:
- A group of students learning the same course together
- A specific time period (start and end dates)
- A maximum student capacity (optional)
- A schedule for when course modules unlock

## Prerequisites

- You must be a course teacher (the user who created the course)
- You must have a course created in the platform
- You need valid date values for the cohort

## Creating a Cohort

### Step 1: Navigate to Teacher Dashboard

1. Log in to the platform with your teacher account
2. Go to the Teacher Dashboard
3. Find the course you want to create a cohort for

### Step 2: Create New Cohort

In your course management interface, click "Create Cohort" or "New Cohort".

### Step 3: Fill in Cohort Details

#### Required Fields

**Cohort Name** (string, non-empty)
- Descriptive name for the cohort
- Example: "Spring 2025 Cohort", "Advanced Track - Batch 1"
- Note: Cannot have duplicate names within the same course

**Course** (required)
- The course this cohort belongs to
- Automatically set to your selected course
- Cannot be changed after creation

**Start Date** (required, ISO format)
- When the cohort begins
- Format: YYYY-MM-DD (e.g., 2025-03-01)
- This date defines when the first unlocked module becomes available
- In the system, all time comparisons use date-only values (no time component)

**End Date** (optional, ISO format)
- When the cohort concludes
- Format: YYYY-MM-DD
- Must be after the start date if provided
- Used for display and filtering purposes
- Students can continue accessing content after this date unless you archive the cohort

#### Optional Fields

**Maximum Students** (positive integer)
- Cap on enrollment for this cohort
- Default: 50 students
- Set to unlimited by leaving blank or removing the value
- Enrollment will be prevented once capacity is reached
- Prevents: active + paused enrollments from counting
- Does not count: dropped or completed enrollments

**Status** (dropdown)
- **Upcoming**: Cohort hasn't started yet (initial state)
- **Active**: Cohort is currently running
- **Completed**: Cohort has finished but records remain
- **Archived**: Cohort is hidden from students and closed to new enrollments
- Default: "upcoming"

### Step 4: Save Cohort

Click "Create Cohort" to save. The system will:
1. Validate all required fields
2. Check for duplicate names
3. Verify you have permission (you're the course creator)
4. Create the cohort with "upcoming" status
5. Return the cohort details including its ID

## API Endpoint Reference

### Create Cohort via API

```
POST /api/cohorts
```

**Request Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "course_id": 1,
  "name": "Spring 2025 Cohort",
  "start_date": "2025-03-01",
  "end_date": "2025-05-31",
  "max_students": 30,
  "status": "upcoming"
}
```

**Field Validation:**
- `course_id`: Required, positive integer
- `name`: Required, non-empty string
- `start_date`: Required, valid ISO date string (YYYY-MM-DD)
- `end_date`: Optional, valid ISO date string, must be after start_date
- `max_students`: Optional, positive integer >= 1
- `status`: Optional, one of: upcoming | active | completed | archived

**Success Response (201 Created):**
```json
{
  "success": true,
  "cohort": {
    "id": 42,
    "course_id": 1,
    "name": "Spring 2025 Cohort",
    "start_date": "2025-03-01",
    "end_date": "2025-05-31",
    "max_students": 30,
    "status": "upcoming",
    "created_by": "user-uuid-1234",
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  },
  "message": "Cohort created successfully"
}
```

**Error Responses:**
- **400 Bad Request**: Validation failed (invalid dates, missing required fields)
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: You don't have permission (not the course creator)
- **404 Not Found**: Course not found
- **409 Conflict**: Cohort name already exists for this course
- **500 Internal Server Error**: Database error

## Managing Cohorts After Creation

### List Cohorts

```
GET /api/cohorts?course_id=1&status=active
```

**Query Parameters:**
- `course_id`: Optional, filter by course
- `status`: Optional, filter by status

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
      "max_students": 30,
      "status": "active",
      "created_by": "user-uuid-1234",
      "created_at": "2025-01-15T14:30:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### Get Cohort Details

```
GET /api/cohorts/{id}
```

**Response:**
```json
{
  "cohort": {
    "id": 42,
    "course_id": 1,
    "name": "Spring 2025 Cohort",
    "start_date": "2025-03-01",
    "end_date": "2025-05-31",
    "max_students": 30,
    "status": "active",
    "created_by": "user-uuid-1234",
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  },
  "enrollment_count": 25
}
```

### Update Cohort

```
PATCH /api/cohorts/{id}
```

**Request Body (all fields optional):**
```json
{
  "name": "Spring 2025 Advanced",
  "start_date": "2025-03-05",
  "end_date": "2025-06-15",
  "max_students": 40,
  "status": "active"
}
```

**Validation Rules:**
- Name cannot be duplicated within the course
- End date must be after start date
- Status must be one of the valid values
- Only course creator can update

**Success Response (200 OK):**
```json
{
  "success": true,
  "cohort": {
    "id": 42,
    "course_id": 1,
    "name": "Spring 2025 Advanced",
    "start_date": "2025-03-05",
    "end_date": "2025-06-15",
    "max_students": 40,
    "status": "active",
    "created_by": "user-uuid-1234",
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-22T15:45:00Z"
  },
  "message": "Cohort updated successfully"
}
```

### Delete Cohort

```
DELETE /api/cohorts/{id}
```

**Security:**
- Only the course creator can delete cohorts
- Deletes the cohort and related enrollments (cascade)
- Should be used carefully - consider archiving instead

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Cohort deleted successfully"
}
```

## Best Practices

### Naming Conventions

Use descriptive names that include:
- **Season/Term**: "Spring 2025", "Summer 2024"
- **Track or Level**: "Beginner", "Advanced", "Leadership"
- **Batch Number**: "Batch 1", "Cohort A", "Group 1"

Examples:
- "Spring 2025 - Animal Advocacy Beginners"
- "Summer 2024 Advanced Batch 2"
- "Fall 2025 Climate Leadership"

### Date Planning

1. **Consider holidays**: Account for breaks when planning dates
2. **Buffer time**: Add 1-2 days before the actual start for setup
3. **End date flexibility**: You can update the end date later if needed
4. **Module scheduling**: Plan module unlock dates around your start date

### Student Capacity

- **Small cohorts (< 20)**: Easy to manage, high engagement
- **Medium cohorts (20-40)**: Good balance of scale and management
- **Large cohorts (40+)**: Requires more automated systems

## Common Workflows

### Creating Multiple Cohorts for the Same Course

If you want to offer the same course multiple times:

1. Create first cohort with dates for Cohort A
2. Create second cohort with different dates for Cohort B
3. Set up module schedules for each cohort separately
4. Students can only enroll in one cohort per course

### Transitioning Cohorts

When a cohort ends and you want to start a new one:

1. **End the current cohort**: Update status to "completed"
2. **Create new cohort**: Create with new dates
3. **Set up schedule**: Configure module unlock dates for new cohort
4. **Notify students**: Announce the new cohort enrollment

### Archiving Old Cohorts

To hide completed cohorts from students:

1. Open cohort details
2. Update status to "archived"
3. Archived cohorts won't appear in enrollment lists
4. Existing enrollments continue to work (students keep access)

## Troubleshooting

### "Cohort name already exists for this course"

**Problem**: You're trying to create a cohort with a name that's already used in this course.

**Solution**:
- Use a unique name (add term, cohort number, or variant)
- Or delete/rename the existing cohort first

### "End date must be after start date"

**Problem**: You entered an end date that's before or equal to the start date.

**Solution**:
- Ensure end date is at least one day after start date
- Use calendar picker to avoid manual entry errors

### "Only course teachers can create cohorts"

**Problem**: You don't have permission to create cohorts.

**Solution**:
- Ensure you're logged in with the teacher account that created the course
- Course creators can manage cohorts; others cannot

### "Cohort is full"

**Problem**: You're trying to enroll but the cohort has reached max capacity.

**Solution**:
- Increase max_students if applicable
- Create a new cohort for additional students
- Ask the teacher to expand capacity

## Database Schema

### Cohorts Table

```sql
CREATE TABLE cohorts (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'upcoming',
  max_students INTEGER,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, name)
);
```

### Cohort Enrollments Table

```sql
CREATE TABLE cohort_enrollments (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  completed_lessons INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_id, user_id)
);
```

### Cohort Schedules Table

```sql
CREATE TABLE cohort_schedules (
  id SERIAL PRIMARY KEY,
  cohort_id INTEGER NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  unlock_date DATE NOT NULL,
  lock_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_id, module_id)
);
```

## Related Documentation

- [Time-Gating Guide](./time-gating.md) - How to schedule module unlocks
- [Enrollment Guide](./enrollment.md) - Student enrollment process
- [API Documentation](../api/cohorts.md) - Complete API reference
- [Teacher Training](../training/teacher-guide.md) - Full teacher guide

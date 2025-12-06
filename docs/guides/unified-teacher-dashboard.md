# Unified Teacher Dashboard Guide

**Last Updated:** October 29, 2025
**Version:** 2.0.0
**Audience:** Course Instructors & Teaching Assistants

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Dashboard Layout & Navigation](#dashboard-layout--navigation)
4. [Creating Courses](#creating-courses)
5. [Managing Cohorts](#managing-cohorts)
6. [Monitoring Student Progress](#monitoring-student-progress)
7. [Best Practices](#best-practices)
8. [FAQs](#faqs)

---

## Overview

The Unified Teacher Dashboard is your central hub for managing courses, cohorts, and student progress. It provides a streamlined interface to:

- Create and manage courses across multiple tracks
- Organize students into cohorts
- Monitor real-time student progress and engagement
- Track completion metrics and identify struggling students
- Export data for reporting and analysis

### Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Course Creation** | Build courses with name, description, track, and difficulty level | Organize curriculum efficiently |
| **Multi-Track Support** | Organize by Animal Advocacy, Climate, AI Safety, or General | Flexible course organization |
| **Course Publishing** | Draft and publish courses to control visibility | Quality control before student access |
| **Draft Management** | Keep courses in progress without affecting students | Collaborative course development |
| **Student Progress Tracking** | Real-time completion percentages and lesson counts | Quick visibility of class performance |
| **Engagement Metrics** | Monitor discussion participation and activity patterns | Identify disengaged students early |
| **Activity Timeline** | Last active timestamps for each student | Find inactive students needing outreach |
| **Course Statistics** | View published, draft, and student enrollment counts | Understand course impact and scope |

---

## Getting Started

### Step 1: Log In as a Teacher

1. Navigate to `https://c4c-campus.vercel.app/login`
2. Sign in with your teacher account credentials
3. You'll be redirected to the Teacher Dashboard automatically

**Note:** If you see the student dashboard instead, contact an administrator to update your role to "teacher" in the system.

### Step 2: Explore the Dashboard

When you first log in, you'll see:

```
┌──────────────────────────────────────────────────────────────┐
│  👋 Welcome Back, [Your Name]!                              │
├──────────────────────────────────────────────────────────────┤
│  Dashboard Header                                            │
│  ├─ Logo & Dashboard Title                                 │
│  ├─ Navigation Links: [Applications] [Browse Courses]      │
│  └─ [Sign Out] Button                                      │
├──────────────────────────────────────────────────────────────┤
│  📊 Quick Statistics                                        │
│  ├─ 📚 My Courses: [X]                                     │
│  ├─ ✅ Published: [X]                                       │
│  ├─ 👥 Total Students: [X]                                 │
│  └─ 📝 Drafts: [X]                                         │
├──────────────────────────────────────────────────────────────┤
│  📚 My Courses                      [➕ Create New Course]    │
│  ┌────────────────┬────────────────┬────────────────┐       │
│  │  Course Card   │  Course Card   │  Course Card   │       │
│  └────────────────┴────────────────┴────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

---

## Dashboard Layout & Navigation

### Header Section

The header provides quick navigation and user information:

- **Logo**: Click to return to main dashboard
- **Title & Welcome Message**: Personalized greeting with your first name
- **Navigation Links**:
  - **Applications**: View and manage applications
  - **Browse Courses**: See published courses as students do
- **Sign Out**: Securely log out

### Statistics Panel

The statistics cards give you an at-a-glance overview:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│     📚       │      ✅      │      👥      │      📝      │
│ My Courses   │  Published   │Total Students│   Drafts     │
│      5       │      3       │     127      │      2       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Metric Definitions:**
- **My Courses**: Total number of courses you've created
- **Published**: Courses visible to students
- **Total Students**: Aggregated enrollment across all your courses
- **Drafts**: In-progress courses not yet published

### Course Grid

The main area displays your courses in a responsive grid:

**Each Course Card Shows:**

```
┌─────────────────────────────┐
│ Course Name              📌 │ (Draft or Published badge)
├─────────────────────────────┤
│ Short description...        │
│                             │
├─────────────────────────────┤
│ [Track] [Difficulty] [Xh]   │ (metadata badges)
├─────────────────────────────┤
│ [Manage] [Edit] [Delete]    │ (action buttons)
└─────────────────────────────┘
```

**Course Card Elements:**

- **Title & Status Badge**:
  - 🟠 "Draft" (orange) - Not published yet
  - 🟢 "Published" (green) - Visible to students

- **Description**: Short overview (truncated to 2 lines)

- **Metadata Badges**:
  - Track: Animal Advocacy, Climate, AI Safety, General
  - Difficulty: Beginner, Intermediate, Advanced
  - Duration: Estimated hours (e.g., "6h")

- **Action Buttons**:
  - **Manage**: Open course management page (view students, modules, lessons)
  - **Edit**: Modify course details
  - **Delete**: Remove course (with confirmation)

### Empty State

When you have no courses:

```
┌──────────────────────────────────────┐
│            📚                        │
│       No courses yet                 │
│  Create your first course to get     │
│         started!                     │
│                                      │
│  [Create Your First Course]          │
└──────────────────────────────────────┘
```

---

## Creating Courses

### Step 1: Open the Create Course Modal

Click **"➕ Create New Course"** button in the top right of the "My Courses" section.

### Step 2: Fill in Course Details

The Create Course form includes these fields:

#### Required Fields

**Course Name***
- Your course's title
- Examples: "Introduction to n8n", "Climate Data Analysis 101"
- Character limit: None (but keep it concise)

**Track***
- Choose from:
  - 🦁 **Animal Advocacy** - Tools for animal liberation work
  - 🌍 **Climate** - Climate impact and sustainability tools
  - 🤖 **AI Safety** - AI ethics and safety considerations
  - ⭐ **General** - Universal AI/no-code courses
- This categorizes your course for students

**Difficulty***
- Choose from:
  - 🟢 **Beginner** - No prerequisites, fundamentals focus
  - 🟡 **Intermediate** - Assumes basic understanding
  - 🔴 **Advanced** - For experienced practitioners
- Helps students self-select appropriate level

**URL Slug***
- The URL-friendly identifier for your course
- Examples: `intro-to-n8n`, `climate-data-101`
- Auto-generated from course name but customizable
- Use lowercase, hyphens, no spaces or special characters
- Must be unique across all courses

#### Optional Fields

**Description**
- Long-form description of what students will learn
- Supports multiple paragraphs
- Appears in course cards and detail pages
- Great for learning outcomes and prerequisites

**Estimated Hours**
- How long the course takes to complete
- Examples: 5, 10, 15, 20
- Helps set student expectations

### Step 3: Set Publishing Status

**Publish Course (Checkbox)**
- ✓ Checked = Course is visible to students immediately
- ☐ Unchecked = Course saved as draft (only visible to you)

**Recommendation**: Keep unchecked while building content, then publish when ready.

### Step 4: Save the Course

Click **"Save Course"** button. The course will appear in your grid within seconds.

### Example: Creating a Complete Course

**Scenario**: You want to create an intermediate climate course.

```
Form Entry:
┌────────────────────────────────────────┐
│ Course Name*: Climate Impact Analytics │
├────────────────────────────────────────┤
│ Description:                            │
│ Learn to analyze climate data using     │
│ n8n and Python. Covers temperature      │
│ trends, carbon footprint tracking, and  │
│ creating dashboards for climate action. │
├────────────────────────────────────────┤
│ Track*: Climate                        │
│ Difficulty*: Intermediate              │
│ Estimated Hours: 12                    │
├────────────────────────────────────────┤
│ URL Slug*: climate-impact-analytics    │
├────────────────────────────────────────┤
│ ☐ Publish course                       │
├────────────────────────────────────────┤
│ [Save Course]  [Cancel]                │
└────────────────────────────────────────┘
```

---

## Managing Cohorts

### What are Cohorts?

Cohorts are groups of students taking the same course at the same time. They allow you to:
- Organize students by class, time, or learning path
- Track progress by group
- Create focused discussion spaces
- Apply different pacing or content variations

### Step 1: Open a Course

Click **"Manage"** on any course card to open the course management page.

### Step 2: Navigate to Cohorts Tab

The course detail page has multiple tabs:
- Overview
- Content
- Students
- Discussions
- **Cohorts** ← You are here

### Step 3: Create a Cohort

In the Cohorts section, click **"➕ Create Cohort"**.

**Cohort Creation Form:**

```
┌──────────────────────────────────┐
│ Create New Cohort                │
├──────────────────────────────────┤
│ Cohort Name*                     │
│ [e.g., Fall 2025 Batch A]       │
├──────────────────────────────────┤
│ Description (Optional)           │
│ [e.g., Tuesday evening class]   │
├──────────────────────────────────┤
│ Start Date (Optional)            │
│ [Calendar Picker]                │
├──────────────────────────────────┤
│ End Date (Optional)              │
│ [Calendar Picker]                │
├──────────────────────────────────┤
│ Max Students (Optional)          │
│ [Numeric field]                  │
├──────────────────────────────────┤
│ [Create Cohort]  [Cancel]        │
└──────────────────────────────────┘
```

**Field Definitions:**

- **Cohort Name***: Identify this group (required)
  - Examples: "Fall 2025", "University X", "Mentorship Group 3"

- **Description**: Additional context
  - Examples: "Evening cohort for working professionals", "University partnership"

- **Start Date**: When students can access course
  - Leave empty for immediate access
  - Set future dates to schedule course release

- **End Date**: When course access expires
  - Leave empty for indefinite access
  - Use for time-limited bootcamps or workshops

- **Max Students**: Enrollment cap
  - Leave empty for unlimited enrollment
  - Set limits for small group cohorts

### Step 4: Assign Students to Cohort

After creating a cohort, click **"Manage Students"** to add students.

**Methods to Add Students:**

1. **Import CSV**: Upload student list
   ```csv
   name,email
   Alice Johnson,alice@example.com
   Bob Smith,bob@example.com
   ```

2. **Add Individual**: Type name and email, click "Add"

3. **Generate Invite Link**: Share link for self-enrollment
   - Link format: `c4c-campus.vercel.app/join/[cohort-code]`
   - Perfect for open cohorts

### Step 5: Monitor Cohort Progress

In the **Students** tab, use the cohort dropdown to filter:

```
[Cohort: Fall 2025 Batch A ▼]
```

Shows roster for selected cohort with:
- Student names and emails
- Progress percentages
- Last activity
- Engagement metrics

---

## Monitoring Student Progress

### Accessing Student Progress

1. Open course → **Students** tab
2. Select cohort from dropdown (if multiple)
3. View roster table with progress data

### Understanding Progress Metrics

**Progress Percentage**

```
Progress % = (Completed Lessons / Total Lessons) × 100
```

**Color Coding:**
- 🟢 **Green (75-100%)**: On track, excelling
- 🟡 **Yellow (50-74%)**: Making progress
- 🟠 **Orange (25-49%)**: Falling behind
- 🔴 **Red (0-24%)**: At risk, needs intervention

**Example Interpretation:**

| Student | Progress | Status | Recommended Action |
|---------|----------|--------|-------------------|
| Alice | 85% (17/20) | Excelling | Encourage peer tutoring |
| Bob | 60% (12/20) | On track | Monitor, provide encouragement |
| Eve | 20% (4/20) | At risk | Reach out personally |

### Engagement Metrics

**Discussion Posts (💬):**
- Questions asked in lesson comments
- Replies to other students' questions

**Forum Posts (📝):**
- Topics created in course forums
- General discussions

**Interpretation:**

| Posts | Level | What It Means |
|-------|-------|---------------|
| 0-2 | 🔴 Low | Passive learner or independent |
| 3-9 | 🟡 Medium | Normal engagement |
| 10+ | 🟢 High | Active community member |

**Important**: Some students learn silently. Low engagement doesn't necessarily indicate disengagement.

### Last Activity

Timestamp of when student last:
- Watched a lesson video
- Completed a lesson
- Updated video progress

**Activity Status:**

| Last Active | Status | Action |
|-------------|--------|--------|
| < 24 hours | 🟢 Active | No action needed |
| 1-3 days | 🟡 Normal | Monitor |
| 4-7 days | 🟠 Slipping | Send reminder |
| 8-14 days | 🔴 Inactive | Reach out personally |
| 15+ days | ⚫ Dormant | Offer to re-enroll later |

### Identifying At-Risk Students

A student is at-risk if they show 2+ of these patterns:

1. ⚠️ Low Progress: <40% completion
2. ⚠️ Inactive: No activity in 7+ days
3. ⚠️ Low Engagement: 0-2 posts total
4. ⚠️ Stagnant Progress: Same % for 2+ weeks
5. ⚠️ Rapid Drop-off: Started strong but now inactive

**Action Steps:**

1. Filter to "At-Risk" students (use dashboard filters)
2. Click student name for detailed history
3. Send personalized email explaining you're here to help
4. Offer options: call, pausing, peer tutoring, additional resources

---

## Best Practices

### Daily Routine (5-10 minutes)

```
1. Open Teacher Dashboard
2. Check "At-Risk Students" panel
3. Send 1-2 encouragement emails
4. Review new discussion posts
5. Reply to urgent questions
```

### Weekly Routine (30 minutes)

```
1. Export roster to CSV
2. Analyze progress trends
3. Identify struggling lessons
4. Plan interventions
5. Celebrate wins (high performers)
```

### Course Design Practices

**Before Publishing:**
- ✓ Create at least one cohort
- ✓ Add sample content
- ✓ Test student enrollment
- ✓ Review first 2 lessons as student
- ✓ Update course description and metadata

**After Publishing:**
- ✓ Monitor first week closely for tech issues
- ✓ Be responsive to student questions
- ✓ Track drop-off points
- ✓ Gather feedback at 25%, 50%, 75% milestones
- ✓ Iterate based on student data

### Intervention Strategies

**Level 1: Automated Nudges**
- Platform sends auto-reminders on day 7 inactive
- Students get milestone congratulations
- Module unlock notifications

**Level 2: Personal Outreach**
- Email at-risk students with specific help offer
- Use templates but personalize with names/data
- CC yourself to track follow-ups

**Level 3: Synchronous Support**
- Offer office hours or 1-on-1 calls
- Pair struggling students with peer tutors
- Create small group study sessions

### Communication Templates

**Check-In Email:**

```
Subject: Checking in on [Course Name]

Hi [Student Name],

I noticed you haven't been active in the course recently, and I wanted to check in. You started with great momentum, and I'd love to help you get back on track!

Here's where you're at:
- Progress: [X]% ([Y]/[Z] lessons)
- Last lesson: [Lesson Name]
- Next up: [Next Lesson Name]

Is there anything blocking your progress? I'm here to help!

[Include calendar link for office hours]

Best,
[Your Name]
```

**Congratulations Email:**

```
Subject: Amazing progress in [Course Name]! 🎉

Hi [Student Name],

I wanted to congratulate you on your outstanding progress! You're currently at [X]% completion and ranked #[Rank] in your cohort.

Your active participation ([Y] posts) has been incredibly valuable!

Keep up the amazing work!

Best,
[Your Name]
```

---

## FAQs

### General

**Q: How do I edit a course after publishing?**
A: Click the **"Edit"** button on the course card. Published courses can be edited anytime; students see updates immediately.

**Q: Can I unpublish a course?**
A: Yes, use the edit form to uncheck "Publish course". The course will become a draft again.

**Q: What happens if I delete a course?**
A: The course is removed permanently. Student enrollment data is also deleted. Be careful with this action!

**Q: Can students see drafts?**
A: No, only published courses appear in the student course catalog.

### Cohorts

**Q: Can a student be in multiple cohorts of the same course?**
A: No, each student can only enroll in one cohort per course. You can transfer them between cohorts if needed.

**Q: How do I transfer a student to a different cohort?**
A: Go to course → Students tab → Click student name → Use "Transfer to Cohort" option.

**Q: Can I set enrollment deadlines?**
A: Yes, use the cohort "End Date" to set when access expires. Students get a warning 7 days before.

### Progress & Engagement

**Q: How do I manually mark a lesson complete?**
A: Go to student detail view → Lesson history → Click "Mark Complete" next to lesson.

**Q: Why does a student show 100% but no status?**
A: "Completed" is a separate manual status. 100% means all lessons watched. You set completion status when grading assessments.

**Q: Can progress go backward?**
A: No, once a lesson is marked complete, it stays complete.

**Q: How often does progress update?**
A: Every 10 seconds during video playback. The roster refreshes every 5 minutes. Click "Refresh" for real-time updates.

### Technical

**Q: My students can't enroll. What should I do?**
A: Check:
1. Course is published
2. Cohort is active (no end date in past)
3. Max students not exceeded
4. Student has valid account and role

Contact support if issues persist.

**Q: The roster is loading slowly.**
A: Try:
1. Reduce time range filter
2. Use search to narrow results
3. Check browser performance (clear cache)
4. Try different browser

---

## Support Resources

- **Technical Issues**: [Platform Status](https://status.c4c-campus.com)
- **Student Help**: [Help Center](https://help.c4c-campus.com)
- **Teacher Community**: [Slack Channel](https://c4c.slack.com/teachers)
- **Bug Reports**: support@c4c-campus.com

---

**Document Version:** 2.0.0
**Last Updated:** October 29, 2025
**Maintained By:** C4C Platform Team
**Feedback:** teachers@c4c-campus.com

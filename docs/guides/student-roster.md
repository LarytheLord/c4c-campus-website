# Student Roster Guide

## Table of Contents
1. [Overview](#overview)
2. [Accessing the Roster](#accessing-the-roster)
3. [Understanding the Roster Interface](#understanding-the-roster-interface)
4. [Core Features](#core-features)
5. [Filtering & Searching](#filtering--searching)
6. [Sorting Students](#sorting-students)
7. [Viewing Student Details](#viewing-student-details)
8. [Exporting Data](#exporting-data)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Student Roster is a comprehensive tool that displays all enrolled students in your cohorts. It provides real-time visibility into student engagement, progress, and activity patterns, enabling data-driven decisions about student support and intervention.

### Key Benefits
- **At-a-glance student overview**: See all students and their progress in one place
- **Real-time activity tracking**: Monitor when students were last active
- **Progress monitoring**: Track lesson completion and engagement metrics
- **Status visibility**: Understand which students are active, completed, paused, or dropped
- **Data export**: Export student data for reporting and analysis

---

## Accessing the Roster

### For Teachers
1. Log in to your C4C Campus account
2. Navigate to **Teacher Dashboard** (Teachers can access via `/teacher/courses`)
3. Select a cohort to view its roster
4. The roster will display all students enrolled in that cohort

### For Admins
1. Log in with admin credentials
2. Navigate to **Admin Panel** or **Teacher Dashboard**
3. Select a cohort to view the roster
4. Access to all cohorts is available

### URL
```
/teacher/progress?cohort_id={cohort_id}
```

---

## Understanding the Roster Interface

### Main Roster Components

#### Desktop View (Table Format)
```
┌─────────────────────────────────────────────────────────────────┐
│ Name              │ Progress │ Last Activity │ Status │ Actions │
├─────────────────────────────────────────────────────────────────┤
│ John Smith        │ 75%      │ Today         │ Active │ View    │
│ jane@example.com  │          │               │        │ Details │
├─────────────────────────────────────────────────────────────────┤
│ Sarah Johnson     │ 45%      │ 2 days ago    │ Active │ View    │
│ sarah@example.com │          │               │        │ Details │
└─────────────────────────────────────────────────────────────────┘
```

#### Mobile View (Card Format)
```
┌──────────────────────────────┐
│ John Smith                   │ Active
│ john@example.com             │
│                              │
│ Progress: 75%                │
│ ████████░ 15/20 lessons     │
│                              │
│ Last Activity: Today         │
│                              │
│ [View Details] [More Info]   │
└──────────────────────────────┘
```

### Column Descriptions

| Column | Description | Mobile View |
|--------|-------------|-------------|
| **Name** | Student's full name and email address | Displays above status |
| **Progress** | Visual progress bar with percentage (0-100%) | Shown as percentage |
| **Last Activity** | Time since student last accessed course (e.g., "2 days ago") | Shown as "Last Activity: [time]" |
| **Status** | Student's current enrollment status (Active/Completed/Paused/Dropped) | Color-coded badge |
| **Engagement Score** | Numerical metric (0-100) based on activity patterns | May not display on mobile |

### Status Indicators

- **Active** (Green badge): Student is actively enrolled and learning
- **Completed** (Blue badge): Student has finished all course requirements
- **Paused** (Orange badge): Student has temporarily paused enrollment
- **Dropped** (Red badge): Student has unenrolled or stopped participating

---

## Core Features

### 1. Search Functionality

Search across student names and email addresses to quickly locate specific students.

**How to Search:**
1. Click the search input field at the top of the roster
2. Type a student's name or email (case-insensitive)
3. Results update in real-time as you type
4. Clear the search to see all students again

**Example Searches:**
- `John Smith` - Finds all students with "John" or "Smith" in their name
- `john@example.com` - Finds the exact email address
- `john` - Finds all partial matches (John, Johnny, Jonathan)

### 2. Status Filtering

Filter roster by student status to focus on specific groups.

**Filter Options:**
- **All Statuses**: Shows all enrolled students
- **Active**: Students currently enrolled and participating
- **Completed**: Students who have finished the course
- **Paused**: Students with temporarily paused enrollment
- **Dropped**: Students who have unenrolled

**How to Filter:**
1. Click the **Status Filter** dropdown
2. Select desired status
3. Roster automatically updates to show matching students
4. Search filters work in combination with status filters

### 3. Combined Filtering

You can apply multiple filters simultaneously for precise targeting.

**Example Workflows:**
- Filter: "Active" students + Search: "john"
  Result: All active students with "john" in their name/email

- Filter: "Dropped" students + Search: "doe"
  Result: All dropped students with "doe" in their name/email

**Use Case:** Find active students named John who need follow-up → Filter Active + Search "john"

---

## Sorting Students

### Available Sort Fields

| Field | Behavior | Use Case |
|-------|----------|----------|
| **Name** (A-Z) | Alphabetical by first/last name | Find students quickly |
| **Name** (Z-A) | Reverse alphabetical | Reverse lookup |
| **Progress** (Low-High) | By completion percentage | Identify beginners |
| **Progress** (High-Low) | By completion percentage | Identify advanced students |
| **Last Activity** (Newest) | Most recent activity first | Find engaged students |
| **Last Activity** (Oldest) | Least recent activity first | Identify disengaged students |
| **Status** (A-Z) | Alphabetical by status | Group by enrollment status |

### How to Sort

1. **Click column header** to toggle sort direction
2. **Sort indicator** (↑/↓) shows active sort field and direction
3. **Inactive columns** show a neutral sort icon

### Sort Examples

**Find Most Active Students:**
1. Click "Last Activity" column header twice
2. Most recently active students appear at top
3. Identify highly engaged learners

**Find Students Needing Help:**
1. Click "Progress" column header twice (to sort Low→High)
2. Students with lowest completion percentage appear first
3. Review and consider intervention strategies

**Alphabetical Organization:**
1. Click "Name" column header once (ascending)
2. Students listed alphabetically by first name
3. Easy reference for roster management

---

## Viewing Student Details

### Accessing Student Detail View

**Method 1: Click Student Row**
1. Click anywhere on a student's row in the roster table
2. Detail panel opens (slides in from side on desktop, modal on mobile)

**Method 2: Click "View" Button**
1. Hover over a student row
2. Click "View Details" or arrow button
3. Opens detailed student profile

### Student Detail Panel

The detail panel displays comprehensive information about an individual student:

```
┌────────────────────────────────┐
│ John Smith                     │
│ john@example.com               │
│ Enrolled: March 1, 2025        │
│ Status: Active                 │
└────────────────────────────────┘

Progress Metrics:
├─ Overall Progress: 75% (15/20 lessons)
├─ Time Spent: 12.5 hours
├─ Engagement Score: 82/100
└─ Last Activity: Today at 2:30 PM

Recent Activity:
├─ Lesson 5: Advanced Techniques (Viewed)
├─ Lesson 4: Core Concepts (Completed)
└─ Lesson 3: Getting Started (Completed)

Key Actions:
├─ Send Message
├─ View Progress Chart
├─ Export Student Data
└─ Back to Roster
```

### Information Displayed

#### Personal Information
- **Name**: Student's full name
- **Email**: Contact email address
- **Enrolled Date**: When student joined the cohort
- **Status**: Current enrollment status

#### Progress Information
- **Completion %**: Percentage of lessons completed (0-100%)
- **Lessons Completed**: Number of completed lessons vs. total
- **Time Spent**: Hours spent in the course
- **Engagement Score**: Composite score (0-100) based on:
  - Activity frequency
  - Lesson completion rate
  - Discussion participation
  - Time spent on content

#### Activity History
- **Recent Activities**: Last 10 activities with timestamps
- **Activity Types**: Viewed, Completed, Paused, etc.
- **Timestamps**: Exact date and time of each activity

### Closing Detail View

**On Desktop:**
- Click the back arrow or "Back" button
- Click outside the panel
- Press ESC key

**On Mobile:**
- Tap the X button
- Swipe left to dismiss
- Tap "Back to Roster"

---

## Exporting Data

### CSV Export Feature

Export your roster data for use in spreadsheets, reports, or analysis tools.

### How to Export

1. **Navigate to Roster** - Ensure you're viewing the cohort roster
2. **Click Export Button** - Look for "Export CSV" or download icon
3. **Select Format** - Choose CSV format
4. **Download** - File downloads to your computer

### Exported Data Includes

```csv
Name,Email,Status,Progress %,Completed Lessons,Last Activity,Engagement Score,Enrolled Date
John Smith,john@example.com,Active,75,15,Today,82,2025-03-01
Sarah Johnson,sarah@example.com,Active,45,9,2 days ago,68,2025-03-05
```

### Columns in Export

| Column | Format | Example |
|--------|--------|---------|
| student_name | Text | John Smith |
| email | Email | john@example.com |
| enrolled_date | ISO Date | 2025-03-01 |
| status | Text | Active |
| completed_lessons | Number | 15 |
| total_lessons | Number | 20 |
| completion_percentage | Percentage | 75 |
| time_spent_hours | Decimal | 12.5 |
| last_activity_date | ISO Date | 2025-03-15 |
| days_since_activity | Number | 0 |
| engagement_score | Number (0-100) | 82 |

### Using Exported Data

**In Microsoft Excel:**
1. Open downloaded CSV file
2. Data imports into columns automatically
3. Create charts and pivot tables
4. Filter and sort as needed

**In Google Sheets:**
1. Open Google Sheets
2. Click File → Import
3. Upload CSV file
4. Use built-in analytics and sharing

**In Your LMS/Analytics Tool:**
1. Check tool's import documentation
2. Use CSV format
3. Map columns to your system

---

## Best Practices

### 1. Regular Monitoring

**Daily Routine:**
- Check for students with no recent activity (>3 days)
- Review students with <50% progress
- Identify students with low engagement scores (<40)

**Weekly Review:**
- Export full roster for record-keeping
- Analyze overall cohort progress trends
- Identify patterns in student engagement

### 2. Effective Filtering Strategy

**Identify At-Risk Students:**
```
Status Filter: Active
Sort By: Last Activity (oldest first)
```
This shows engaged students who haven't logged in recently—potential at-risk students.

**Find Success Stories:**
```
Status Filter: Completed
Sort By: Last Activity (newest first)
```
See students who recently completed—candidates for advanced content or peer mentoring.

**Support Struggling Learners:**
```
Status Filter: Active
Sort By: Progress (lowest first)
```
Students with lowest completion need additional support or adjustments.

### 3. Intervention Workflow

1. **Identify** → Use roster filters to find at-risk students
2. **Analyze** → Click on student details to understand their situation
3. **Act** → Reach out, provide resources, or adjust pacing
4. **Track** → Monitor progress after intervention
5. **Document** → Export data to track outcomes

### 4. Communication

Use roster insights to inform conversations with students:

**For Low-Progress Students:**
"I noticed you've completed 5 out of 20 lessons. Would you like support with the next lesson?"

**For Recently Active Students:**
"Great to see you active in the course! You're on track to complete it by April."

**For Disengaged Students:**
"We haven't seen activity from you in a week. How can we support you to get back on track?"

### 5. Data Privacy

- Never share exported CSV files with unauthorized recipients
- Remove unnecessary contact information before sharing reports
- Follow your organization's data retention policies
- Comply with FERPA/GDPR regulations if applicable

---

## Pagination

### Understanding Pagination

The roster displays 50 students per page to maintain performance. Use pagination controls to navigate.

**Pagination Controls:**
- **Page counter**: "Page X of Y"
- **Previous button**: Go to previous page (disabled on page 1)
- **Next button**: Go to next page (disabled on last page)

### Navigation Tips

- Filters and searches apply across all pages
- Sorting applies across all pages
- Current page resets when applying new filters
- Bookmark/save specific page views in your browser

---

## Troubleshooting

### Common Issues

#### Issue: "No students match your filters"
**Causes:**
- Search term doesn't exist in roster
- All matching students have been dropped
- Filter combination is too restrictive

**Solutions:**
- Clear search and try again
- Check Status Filter setting
- Remove search to see all students
- Adjust filter criteria

**Example:**
```
If searching for "Jane" with "Completed" status selected:
- Try removing Status filter first
- Search for "Jane" across all statuses
- Then reapply filter if needed
```

#### Issue: Student data shows as outdated
**Causes:**
- Page hasn't refreshed recently
- Student activity updated after page loaded
- Browser cache showing old data

**Solutions:**
1. Click Refresh button in navigation bar
2. Press F5 or Ctrl+R to force refresh
3. Close and reopen the roster page
4. Clear browser cache (Settings → Clear Browsing Data)

#### Issue: CSV export file is empty
**Causes:**
- No students in current filter selection
- Export process didn't complete
- Browser blocked the download

**Solutions:**
1. Ensure you have students in roster
2. Try export again
3. Check browser's download settings
4. Try a different browser if problem persists

#### Issue: Search not finding students
**Causes:**
- Exact spelling required
- Student has special characters in name
- Email format different than expected

**Solutions:**
1. Use partial matches (try "john" not "jonathan")
2. Search by email if name search fails
3. Use copy-paste to avoid typos
4. Check student's actual name in system

#### Issue: Progress percentages seem incorrect
**Causes:**
- Lessons still being marked/graded
- Automatic progress updates delayed
- Browser cache showing old percentages

**Solutions:**
1. Refresh the page
2. Wait a few minutes for updates
3. Clear cache and reload
4. Contact support if discrepancy persists

### Getting Help

If you encounter issues not covered here:

1. **Check Help Section** - Look for Help icon in roster interface
2. **Contact Support** - Email support@c4c.org or use in-app chat
3. **Review Documentation** - See teacher-training materials for additional guidance
4. **Report Bug** - Include:
   - Screenshot of issue
   - Steps to reproduce
   - Student/cohort affected
   - Your browser and device

---

## Key Statistics & Metrics

### What the Progress Percentage Means

- **0-25%**: Just starting, still in early lessons
- **25-50%**: Making progress, approximately halfway through
- **50-75%**: Well underway, approaching completion
- **75-100%**: Nearly done or completed

### Interpreting Engagement Scores

The engagement score (0-100) represents overall course participation:

- **80-100**: Highly engaged, frequent activity, consistent progress
- **60-79**: Well engaged, regular activity with occasional gaps
- **40-59**: Moderately engaged, inconsistent participation
- **20-39**: Minimally engaged, rare activity
- **0-19**: Not engaged, little to no activity

### Last Activity Interpretation

- **Today**: Student has logged in today - very engaged
- **1-2 days ago**: Regular activity - good engagement
- **3-7 days ago**: Some activity but gaps emerging
- **1-4 weeks ago**: Significant absence, may need outreach
- **1+ months ago**: High risk, recommend intervention

---

## Advanced Features

### Segment Analysis

Use combined filters to create student segments:

**High Performers:**
```
Filter: Active | Sort: Progress (High→Low)
→ Top 10% of class for peer mentoring/leadership roles
```

**At-Risk Cohort:**
```
Filter: Active | Sort: Last Activity (Old→New) | Search: recent droppers
→ Students needing immediate intervention
```

**Completion Trackers:**
```
Filter: Completed | Sort: Last Activity (New→Old)
→ Recent completers to celebrate and survey for feedback
```

### Regular Reporting

**Weekly Report Workflow:**
1. Monday: Export full roster
2. Tuesday: Run analysis on progress
3. Wednesday: Identify students needing support
4. Thursday: Implement interventions
5. Friday: Track and document outcomes

**Monthly Report Workflow:**
1. Export roster
2. Calculate average engagement score
3. Track completion rate trends
4. Document interventions and outcomes
5. Share insights with stakeholders

---

## Related Documentation

- [Progress Dashboard Guide](./progress-dashboard.md) - Comprehensive analytics for cohorts
- [Identifying Struggling Students Guide](./identifying-struggling-students.md) - Intervention strategies
- [Teacher Training Materials](../training/teacher-training.md) - Comprehensive training
- [API Documentation](../api/roster-api.md) - For developers

---

## Support & Feedback

Have suggestions for the roster feature? We'd love to hear from you!

- Email: support@c4c.org
- In-app feedback: Help → Send Feedback
- Community forum: forum.c4c.org/roster-feature

---

**Last Updated:** March 2025
**Version:** 1.0
**Maintenance:** Reviewed quarterly

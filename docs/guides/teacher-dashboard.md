# Teacher Dashboard Guide

**Last Updated:** October 29, 2025
**Version:** 1.0.0
**Audience:** Course Instructors & Teaching Assistants

---

## Table of Contents

1. [Overview](#overview)
2. [Accessing the Dashboard](#accessing-the-dashboard)
3. [Viewing Student Roster](#viewing-student-roster)
4. [Interpreting Progress Metrics](#interpreting-progress-metrics)
5. [Identifying Struggling Students](#identifying-struggling-students)
6. [Taking Action](#taking-action)
7. [Best Practices](#best-practices)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## Overview

The Teacher Dashboard is your central hub for monitoring student progress, engagement, and performance across all your cohorts. It provides real-time insights to help you:

- Track individual and cohort-wide progress
- Identify students who need additional support
- Monitor engagement through discussion participation
- View activity patterns and learning trends
- Export data for reporting and analysis

### Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Student Roster** | View all enrolled students with progress metrics | Quick overview of class performance |
| **Progress Tracking** | See completion percentages and lesson counts | Identify who's on track vs. falling behind |
| **Engagement Metrics** | Track discussion posts and forum participation | Spot disengaged students early |
| **Activity Timeline** | Last active timestamps for each student | Find inactive students needing outreach |
| **Cohort Rankings** | See top performers and strugglers | Facilitate peer tutoring opportunities |
| **Export Tools** | Download roster as CSV | Share with admins or import to other tools |

---

## Accessing the Dashboard

### Step 1: Log in as a Teacher

1. Navigate to [https://c4c-campus.vercel.app/login](https://c4c-campus.vercel.app/login)
2. Sign in with your teacher account credentials
3. You'll be redirected to the Teacher Dashboard automatically

**Note:** If you see the student dashboard instead, contact an administrator to update your role in the system.

### Step 2: Navigate to Course Management

```
Dashboard → Teacher Courses → Select a Course → Students Tab
```

![Teacher Dashboard Navigation](../diagrams/teacher-dashboard-nav.png)

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  C4C Campus - Teacher Dashboard                          │
├──────────────────────────────────────────────────────────┤
│  📚 My Courses        [+ Create New Course]              │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ n8n Fundamentals                                   │  │
│  │ ─────────────────────────────────────────────────  │  │
│  │ Overview | Content | Students | Discussions       │  │
│  │                                                    │  │
│  │ [Students Tab Content Shown Below]                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Viewing Student Roster

### Accessing the Roster

1. Click on your course from the "My Courses" list
2. Select the **"Students"** tab
3. Choose a cohort from the dropdown (if course has multiple cohorts)

### Roster Table Layout

The roster displays students in a sortable table with the following columns:

| Column | What It Shows | How to Use It |
|--------|---------------|---------------|
| **Rank** | Student's position in cohort (🥇🥈🥉) | Identify top performers |
| **Student** | Name and email | Contact students directly |
| **Progress** | Visual bar + percentage | See completion status at a glance |
| **Engagement** | Discussion & forum post counts | Spot participation levels |
| **Last Active** | Timestamp of last lesson interaction | Find inactive students |

**Example Roster:**

```
┌──────┬─────────────────────┬───────────────┬──────────────┬─────────────┐
│ Rank │ Student             │ Progress      │ Engagement   │ Last Active │
├──────┼─────────────────────┼───────────────┼──────────────┼─────────────┤
│ 🥇 1 │ Alice Johnson       │ ████████░ 85% │ 💬 12 📝 3   │ 2 hours ago │
│      │ alice@example.com   │ 17/20 lessons │              │             │
├──────┼─────────────────────┼───────────────┼──────────────┼─────────────┤
│ 🥈 2 │ Bob Smith           │ ████████░ 80% │ 💬 8 📝 1    │ 5 hours ago │
│      │ bob@example.com     │ 16/20 lessons │              │             │
├──────┼─────────────────────┼───────────────┼──────────────┼─────────────┤
│ 🥉 3 │ Carol White         │ ███████░░ 75% │ 💬 15 📝 5   │ 1 day ago   │
│      │ carol@example.com   │ 15/20 lessons │              │             │
├──────┼─────────────────────┼───────────────┼──────────────┼─────────────┤
│ #4   │ David Lee           │ ██████░░░ 60% │ 💬 3 📝 0    │ 3 days ago  │
│      │ david@example.com   │ 12/20 lessons │              │             │
├──────┼─────────────────────┼───────────────┼──────────────┼─────────────┤
│ #5   │ Eve Martinez        │ ███░░░░░░ 30% │ 💬 1 📝 0    │ 7 days ago  │
│      │ eve@example.com     │ 6/20 lessons  │              │             │
└──────┴─────────────────────┴───────────────┴──────────────┴─────────────┘
```

### Cohort Statistics Panel

Above the roster table, you'll see aggregate metrics:

```
┌─────────────────────────────────────────────────────────────┐
│  Cohort Statistics - Fall 2025 n8n Fundamentals             │
├─────────────────────────────────────────────────────────────┤
│  📊 Average Progress      👥 Active Students    ✅ Completed │
│       68%                      45/50                 8       │
│                                                              │
│  ⚠️  At Risk Students     📈 Engagement Rate    🕐 Avg Time  │
│       12                       82%                  6.5 hrs  │
└─────────────────────────────────────────────────────────────┘
```

**Metric Definitions:**
- **Average Progress**: Mean completion percentage across all students
- **Active Students**: Students with activity in last 7 days
- **Completed**: Students who finished all lessons
- **At Risk**: Students with <40% progress or no activity in 7+ days
- **Engagement Rate**: Percentage of students posting in discussions
- **Avg Time**: Average time spent watching videos per student

### Sorting and Filtering

**Sort Options:**
Click column headers to sort:
- **Rank**: Default (high to low)
- **Name**: Alphabetical (A-Z)
- **Progress**: Percentage (high to low)
- **Last Active**: Most recent first

**Filter Options:**
Use the filter bar above the roster:
- **Status**: Active, Completed, Paused, Dropped
- **Progress**: <25%, 25-50%, 50-75%, 75-100%
- **Activity**: Active (7 days), Inactive (7+ days), Dormant (30+ days)
- **Engagement**: High (10+ posts), Medium (3-9 posts), Low (0-2 posts)

**Example Filter:**
```
[Status: Active ▼] [Progress: <50% ▼] [Activity: Inactive ▼] [Apply Filters]
```
**Result:** Shows students who are enrolled but falling behind and haven't been active recently — your intervention priority list!

### Search

Use the search box to find specific students:
```
[🔍 Search by name or email...]
```

**Tips:**
- Search is case-insensitive
- Supports partial matches (searching "ali" finds "Alice")
- Searches both name and email fields

---

## Interpreting Progress Metrics

### Progress Percentage

**What it means:**
```
Progress % = (Completed Lessons / Total Lessons) × 100
```

**Color Coding:**
- 🟢 **Green (75-100%)**: On track, excelling
- 🟡 **Yellow (50-74%)**: Making progress, but could accelerate
- 🟠 **Orange (25-49%)**: Falling behind, needs encouragement
- 🔴 **Red (0-24%)**: At risk, requires immediate intervention

**Example Interpretation:**

| Student | Progress | Interpretation | Action |
|---------|----------|----------------|--------|
| Alice | 85% (17/20) | Ahead of schedule, likely to complete | Encourage to help peers |
| Bob | 60% (12/20) | Mid-cohort, on pace for standard timeline | Monitor, praise progress |
| Eve | 20% (4/20) | Significantly behind, may drop out | Reach out ASAP, offer support |

### Cohort Rank

**How it's calculated:**
1. Primary: Progress percentage (higher = better rank)
2. Tie-breaker: Total time spent (more engaged = better)
3. Tie-breaker: Enrollment date (earlier = better)

**What it tells you:**
- **Top 10%**: High achievers, potential peer tutors
- **Middle 80%**: Standard learners, bulk of cohort
- **Bottom 10%**: Struggling, need extra attention

**Using Ranks:**
```
Rank #1-5 (Top 10%):
  → Invite to be peer tutors
  → Ask for course feedback
  → Nominate for scholarships

Rank #45-50 (Bottom 10%):
  → Schedule 1-on-1 check-ins
  → Offer additional resources
  → Identify blockers (time, tech, motivation)
```

### Engagement Metrics

**Discussion Posts (💬):**
- Questions asked in lesson comment sections
- Replies to other students' questions
- Peer help provided

**Forum Posts (📝):**
- Topics created in course forum
- General course discussions
- Off-topic community building

**Interpretation:**

| Posts | Level | What It Means |
|-------|-------|---------------|
| 0-2 | 🔴 Low | Passive learner, may be shy or disengaged |
| 3-9 | 🟡 Medium | Normal engagement, participating when needed |
| 10+ | 🟢 High | Active community member, likely to succeed |

**Important Notes:**
- Some students learn silently (lurkers) — low posts ≠ bad student
- Quality > quantity (one great answer beats 10 "me too" posts)
- Cross-reference with progress: high progress + low posts = independent learner

### Last Activity

**What it tracks:**
The most recent timestamp when the student:
- Watched any lesson video
- Updated video position (progress saved)
- Completed a lesson

**Does NOT track:**
- Logging in without watching videos
- Browsing course materials
- Reading discussions (without posting)

**Interpretation:**

| Last Active | Status | Action |
|-------------|--------|--------|
| < 24 hours | 🟢 Active | No action needed |
| 1-3 days | 🟡 Normal | Monitor, expected gaps between sessions |
| 4-7 days | 🟠 Slipping | Send friendly reminder email |
| 8-14 days | 🔴 Inactive | Reach out personally, check if okay |
| 15+ days | ⚫ Dormant | Consider pausing enrollment, offer to re-enroll later |

---

## Identifying Struggling Students

### At-Risk Indicators

A student may be struggling if they exhibit **2 or more** of these patterns:

1. ⚠️ **Low Progress**: <40% completion
2. ⚠️ **Inactive**: No activity in 7+ days
3. ⚠️ **Low Engagement**: 0-2 discussion posts total
4. ⚠️ **Declining Trend**: Progress stagnant for 2+ weeks
5. ⚠️ **Rapid Drop-off**: Started strong (>50%) but now inactive

### Automated At-Risk Flagging

The dashboard automatically highlights at-risk students:

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  AT-RISK STUDENTS (Require Immediate Attention)       │
├──────────────────────────────────────────────────────────┤
│ #45 Eve Martinez     30% │ Last active: 7 days ago      │
│     eve@example.com       │ 0 discussions, low engagement│
│     [Send Email] [View Details]                          │
├──────────────────────────────────────────────────────────┤
│ #48 Frank Chen       25% │ Last active: 12 days ago     │
│     frank@example.com     │ Started strong, now inactive │
│     [Send Email] [View Details]                          │
└──────────────────────────────────────────────────────────┘
```

### Case Studies

#### Case 1: The Fast Starter Who Faded

**Profile:**
- Week 1: 40% complete, top 5 rank
- Week 2-3: No activity, stuck at 40%
- Engagement: 8 posts in week 1, 0 since

**Likely Cause:** Life event, lost motivation, technical issue

**Recommended Action:**
1. Send personal email: "Hey [Name], noticed you started strong but haven't seen you in 2 weeks. Everything okay?"
2. Offer 1-on-1 video call to troubleshoot
3. Ask if they need a cohort pause/transfer

#### Case 2: The Silent Struggler

**Profile:**
- Week 1-4: Steady but slow progress (5% per week)
- Current: 20% complete, rank #50
- Engagement: 0 posts, never asked for help

**Likely Cause:** Stuck on concept, too shy to ask, language barrier

**Recommended Action:**
1. Proactively reach out: "I'm here to help! What lesson are you currently working on?"
2. Schedule office hours
3. Pair with peer tutor
4. Provide supplementary materials (written guides for video content)

#### Case 3: The Ghost

**Profile:**
- Enrolled 4 weeks ago
- Progress: 0%
- Last active: Never (enrollment date only)
- Engagement: 0

**Likely Cause:** Changed mind, technical access issue, applied by mistake

**Recommended Action:**
1. Send welcome email with getting started guide
2. Check if account is verified (email confirmation)
3. If no response in 1 week, mark as "dropped" to keep roster clean

---

## Taking Action

### Intervention Strategies

#### Level 1: Automated Nudges (Built-in)

The platform automatically sends:
- **Day 7 Inactive**: "We miss you! Here's where you left off..."
- **50% Milestone**: "You're halfway there! Keep going!"
- **Week Before Deadline**: "Module unlocks in 7 days, catch up now"

**No teacher action required** — these run automatically.

#### Level 2: Personal Outreach

**When:** Student is at-risk (see indicators above)

**How:**
1. Click **[Send Email]** button in at-risk panel
2. Use template or write custom message
3. CC yourself to track follow-ups

**Email Template:**
```
Subject: Checking in on your progress in [Course Name]

Hi [Student Name],

I noticed you haven't been active in the course recently, and I wanted to check in. You started with great momentum, and I'd love to help you get back on track!

Here's where you're at:
- Progress: [X]% ([Y]/[Z] lessons completed)
- Last lesson: [Lesson Name]
- Next up: [Next Lesson Name]

Is there anything blocking your progress? Common challenges include:
- Time management (we can adjust your schedule)
- Technical difficulties (I can help troubleshoot)
- Course content confusion (let's set up a call)
- Personal circumstances (we can pause your enrollment)

I'm here to support you! Reply to this email or schedule a quick call: [Calendar Link]

Looking forward to seeing you back in class!

Best,
[Your Name]
[Course Instructor]
```

#### Level 3: Synchronous Support

**When:** Student is 2+ weeks inactive or explicitly requests help

**Options:**
1. **Office Hours**: Weekly Zoom sessions for Q&A
2. **1-on-1 Calls**: 15-30 min private troubleshooting
3. **Peer Tutoring**: Pair with top-performing student
4. **Group Study Sessions**: Facilitate student-led meetups

**Scheduling:**
Use Calendly/Google Calendar to let students self-book:
```
[📅 Book Office Hours] → Redirect to: calendly.com/teacher/office-hours
```

### Encouraging High Performers

Don't forget to recognize achievements!

**Actions for Top 10%:**
1. **Public Recognition**: Highlight in course announcements
2. **Peer Tutor Invitation**: Ask them to help struggling students
3. **Advanced Content**: Offer bonus lessons or challenges
4. **Recommendation Letters**: For job/internship applications
5. **Scholarship Nominations**: C4C fellowships, bootcamp slots

**Email Template:**
```
Subject: Amazing progress in [Course Name]! 🎉

Hi [Student Name],

I wanted to personally congratulate you on your outstanding progress! You're currently ranked #[Rank] in the cohort with [X]% completion.

Your active participation in discussions ([Y] posts) has been incredibly valuable to your peers. Students like you make teaching rewarding!

I'd love to invite you to:
- Become a peer tutor (help 1-2 struggling students)
- Join advanced office hours (deeper dives into complex topics)
- Be featured in our student spotlight (optional)

Keep up the amazing work!

Best,
[Your Name]
```

---

## Best Practices

### Daily Routine (5-10 minutes)

**Morning Check:**
```
1. Open Teacher Dashboard
2. Check "At-Risk Students" panel
3. Send 1-2 encouragement emails
4. Review new discussion posts
5. Reply to urgent questions
```

**Weekly Review (30 minutes):**
```
1. Export roster to CSV
2. Analyze trends (avg progress, activity)
3. Identify patterns (do students drop off after Module 2?)
4. Adjust course pacing if needed
5. Plan interventions for struggling students
```

### Data-Driven Course Improvements

Use roster insights to improve your course:

**Drop-off Analysis:**
```sql
-- Find lessons where students quit
SELECT l.name AS lesson_name, COUNT(*) AS students_stuck
FROM lesson_progress lp
JOIN lessons l ON l.id = lp.lesson_id
WHERE lp.completed = false
GROUP BY l.name
ORDER BY students_stuck DESC
LIMIT 5;
```

**Example Result:**
```
Lesson Name                 | Students Stuck
----------------------------+---------------
"Advanced Loops"            | 12
"Debugging Workflows"       | 9
"API Authentication"        | 8
```

**Action:** These lessons may be too hard — add extra resources, simplify, or add prerequisite lessons.

### Privacy and Ethics

**Do:**
- ✅ Use data to support students
- ✅ Keep progress data confidential
- ✅ Reach out privately (never public shame)
- ✅ Celebrate achievements (with permission)

**Don't:**
- ❌ Share student progress with other students
- ❌ Use rankings to create competition (unless opt-in gamification)
- ❌ Pressure students to match top performers
- ❌ Make assumptions about why students struggle

**Example of Good Practice:**
```
❌ Bad:  "Eve, you're ranked last. Bob finished in 2 weeks, why can't you?"
✅ Good: "Eve, I see you're at 30%. What can I do to help you succeed?"
```

---

## Frequently Asked Questions

### General

**Q: How often is the roster data updated?**
A: Progress updates save every 10 seconds during video playback. The roster view refreshes every 5 minutes. For real-time data, click the "Refresh" button.

**Q: Can I view students from past cohorts?**
A: Yes! Use the cohort dropdown and select "Archived Cohorts" to see historical data.

**Q: What happens if a student transfers cohorts?**
A: Their progress carries over. The roster will show them in the new cohort with their existing completion percentage.

### Progress Metrics

**Q: Why does a student show 100% but status is "active" not "completed"?**
A: "Completed" status is manually set when the student finishes final assessments or receives a certificate. 100% progress means all lessons watched.

**Q: Can progress go down?**
A: No. Once a lesson is marked complete, it stays complete even if the student re-watches it.

**Q: A student says they watched a lesson but it shows incomplete. Why?**
A: Possible causes:
1. They didn't watch to 95% (our completion threshold)
2. Browser crash before auto-save
3. Ad blocker interfering with tracking
4. They watched while logged out

**Solution:** Teachers can manually mark lessons complete via the student detail view.

### Engagement

**Q: How are discussion posts counted?**
A: Every unique comment or reply counts as 1 post. Edits to existing posts don't increment the counter.

**Q: Do discussion posts affect grades?**
A: No, the C4C platform doesn't have grades. Posts are for engagement insights only.

**Q: Can I see WHAT students posted, not just the count?**
A: Yes! Click a student's name → "Discussion History" tab to see all their posts.

### Performance

**Q: The roster is slow to load with 500 students. How do I fix this?**
A: Use pagination (50 students per page) and filters to narrow results. If still slow, contact support — the materialized view may need a manual refresh.

**Q: Can I export the full roster?**
A: Yes, click "Export to CSV" to download all data regardless of pagination.

### Privacy

**Q: Can students see the roster or their rank?**
A: No. Roster and rankings are teacher-only. Students only see their own progress.

**Q: Can other teachers see my cohort's roster?**
A: No, unless you explicitly share course teaching duties (co-teacher feature).

**Q: Is student data GDPR compliant?**
A: Yes. Students can request data deletion via the account settings. See [Privacy Policy](../security/privacy-policy.md).

---

## Quick Reference

### Color Codes

| Color | Progress | Engagement | Activity |
|-------|----------|------------|----------|
| 🟢 Green | 75-100% | 10+ posts | <24 hrs |
| 🟡 Yellow | 50-74% | 3-9 posts | 1-3 days |
| 🟠 Orange | 25-49% | 1-2 posts | 4-7 days |
| 🔴 Red | 0-24% | 0 posts | 8+ days |

### Intervention Triggers

| Trigger | Action | Timeline |
|---------|--------|----------|
| 7 days inactive | Automated reminder email | Immediate |
| <40% progress + 7 days inactive | Teacher personal outreach | Within 24 hours |
| 14 days inactive | Offer cohort pause/transfer | Within 48 hours |
| 30 days inactive | Mark as dropped (reversible) | End of month |

### Support Resources

- **Technical Issues**: [Platform Status](https://status.c4c-campus.com)
- **Student Support Guides**: [Help Center](https://help.c4c-campus.com)
- **Teacher Community**: [Slack Channel](https://c4c.slack.com/teachers)
- **Bug Reports**: support@c4c-campus.com

---

**Document Version:** 1.0.0
**Last Updated:** October 29, 2025
**Maintained By:** C4C Platform Team
**Feedback:** teachers@c4c-campus.com

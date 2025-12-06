# Progress Dashboard Guide

## Table of Contents
1. [Overview](#overview)
2. [Accessing the Dashboard](#accessing-the-dashboard)
3. [Dashboard Components](#dashboard-components)
4. [Analytics & Metrics](#analytics--metrics)
5. [Using the Cohort Selector](#using-the-cohort-selector)
6. [Key Charts & Visualizations](#key-charts--visualizations)
7. [Struggling Students Alert](#struggling-students-alert)
8. [Leaderboard Feature](#leaderboard-feature)
9. [Data Export & Reporting](#data-export--reporting)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Progress Dashboard provides comprehensive analytics for tracking cohort-wide learning outcomes. It aggregates student data to identify trends, highlight at-risk students, and celebrate top performers—enabling data-driven decisions about instructional support.

### Key Features
- **Real-time cohort analytics**: Overview of overall cohort progress
- **Progress visualization**: Charts showing completion trends over time
- **Struggling student alerts**: Automatic identification of at-risk learners
- **Performance leaderboard**: Recognition of high-achieving students
- **Auto-refresh**: Data updates every 5 minutes automatically
- **CSV export**: Download student data for further analysis
- **Multi-cohort support**: Switch between different cohorts instantly

### Dashboard Updates
- Automatic refresh every 5 minutes
- Manual refresh available on demand
- Last updated timestamp always visible
- Real-time student activity tracking

---

## Accessing the Dashboard

### For Teachers

**Step 1: Log In**
- Navigate to C4C Campus login page
- Enter your email and password
- Click "Sign In"

**Step 2: Navigate to Progress Dashboard**
- From Teacher Dashboard, click "Progress Dashboard" button
- OR navigate directly to `/teacher/progress`

**Step 3: Select Cohort**
- Use cohort selector dropdown at top
- Choose the cohort you want to analyze
- Dashboard loads automatically

### For Admins
- Same navigation as teachers
- Access to all cohorts in the system

### Direct URL
```
https://c4c.org/teacher/progress?cohort_id={cohort_id}
```

---

## Dashboard Components

### 1. Header Section

```
┌─────────────────────────────────────────────────────────────┐
│ Progress Dashboard                                          │
│ Track student progress and engagement                       │
├─────────────────────────────────────────────────────────────┤
│ Select Cohort: [Spring 2025 Cohort ▼]  Last updated: 2:30 PM │
│ [Refresh] [Export CSV] [Back to Dashboard] [Sign Out]      │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Title**: "Progress Dashboard"
- **Subtitle**: Describes dashboard purpose
- **Cohort Selector**: Choose which cohort to analyze
- **Last Updated**: Shows when data was last refreshed
- **Refresh Button**: Manually refresh data
- **Export Button**: Download CSV of cohort progress
- **Navigation**: Back to teacher dashboard and logout

### 2. Statistics Cards

Quick overview of key metrics for the selected cohort:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📚 Avg       │ ✅ Completion│ 👥 Total     │ 📝 At-Risk   │
│ Progress     │ Rate         │ Students     │ Students     │
│ 62%          │ 35%          │ 48           │ 12           │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Metrics:**

| Card | Metric | What It Means |
|------|--------|--------------|
| **Avg Progress** | Average lesson completion across all students | Overall cohort advancement |
| **Completion Rate** | % of students who have finished the course | Course success metric |
| **Total Students** | Number of enrolled students | Cohort size |
| **At-Risk Students** | Students with <50% progress or no activity >7 days | Intervention targets |

### 3. Progress Over Time Chart

Visual representation of cohort progress trends.

```
Progress Over Time (Last 30 Days)
│
│     ╱╲    ╱╲
│    ╱  ╲  ╱  ╲     (Progress climbing over time)
│   ╱    ╲╱    ╲
│  ╱             ╲
└─┴─┴─┴─┴─┴─┴─┴─┴─→ Days
```

**Information Displayed:**
- Y-axis: Average completion percentage (0-100%)
- X-axis: Timeline (last 30 days)
- Blue line: Cohort average progress
- Green area: Progress increases (positive trend)
- Red area: Progress decreases (concerning trend)

**Interpretation:**
- **Upward trend**: Students progressing at healthy pace
- **Flat line**: Stalled progress, may need intervention
- **Downward trend**: Students falling behind (rare)
- **Steep climb**: Cohort accelerating through content

### 4. Progress Distribution Chart

Shows how students are distributed across progress levels.

```
Progress Distribution
100% ┤
     ├─
80%  ├─    ┌─┐
     ├─    │ │     ┌─┐
60%  ├─ ┌─┐│ │ ┌─┐│ │
     ├─ │ ││ │ │ │ │ │ ┌─┐
40%  ├─ │ ││ │ │ │ │ │ │ │
     ├─ │ ││ │ │ │ │ │ │ │
20%  ├─ │ ││ │ │ │ │ │ │ │
     ├─ │ ││ │ │ │ │ │ │ │ ┌─┐
  0% └─ └─┘└─┘ └─┘ └─┘ └─┘ └─┘
     0% 20% 40% 60% 80% 100%
     Progress Buckets
```

**What It Shows:**
- Horizontal bars for each progress range
- Number of students in each bracket
- Colors indicate engagement:
  - Red: 0-25% (needs help)
  - Yellow: 25-50% (at-risk)
  - Blue: 50-75% (on track)
  - Green: 75-100% (strong progress)

---

## Analytics & Metrics

### Understanding Key Metrics

#### Average Progress
**Definition**: Mean of all students' completion percentages

**Formula**:
```
(Sum of all student progress %) / Total students
```

**Example**:
```
Student A: 80%
Student B: 60%
Student C: 40%
Average: (80+60+40)/3 = 60%
```

**Use Case**: Overall cohort health indicator

#### Completion Rate
**Definition**: Percentage of students who finished the course (100%)

**Formula**:
```
(Students with 100% progress / Total students) × 100
```

**Example**:
```
Total students: 48
Completed: 17
Completion rate: (17/48) × 100 = 35%
```

**Use Case**: Success metric for the cohort

#### Engagement Score
**Definition**: Composite score (0-100) based on activity patterns

**Components**:
- Activity frequency (40%): How often students log in
- Content completion (35%): Lesson completion rate
- Discussion participation (15%): Forum/discussion posts
- Time spent (10%): Hours engaged with content

**Interpretation**:
- 80-100: Highly engaged
- 60-79: Well engaged
- 40-59: Moderate engagement
- 20-39: Low engagement
- 0-19: Minimal engagement

#### Days Since Last Activity
**Definition**: Time elapsed since student's most recent interaction

**Examples**:
- 0 days: Active today
- 2 days: Last active 2 days ago
- 14 days: No activity for 2 weeks
- 45+ days: Over 6 weeks without activity

**Risk Levels**:
- 0-3 days: Green (healthy)
- 4-7 days: Yellow (monitor)
- 8-21 days: Orange (at-risk)
- 22+ days: Red (intervention needed)

---

## Using the Cohort Selector

### Selecting a Different Cohort

**Step 1: Locate Selector**
- Look for dropdown labeled "Select Cohort"
- Located at top of dashboard

**Step 2: Click to Open**
```
Select Cohort: [Spring 2025 - n8n Basics ▼]
```

**Step 3: Choose Cohort**
```
┌────────────────────────────────────────┐
│ Select a cohort...                     │
├────────────────────────────────────────┤
│ Spring 2025 - n8n Basics               │
│ Summer 2025 - Advanced Automation      │
│ Fall 2025 - Climate Data Analysis      │
└────────────────────────────────────────┘
```

**Step 4: Dashboard Loads**
- Analytics update for new cohort
- All charts refresh with new data
- Students and metrics change accordingly

### Cohort Information

Each cohort listing includes:
- **Cohort Name**: e.g., "Spring 2025 Cohort"
- **Course Name**: e.g., "n8n Workflow Automation"
- **Student Count**: Number of enrolled students
- **Status**: (upcoming/active/completed)

### Quick Switch
If switching between two cohorts frequently:
1. Note the cohort name
2. Bookmark the specific dashboard URL
3. Switch back via bookmark instead of dropdown

---

## Key Charts & Visualizations

### Progress Over Time Chart

**Purpose**: Monitor cohort progress trajectory

**How to Read It**:
- **Steeper upward slope** = Students progressing quickly
- **Flat line** = Stalled progress (investigate)
- **Downward trend** = Students falling behind (rare, indicates problems)
- **Plateaus** = Students hitting difficult content (plan support)

**Example Scenarios**:

*Healthy Progress*:
```
Progress climbing steadily from week 1 to week 4
→ Students moving through content at expected pace
→ Continue current approach
```

*Concerning Stall*:
```
Progress was climbing, then flattened in week 2
→ Students stuck on difficult content
→ Provide additional support or adjust pacing
```

*Positive Acceleration*:
```
Progress picks up speed in week 3
→ Students gaining momentum and confidence
→ Maintain engagement and continue momentum
```

### Comparative Cohort View

If your institution has multiple cohorts, compare:
- Same course, different cohorts
- Different courses, same timeframe
- Identify best practices from high-performing cohorts

**Comparison Questions:**
- Why does Cohort A outperform Cohort B?
- What teaching strategies correlate with higher progress?
- Are certain times of year more effective?

---

## Struggling Students Alert

### What Is This Section?

A highlighted section showing students who are at-risk of falling behind or dropping out.

```
⚠️  STRUGGLING STUDENTS (8 students)

┌─────────────────────────────┐
│ John Smith                  │ 20%
│ john@example.com            │
│ Last active: 10 days ago    │ At-Risk
│ Engagement: 35/100          │
│ [View Details] [Contact]    │
├─────────────────────────────┤
│ Sarah Johnson               │ 15%
│ sarah@example.com           │
│ Last active: 3 weeks ago    │ High-Risk
│ Engagement: 18/100          │
│ [View Details] [Contact]    │
└─────────────────────────────┘
```

### How Students Get Flagged as Struggling

Students appear here if they meet ANY of these criteria:

1. **Low Progress** (< 50%)
   - Completed fewer than half of lessons
   - Suggests difficulty with course material

2. **No Recent Activity** (> 7 days)
   - Haven't logged in for over a week
   - May have lost interest or motivation

3. **Low Engagement** (< 40/100)
   - Minimal activity and participation
   - Not interacting meaningfully with content

4. **Completion Risk**
   - On track to not finish by end date
   - May need timeline adjustment

### Risk Levels

**At-Risk** (Orange)
- Progress 25-50% OR
- No activity 7-14 days OR
- Engagement 40-60
- **Action**: Gentle check-in

**High-Risk** (Red)
- Progress < 25% OR
- No activity > 14 days OR
- Engagement < 40
- **Action**: Immediate intervention

### What To Do

#### For Each At-Risk Student

1. **Click Student Name**
   - View full student profile
   - See complete activity history
   - Review progress timeline

2. **Understand Their Situation**
   - When did struggles begin?
   - What content are they stuck on?
   - External factors affecting them?

3. **Take Action**
   - Send supportive message
   - Offer additional resources
   - Adjust pacing if needed
   - Connect with peer mentor
   - Refer to student services

4. **Follow Up**
   - Check back in 3-5 days
   - Monitor if engagement increases
   - Document intervention in student notes

### Intervention Strategies

**For Low Progress:**
- Break down difficult lessons into smaller chunks
- Provide supplementary materials
- Pair with successful peer for study buddy
- Offer office hours or tutoring

**For Inactivity:**
- Send personalized check-in email
- Call student if appropriate
- Ask about barriers (tech, time, motivation)
- Offer flexible schedule adjustments

**For Low Engagement:**
- Increase interactive elements (discussions, group work)
- Provide more frequent feedback
- Gamify progress (badges, leaderboard)
- Connect to student's goals and interests

---

## Leaderboard Feature

### What Is the Leaderboard?

A ranked list recognizing top-performing students based on progress and engagement.

```
🏆 TOP PERFORMERS (Leaderboard)

Rank │ Student Name         │ Progress │ Engagement │ Lessons
─────┼──────────────────────┼──────────┼────────────┼─────────
  1  │ Alex Johnson         │ 100%     │ 95/100     │ 20/20
  2  │ Maria Garcia         │ 100%     │ 92/100     │ 20/20
  3  │ James Williams       │ 95%      │ 88/100     │ 19/20
  4  │ Lisa Chen            │ 90%      │ 85/100     │ 18/20
  5  │ David Martinez       │ 85%      │ 82/100     │ 17/20
```

### Leaderboard Criteria

**Primary Sort**: Completion percentage (highest first)
**Secondary Sort**: Engagement score (as tiebreaker)

**Ranking Factors**:
- Lesson completion rate
- Speed of progression
- Discussion participation
- Quiz/assessment scores
- Consistency of engagement

### Using the Leaderboard

#### Celebrate Success
- Recognize and congratulate top performers
- Share success stories with cohort
- Highlight high-engagement students
- Consider for peer mentoring roles

#### Motivate Peers
- Share leaderboard with class
- Encourage friendly competition
- Recognize improvement, not just top placement
- Celebrate diverse achievements

#### Identify Mentors
- Top performers can support struggling peers
- Create peer tutoring partnerships
- Delegate group project leadership
- Build community and collaboration

#### Learn Best Practices
- What are high performers doing differently?
- Study their strategies and habits
- Share effective approaches with other students
- Adapt successful techniques for class

### Customize Leaderboard View

**Filter by:**
- Time period (All time / This month / This week)
- Progress level (All / 90%+ / 75%+ / etc.)
- Engagement (All / High / Medium / etc.)

**Sort by:**
- Progress (highest first)
- Engagement (highest first)
- Recent activity (most recent first)
- Time spent (most hours)

---

## Data Export & Reporting

### Exporting Student Data

#### How to Export

1. **Click "Export CSV" Button**
   - Located in top navigation bar
   - Only appears when cohort is selected

2. **Choose Export Format**
   - **Full Roster**: All student data
   - **Struggling Only**: Only at-risk students
   - **Top Performers**: High achievers
   - **Custom**: Select specific columns

3. **Download File**
   - File saves to your Downloads folder
   - Filename includes cohort name and date
   - Format: `cohort-name-progress-2025-03-15.csv`

### CSV Contents

Example export:

```csv
student_name,email,status,progress_percent,completed_lessons,total_lessons,last_activity,engagement_score,days_since_activity
John Smith,john@example.com,Active,75,15,20,2025-03-15,82,0
Sarah Johnson,sarah@example.com,Active,45,9,20,2025-03-13,68,2
Michael Chen,michael@example.com,Active,20,4,20,2025-02-28,35,15
Jessica Lee,jessica@example.com,Completed,100,20,20,2025-03-10,90,5
```

### Using Exported Data

#### In Spreadsheets
1. Open Excel or Google Sheets
2. File → Import → Select CSV
3. Data automatically organized into columns
4. Create formulas, charts, and analysis

#### For Reporting
```
Common Reports:
- Progress summary (average %, completion rate)
- At-risk student list (with contact info)
- Intervention tracking (documented actions)
- Success metrics (time to completion, engagement)
```

#### For External Stakeholders
- Remove sensitive information (emails, addresses)
- Aggregate data (don't share individual details)
- Focus on anonymized trends and insights
- Include context and recommendations

### Creating Reports

#### Weekly Report Template

```
Weekly Progress Report - Spring 2025 Cohort
Week Ending: March 15, 2025

Summary:
• Cohort average progress: 62%
• Students on track: 35/48 (73%)
• At-risk students: 8 (17%)
• New completions this week: 2

Key Findings:
• Progress climbing steadily
• One lesson has high difficulty
• 3 students with no activity

Actions Taken:
• Messaged 5 at-risk students
• Provided supplementary materials
• Scheduled office hours for difficult lesson

Next Steps:
• Follow up with inactive students
• Monitor newly at-risk cohort member
• Track effectiveness of interventions
```

#### Monthly Report Template

```
Monthly Progress Report - Spring 2025 Cohort
Month: March 2025

Overview:
• Total students: 48
• Completed: 17 (35%)
• On track: 28 (58%)
• At-risk: 3 (6%)
• Average progress: 62%

Trends:
• Progress has increased 8% from February
• Completion rate up to 35% (from 28%)
• Two students completed this month
• Engagement scores averaging 68/100

Challenges:
• Lesson 8 has 30% completion (bottleneck)
• Three students have 7+ days inactivity
• Two students requested timeline extension

Interventions:
• Created supplementary Lesson 8 guide
• Reached out to inactive students
• Scheduled additional office hours

Recommendations:
• Simplify Lesson 8 content
• Create peer study groups
• Celebrate recent completers
```

---

## Best Practices

### 1. Regular Monitoring Schedule

**Daily (5 minutes)**
- Check dashboard first thing
- Review any new at-risk alerts
- Scan progress chart for changes

**Weekly (30 minutes)**
- Export full roster
- Analyze trends and patterns
- Plan interventions
- Update student records

**Monthly (1 hour)**
- Create formal report
- Share insights with stakeholders
- Review effectiveness of interventions
- Plan next month's strategies

### 2. Effective Interventions

#### Tiered Response System

**Tier 1: Proactive Support** (0-7 days inactive)
- Send encouraging email
- Offer optional supplementary materials
- No intervention required yet
- Action: Monitor closely

**Tier 2: Active Support** (7-14 days inactive)
- Direct message or phone call
- Check if they need help
- Offer specific resources
- Action: Schedule check-in

**Tier 3: Intensive Support** (14+ days inactive)
- Immediate intervention required
- Contact student and/or advisors
- Assess if course adjustment needed
- Action: Create support plan

**Tier 4: Re-engagement** (3+ weeks inactive)
- Consider course withdrawal
- Discuss alternative options
- Plan for next cohort if appropriate
- Action: Document conversation

### 3. Data-Driven Decisions

**Use Analytics to:**
- Identify content that's too difficult
- Recognize highly effective lessons
- Time interventions strategically
- Allocate resources to high-need areas

**Questions to Ask:**
- Why is progress flat in Week 3?
- What did high performers do differently?
- Which lessons have highest drop-off?
- When do students tend to struggle most?

### 4. Celebration & Recognition

**Recognize Progress:**
- Celebrate completers publicly
- Acknowledge improvement (not just top performers)
- Highlight diverse achievements
- Share success stories

**Peer Recognition:**
- Use leaderboard for friendly competition
- Celebrate weekly improvements
- Recognize effort, not just results
- Build community and motivation

### 5. Continuous Improvement

**Track What Works:**
- Document successful interventions
- Note which strategies reduce dropout rate
- Measure engagement improvements
- Build institutional knowledge

**Iterate and Adjust:**
- Review data monthly
- Adjust teaching approach based on trends
- Try new strategies
- Measure and evaluate results

---

## Troubleshooting

### Common Issues

#### Issue: Dashboard not loading
**Causes:**
- Slow internet connection
- Browser caching old version
- JavaScript errors in browser

**Solutions:**
1. Refresh page (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Try different browser
4. Wait a moment and reload

#### Issue: Data appears outdated
**Causes:**
- Automatic refresh hasn't run yet
- Student activity updated after page loaded
- Browser cache showing old data

**Solutions:**
1. Click "Refresh" button
2. Wait for auto-refresh (every 5 minutes)
3. Clear browser cache
4. Close and reopen dashboard

#### Issue: Struggling student isn't showing up
**Causes:**
- Student status recently changed
- Progress just improved
- Filters being applied

**Solutions:**
1. Clear any active filters
2. Click Refresh to get latest data
3. Check if student no longer meets at-risk criteria
4. Search for student by name in roster

#### Issue: Export button is grayed out
**Causes:**
- No cohort selected
- No data available for cohort
- Permission issue

**Solutions:**
1. Select a cohort from dropdown
2. Ensure cohort has enrolled students
3. Contact admin if permission issue
4. Try different cohort

#### Issue: Charts not displaying correctly
**Causes:**
- Browser doesn't support charting library
- Graphics settings disabled
- JavaScript not enabled

**Solutions:**
1. Enable JavaScript in browser settings
2. Try different browser
3. Update to latest browser version
4. Disable extensions that might conflict

#### Issue: Cohort selector not loading
**Causes:**
- No cohorts created yet
- Slow loading
- Permission issue

**Solutions:**
1. Create a cohort in Teacher Dashboard first
2. Wait longer for selector to load
3. Refresh page
4. Contact admin if no cohorts visible

### Performance Issues

**Dashboard Loading Slowly:**
- Clear browser cache
- Close unnecessary tabs
- Try different browser
- Contact admin if persistent

**Charts Rendering Slowly:**
- They auto-refresh; wait a few seconds
- Reduce number of visible days
- Export to spreadsheet for analysis

**Data Takes Time to Update:**
- Auto-refresh happens every 5 minutes
- Manual refresh may take 5-10 seconds
- If data still outdated, try clearing cache

### Getting Help

1. **In-App Help**
   - Click ? icon in dashboard
   - View frequently asked questions
   - Contact support directly

2. **Contact Support**
   - Email: support@c4c.org
   - Include screenshot and steps to reproduce
   - Mention browser and device
   - Include cohort name and date/time

3. **Documentation**
   - Review Student Roster Guide
   - Check related guides
   - Browse FAQ section

---

## Advanced Features

### Custom Report Building

**Create Detailed Cohort Analysis:**
1. Export student data
2. Import into Excel/Sheets
3. Create custom calculations
4. Build pivot tables for analysis
5. Generate visualizations
6. Share insights with stakeholders

### Multi-Cohort Comparison

**Compare Performance Across Cohorts:**
1. Document metrics for each cohort
2. Create comparison spreadsheet
3. Identify what works
4. Share best practices
5. Replicate success factors

### Predictive Analytics

**Identify at-risk students earlier:**
- Track engagement trends
- Watch for early warning signs
- Create early alert thresholds
- Intervene before students fall too far behind

---

## Related Documentation

- [Student Roster Guide](./student-roster.md) - Individual student management
- [Identifying Struggling Students Guide](./identifying-struggling-students.md) - Deep intervention strategies
- [Teacher Training Materials](../training/teacher-training.md) - Comprehensive training
- [API Documentation](../api/progress-api.md) - For developers

---

## Support & Feedback

Have suggestions for the Progress Dashboard? We'd love to hear from you!

- Email: support@c4c.org
- In-app feedback: Help → Send Feedback
- Community forum: forum.c4c.org/progress-dashboard

---

**Last Updated:** March 2025
**Version:** 1.0
**Maintenance:** Reviewed quarterly

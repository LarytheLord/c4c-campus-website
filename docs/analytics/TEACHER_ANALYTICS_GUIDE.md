# Teacher Analytics Dashboard - User Guide

## Welcome to Your Analytics Dashboard!

The Teacher Analytics Dashboard provides powerful insights into student engagement, learning patterns, and at-risk students. This guide will help you make the most of these tools.

## Accessing the Dashboard

Navigate to `/teacher/analytics` or click "Analytics" in your teacher navigation menu.

## Dashboard Overview

### 1. Cohort Selector

At the top of the dashboard, select which cohort you want to analyze. The dropdown shows:
- Cohort name
- Number of enrolled students
- Course information

**Tip:** Switch between cohorts to compare performance across different groups.

### 2. Date Range Selector

Choose the time period for your analytics:
- **Last 7 days** - Recent activity snapshot
- **Last 30 days** - Monthly trends (default)
- **Last 90 days** - Quarterly overview
- **Last 6 months** - Semester analysis
- **Last year** - Annual comparison
- **All time** - Complete history
- **Custom** - Choose specific dates

### 3. Key Metrics Cards

Four essential metrics at a glance:

**Total Students**
- Current enrollment count
- Trend vs. previous period

**Average Completion**
- Course completion percentage
- Progress indicator

**At Risk**
- Number of students needing support
- Change from last period

**Engagement Rate**
- Overall student activity level
- Trend indicator

## Features by Tab

### Tab 1: Engagement Heat Map

**What it shows:** When your students are most active throughout the week.

#### Reading the Heat Map

- **X-axis (horizontal):** Hours of the day (0-23)
- **Y-axis (vertical):** Days of the week (Sunday-Saturday)
- **Color intensity:** Darker = more active students
- **Hover:** See exact numbers for any time slot

#### How to Use It

1. **Identify Peak Times**
   - Find the darkest cells
   - Schedule live sessions during peak hours
   - Post important announcements when students are online

2. **Spot Patterns**
   - Weekend vs. weekday activity
   - Morning vs. evening learners
   - Time zone considerations

3. **Optimize Scheduling**
   - Plan live office hours during high-activity periods
   - Schedule deadline reminders before typical study times
   - Avoid posting during low-activity periods

**Export Options:**
- CSV: Raw data for further analysis
- PDF: Formatted report with visualizations
- PNG: Chart image for presentations
- Excel: Spreadsheet with multiple data sheets

### Tab 2: At-Risk Students

**What it shows:** Students who may need additional support to complete the course.

#### Risk Levels

**Critical (Red)**
- Immediate action required
- 14+ days inactive or very low engagement
- Contact student within 24 hours

**High (Orange)**
- Urgent attention needed
- 7-14 days inactive or significantly behind
- Reach out within 48 hours

**Medium (Yellow)**
- Monitor closely
- Below average engagement or progress
- Send check-in message

**Low (Green)**
- On track
- Regular monitoring sufficient

#### How the Algorithm Works

Students are scored 0-100 based on:

1. **Inactivity (30 points)**
   - Days since last activity
   - Critical: 14+ days
   - High: 7-14 days

2. **Engagement Level (30 points)**
   - Events vs. cohort average
   - Video views, lesson completions
   - Discussion participation

3. **Progress (20 points)**
   - Completion percentage
   - Pace compared to schedule

4. **Participation (20 points)**
   - Discussion posts
   - Question asking
   - Peer interaction

5. **Trend (15 points)**
   - Increasing, stable, or declining
   - Recent activity comparison

6. **Velocity (15 points)**
   - Lessons completed per week
   - Compared to cohort average

#### Taking Action

For each at-risk student, you'll see:
- Name and email
- Days since last activity
- Risk score and level
- **Recommended actions:**
  - Send personalized message
  - Schedule 1-on-1 check-in
  - Offer additional resources
  - Assign peer mentor
  - Adjust deadlines

**Quick Actions:**
- Click "Contact" to send immediate message
- View full student profile
- See detailed metrics
- Track intervention history

#### Best Practices

1. **Daily Monitoring**
   - Check critical and high-risk students every morning
   - Respond to changes in risk level

2. **Proactive Outreach**
   - Don't wait for students to ask for help
   - Reach out before risk becomes critical

3. **Personalized Support**
   - Reference specific lessons or activities
   - Acknowledge their progress
   - Offer concrete next steps

4. **Document Interventions**
   - Track what actions you've taken
   - Note student responses
   - Follow up consistently

**Recalculate Button:**
- Click to refresh predictions with latest data
- Run after major course events
- Updates typically take 10-30 seconds

### Tab 3: Lesson Effectiveness

**What it shows:** Performance metrics for individual lessons.

#### Key Metrics

**Completion Rate**
- Percentage of students who finished the lesson
- Compared to course average

**Average Watch Time**
- How long students engage with content
- Compared to video duration

**Drop-off Points**
- Timestamps where students pause or leave
- Indicates confusing or difficult sections

**Re-watch Frequency**
- How often students review content
- May indicate difficulty or importance

#### Using This Data

1. **Identify Problem Areas**
   - Low completion rates
   - High drop-off points
   - Below-average engagement

2. **Improve Content**
   - Simplify complex sections
   - Add supplementary materials
   - Break long lessons into smaller parts

3. **Recognize Success**
   - High completion lessons as templates
   - Share effective teaching techniques
   - Replicate successful formats

4. **Student Support**
   - Create study guides for difficult lessons
   - Offer extra office hours
   - Record supplementary explanations

### Tab 4: Custom Reports

**Coming Soon!** Build and save custom analytics reports with:
- Custom metric selection
- Flexible date ranges
- Multiple export formats
- Scheduled email delivery

For now, use the export buttons on each tab to download data.

## Tips for Success

### Daily Routine (5 minutes)

1. Check key metrics cards for changes
2. Review critical and high-risk students
3. Send quick check-in messages as needed

### Weekly Analysis (30 minutes)

1. Review engagement heat map
2. Analyze at-risk trends
3. Identify struggling students
4. Plan intervention strategies
5. Review lesson effectiveness
6. Adjust course materials if needed

### Monthly Planning (1 hour)

1. Compare current vs. previous month
2. Identify patterns and trends
3. Document successful interventions
4. Share insights with fellow teachers
5. Update course based on data

## Common Questions

**Q: How often is data updated?**
A: Analytics update in real-time. Materialized views refresh every 4 hours for performance.

**Q: Can students see their own analytics?**
A: No, teacher analytics are private. Students see their own progress on their dashboard.

**Q: What if a student is marked at-risk but seems fine?**
A: The algorithm isn't perfect. Use it as a tool, not a replacement for your judgment. Reach out to confirm.

**Q: How do I export data for my records?**
A: Click the export buttons (CSV, PDF, PNG, Excel) on each section. Data downloads immediately.

**Q: Can I compare cohorts?**
A: Yes! Switch between cohorts using the selector at the top. Future updates will add side-by-side comparison.

**Q: What's the difference between "engagement rate" and "completion rate"?**
A: Engagement measures daily activity (logins, videos, discussions). Completion measures finished lessons/courses.

**Q: How can I improve my students' engagement?**
A: Use the heat map to schedule activities during peak times. Use at-risk data to intervene early. Use lesson effectiveness to improve content.

## Privacy & Ethics

### Student Privacy

- All analytics are aggregated and anonymized where possible
- Individual student data visible only to assigned teachers
- Students cannot see other students' data
- Data used solely for educational improvement

### Ethical Use

**Do:**
- Use data to support and improve learning
- Intervene early with struggling students
- Identify and address course issues
- Celebrate student success

**Don't:**
- Use data punitively
- Share individual analytics publicly
- Make assumptions based solely on data
- Ignore student context and circumstances

## Getting Help

**Technical Issues:**
- Email: support@c4ccampus.org
- Include: Screenshots, error messages, browser info

**Best Practices:**
- Check the online knowledge base
- Join the teacher community forum
- Attend monthly analytics workshops

**Feature Requests:**
- Submit via feedback form
- Include detailed use case
- Vote on existing requests

## What's Next?

Stay tuned for upcoming features:
- Real-time notifications for at-risk students
- Automated weekly email reports
- Mobile app for on-the-go monitoring
- AI-powered content recommendations
- Integration with communication tools

---

**Need more help?** Visit the [Analytics FAQ](#) or contact [support@c4ccampus.org](mailto:support@c4ccampus.org)

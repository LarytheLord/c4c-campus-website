# Analytics Dashboard Guide

## Overview

The Analytics Dashboard provides comprehensive insights into platform performance, user engagement, course enrollment, and system health. Use these metrics to understand platform usage patterns and identify areas for improvement.

**Access URL:** `/admin/analytics`

## Key Metrics

### User Analytics

#### Total Students
- Count of all users with student role
- Tracks platform growth
- Includes active and inactive students

#### Active Enrollments
- Students currently enrolled in courses
- Status = 'active'
- Does not include completed or dropped

#### Average Completion Rate (%)
- Calculated as (completed_lessons / total_lessons) * 100
- Across all courses platform-wide
- Key indicator of student success

#### Total Watch Time (Hours)
- Cumulative student video/content consumption
- Sum of time_spent_seconds / 3600
- Measure of engagement and effort

## Charts and Visualizations

### Enrollment Trend (Last 30 Days)

**Type:** Line chart showing enrollment growth

**What It Shows:**
- Number of new enrollments per day
- Trends over last month
- Growth acceleration or decline
- Spikes in enrollment activity

**How to Read:**
- X-axis: Dates (last 30 days)
- Y-axis: Enrollment count
- Line shows trend
- Helps identify busy periods

**Use Cases:**
- Track enrollment momentum
- Identify seasonal patterns
- Correlate with marketing campaigns
- Plan resource allocation

### Top Courses by Enrollment

**Type:** Horizontal bar chart

**What It Shows:**
- 5 most popular courses
- Enrollment count for each
- Comparative popularity
- Student preferences

**How to Read:**
- Course names on left
- Bar length = enrollment count
- Longer bar = more popular
- Colored bars for visual distinction

**Use Cases:**
- Identify successful courses
- Allocate teaching resources
- Plan course improvements
- Design new courses based on demand

### Course Completion Rates

**Type:** Horizontal progress bars

**What It Shows:**
- Completion percentage per course
- Top 10 courses by name
- Sorted by completion rate (highest first)
- Visual completion indicator

**How to Read:**
- Course name on left
- Percentage on right
- Bar fills to show rate
- 100% = all students completed

**Use Cases:**
- Identify struggling courses
- Find courses that need content updates
- Celebrate high-performing courses
- Debug dropout patterns

### User Role Distribution

**Type:** Doughnut (pie) chart

**What It Shows:**
- Breakdown of user roles
- Number of students, teachers, admins
- Proportion of total users
- System composition

**How to Read:**
- Slice size = user count
- Colors: Students (blue), Teachers (green), Admins (red)
- Legend shows actual numbers
- Percentage can be calculated

**Use Cases:**
- Verify role distribution healthy
- Plan teacher recruitment
- Audit admin access
- Understand user composition

## Cohort Analytics

### Active Cohorts Performance Table

Shows all active cohorts with:

**Columns:**

| Column | Description |
|--------|-------------|
| Cohort | Cohort name |
| Course | Which course cohort studies |
| Students | Number enrolled in cohort |
| Avg Completion | Average lessons completed |
| Status | Current status (Active) |
| Start Date | When cohort began |

**How to Use:**
1. Scan for cohorts with low completion
2. Identify struggling groups
3. Provide targeted support
4. Plan next cohort improvements

**Metrics Explained:**

- **Students:** Enrollment count
- **Avg Completion:** Average lessons completed per student
- **Status:** Shows "Active" for running cohorts
- **Start Date:** Course start date for reference

## System Health Metrics

### Database Size
- Current database storage used
- Shows N/A if not available
- Monitor for growth
- Alert if approaching limits

### Total Records
- Count of all records across tables
- Includes:
  - Courses
  - Enrollments
  - Applications
  - Lessons
- Indicator of data volume

### API Response Time
- Milliseconds for analytics query
- Lower is better
- > 1000ms indicates issues
- Monitor for performance degradation

## Analyzing Platform Health

### Growth Indicators

**Look For:**
- Increasing enrollment trend
- Growing student count
- More active enrollments
- Increasing watch time

**Actions If Declining:**
- Review course quality
- Check technical issues
- Assess marketing efforts
- Survey users for feedback

### Completion Health

**Healthy Metrics:**
- 60%+ completion rate
- Consistent rates across courses
- Improving trend over time

**Areas of Concern:**
- Course below 40% completion
- Sudden completion drops
- High variance between courses

### Engagement Metrics

**Good Signs:**
- Rising watch time
- Active enrollments increasing
- Students completing courses
- Multiple courses enrolled

**Warning Signs:**
- Declining watch time
- Low active enrollment
- Many dropouts
- Low course popularity

## Time-Based Analysis

### Analyzing Trends

**Enrollment Trend Chart:**
- Identify peak enrollment periods
- Note any seasonal patterns
- Correlate with campaigns
- Plan capacity accordingly

**Recent Data:**
- 30-day trend shows short-term patterns
- Compare to historical data
- Identify recent changes
- React to emerging trends

### Forecasting

Use current metrics to estimate:
- Expected future enrollments
- Resource needs
- Teaching load
- Infrastructure requirements

## Data Interpretation

### Understanding Low Completion

**Possible Causes:**
- Course difficulty too high
- Content not engaging
- Technical issues
- Student time constraints

**Solutions:**
- Review course difficulty
- Improve content quality
- Add more interactivity
- Extend deadlines

### Understanding Low Enrollment

**Possible Causes:**
- Course not discoverable
- Poor course description
- Not promoted adequately
- Doesn't meet market demand

**Solutions:**
- Improve course description
- Better course marketing
- Solicit student feedback
- Consider retiring course

### Understanding Uneven Distribution

**Role Distribution Imbalance:**
- Too many admins = security risk
- Too few teachers = resource constraint
- Imbalanced student-teacher ratio

**Actions:**
- Use user management to rebalance
- Recruit teachers if needed
- Audit admin access

## Using Analytics for Decisions

### Course Management

Use completion rate and enrollment to:
- Identify which courses to improve
- Decide which courses to retire
- Plan new course development
- Allocate instructor resources

### User Management

Use analytics to:
- Identify underperforming cohorts
- Plan intervention strategies
- Celebrate successful groups
- Adjust teaching approaches

### Capacity Planning

Use growth trends to:
- Forecast infrastructure needs
- Plan server capacity
- Predict bandwidth requirements
- Budget technical resources

### Marketing Effectiveness

Track enrollment trends to:
- Measure campaign impact
- Identify best promotional channels
- Time marketing efforts
- Justify marketing spend

## Exporting Data

Currently, data is viewed in-dashboard. To export:

1. Use browser print function (Ctrl+P)
2. Select "Save as PDF"
3. Keep for records
4. Or screenshot individual charts

Note: Export feature may be added in future versions

## Troubleshooting

### Charts Not Displaying

**Problem:** Blank chart areas or missing visualizations

**Solutions:**
- Wait for page to fully load
- Check browser console for errors
- Verify JavaScript enabled
- Try different browser
- Clear cache and refresh

### Missing Data

**Problem:** Some metrics show "-" or blank

**Solutions:**
- Ensure database tables have data
- Check RLS policies allow read access
- Verify service role key configured
- Run data migration if needed

### Old Data

**Problem:** Analytics show outdated information

**Solutions:**
- Refresh page to reload data
- Check network connection
- Verify database updates are working
- Wait a few minutes for sync

### Performance Issues

**Problem:** Analytics page loads slowly

**Solutions:**
- Check internet connection
- Close other tabs/applications
- Clear browser cache
- Try during off-peak hours
- Check server status

## Exporting Insights

### Documenting Findings

1. Take screenshots of key charts
2. Record metrics and dates
3. Note observations and trends
4. Document recommendations
5. Share with team

### Reporting

Create reports by:
- Summarizing key metrics
- Including relevant charts
- Documenting trends
- Making recommendations
- Tracking changes over time

## Related Documentation

- [Admin Dashboard](./admin-dashboard.md)
- [User Management](./user-management.md)
- [Application Review](./application-review.md)
- [Troubleshooting Guide](./troubleshooting.md)

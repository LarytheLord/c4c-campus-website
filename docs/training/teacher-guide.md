# Teacher Training Guide - Cohort System

Complete guide for teachers to create, manage, and teach cohorts effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Cohort](#creating-your-first-cohort)
3. [Managing Cohorts](#managing-cohorts)
4. [Time-Gating Strategy](#time-gating-strategy)
5. [Student Management](#student-management)
6. [Monitoring Progress](#monitoring-progress)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Getting Started

### What You Need

- A course already created in the C4C Campus Platform
- Admin/teacher permissions for that course
- Understanding of when your cohort should run (start/end dates)
- Module structure already set up for your course

### Key Concepts

**Cohort**: A group of students learning together on a set schedule
**Time-Gating**: Controlling when modules unlock for your cohort
**Enrollment**: Students joining your cohort
**Progress Tracking**: Monitoring student completion and engagement

### The Flow

```
Create Course
    ↓
Create Cohort(s)
    ↓
Set Up Time-Gate Schedule
    ↓
Students Enroll
    ↓
Teach & Monitor Progress
    ↓
Complete Cohort
```

---

## Creating Your First Cohort

### Step 1: Access Teacher Dashboard

1. Log in to the platform with your teacher account
2. Go to **Teacher Dashboard** or **My Courses**
3. Find the course where you want to create a cohort

### Step 2: Click "Create Cohort"

Look for a button or link labeled "Create Cohort" on your course page.

### Step 3: Enter Cohort Details

**Basic Information:**
- **Cohort Name**: "Spring 2025 Batch 1" or "Fall 2024 Advanced"
  - Should be unique within your course
  - Include term and cohort number/variant

- **Start Date**: When your cohort begins
  - Format: YYYY-MM-DD (e.g., 2025-03-01)
  - This is when the first modules unlock
  - Consider your teaching schedule

- **End Date** (optional): When your cohort concludes
  - Must be after start date
  - Used for display and filtering
  - Students can continue after (unless you archive)

**Advanced Options:**
- **Max Students**: Cap on enrollment (default: 50)
  - Manage class size for engagement
  - Can be increased later if needed

- **Status** (optional): Initial status
  - "Upcoming" - default, cohort hasn't started
  - "Active" - cohort is running
  - "Completed" - cohort finished
  - "Archived" - hidden from new students

### Step 4: Save

Click "Create Cohort". You'll see a confirmation message and your cohort ID.

### Step 5: Configure Time-Gating

After creation, you'll set when each module unlocks. See [Time-Gating Strategy](#time-gating-strategy) section below.

---

## Managing Cohorts

### View Your Cohorts

Go to your Teacher Dashboard and select a course. You'll see all cohorts you've created:

| Cohort | Status | Students | Start Date |
|--------|--------|----------|------------|
| Spring 2025 | active | 28/30 | 2025-03-01 |
| Summer 2024 | completed | 25/30 | 2024-06-01 |

### Edit Cohort Details

To change cohort settings:

1. Click on the cohort name
2. Click "Edit"
3. Update any of these fields:
   - Name
   - Dates
   - Max students
   - Status
4. Click "Save Changes"

**Common Changes:**
- **Increase capacity**: Change max_students when enrollment is high
- **Update end date**: Extend cohort if running behind schedule
- **Change status**: "upcoming" → "active" → "completed"

### Delete a Cohort

Only delete if you haven't started teaching or made a mistake in creation.

1. Click cohort name
2. Click "Delete Cohort"
3. Confirm deletion
4. Warning: This removes all enrollments and schedules

**Better Alternative**: Mark as "archived" instead to keep records.

### Monitor Enrollment

1. Open your cohort
2. See **Enrollment Count**: "25/30 students"
3. Click **"View Enrollments"** to see:
   - Student names
   - Enrollment dates
   - Activity status
   - Lessons completed per student

---

## Time-Gating Strategy

Time-gating controls when students access content. This is crucial for cohort-based learning.

### Why Time-Gating?

Benefits:
- **Pacing**: Keep everyone on schedule
- **Engagement**: Release content progressively
- **Discussions**: All students work on same content simultaneously
- **Management**: Control when assessments are available

### Planning Your Schedule

### Example: 8-Week Course

**Course Start**: March 1, 2025
**Modules**: 8 modules, 1 per week

**Schedule:**
```
Module 1: Unlock March 1
Module 2: Unlock March 8
Module 3: Unlock March 15
Module 4: Unlock March 22
Module 5: Unlock March 29
Module 6: Unlock April 5
Module 7: Unlock April 12
Module 8: Unlock April 19
```

### Setting Up Unlock Dates

1. After creating cohort, click **"Configure Schedule"**
2. For each module:
   - Click **"Set Unlock Date"**
   - Enter unlock date (YYYY-MM-DD)
   - Optionally set lock date (when to re-lock)
   - Click **"Save"**
3. Review schedule overview

### Common Patterns

**Pattern 1: Weekly Release (Most Common)**
- One module per week
- No lock dates
- Students can revisit any completed module

```
Week 1: Module 1 unlocks
Week 2: Module 2 unlocks
Week 3: Module 3 unlocks
```

**Pattern 2: Staggered with Lock Dates**
- Keep focus on current week
- Lock previous modules after 2 weeks
- Encourages active engagement

```
Week 1: Module 1 unlocks (locks week 3)
Week 2: Module 2 unlocks (locks week 4)
Week 3: Module 3 unlocks (locks week 5)
```

**Pattern 3: Front-Load Content**
- All content available from start
- For self-paced learners
- No time-gating constraints

```
Everything unlocks: Start date
Lock dates: None (all stay unlocked)
```

**Pattern 4: Accelerated Schedule**
- Multiple modules per week
- For intensive programs
- More frequent unlocks

```
Monday: Module 1 unlocks
Wednesday: Module 2 unlocks
Friday: Module 3 unlocks
```

### Updating Schedules

If you need to change unlock dates:

1. Click cohort
2. Go to **"Schedule"** tab
3. Find the module to change
4. Click **"Edit"**
5. Change dates
6. Click **"Save"**

Changes take effect immediately. Students will see updated unlock dates.

---

## Student Management

### Viewing Student Roster

1. Open cohort
2. Click **"Students"** tab
3. See all enrolled students with:
   - Name and email
   - Enrollment date
   - Current status (active, paused, dropped)
   - Lessons completed
   - Last activity date

### Enrolling Individual Students

If a student needs manual enrollment (not self-enrolled):

1. Open cohort
2. Click **"Enroll Students"**
3. Search for student by name/email
4. Click **"Enroll"**
5. Confirm

The student now has access and will see the cohort in their dashboard.

### Bulk Enrollment

For enrolling multiple students at once:

1. Open cohort
2. Click **"Bulk Enroll"**
3. Upload CSV file with student emails
4. Review list
5. Click **"Enroll All"**

**CSV Format:**
```
email
student1@email.com
student2@email.com
student3@email.com
```

### Removing Students

If a student drops or needs to be removed:

1. Open cohort → **"Students"**
2. Find student
3. Click **"Remove"** or **"Unenroll"**
4. Confirm

**Note**: This marks enrollment as "dropped". Records remain for grading/analysis.

### Pausing Student Enrollment

If a student needs temporary pause:

1. Click student name
2. Click **"Pause"**
3. Student sees locked content message
4. When ready: Click **"Resume"**

---

## Monitoring Progress

### Progress Dashboard

Your cohort dashboard shows:

- **Overall Statistics**
  - Enrollment: "28/30 students"
  - Completion: "42% of cohort completed"
  - Average progress: "5.2/8 modules"

- **Module Completion**
  - Module 1: 28 students (100%)
  - Module 2: 27 students (96%)
  - Module 3: 20 students (71%)

- **Student Activity**
  - Active: 26 students (this week)
  - No recent activity: 2 students
  - Dropped: 1 student

### Individual Student Progress

Click a student name to see:

- Modules completed
- Time spent per module
- Lesson completion timeline
- Video watch history
- Last activity date

**Use for**: Identifying struggling students, recognizing progress, planning interventions

### Activity Reports

Generate reports for:

- Weekly engagement metrics
- Module completion rates
- Time spent per content piece
- Student-by-student summaries

**Use for**: Curriculum evaluation, identifying bottlenecks, adjusting pace

### Intervention Triggers

Consider reaching out to students when:

- No activity for 2+ weeks
- Significant gap to class average
- Repeated module rewatching (confusion signal)
- Very slow completion pace

---

## Best Practices

### Before Cohort Starts

1. **Test the schedule**
   - Walk through first 2 modules as student
   - Verify unlock dates work
   - Check module content quality

2. **Plan communications**
   - Welcome message for first day
   - Weekly announcements
   - Discussion prompts
   - FAQ document

3. **Prepare materials**
   - Supplementary resources
   - Assignment guidelines
   - Assessment rubrics
   - Support documentation

4. **Set expectations**
   - Time commitment (hours/week)
   - Completion deadlines
   - Interaction requirements
   - Support channels

### During Cohort

1. **Manage pacing**
   - Monitor module completion rates
   - Adjust unlock dates if needed
   - Communicate delays in advance
   - Extend deadlines with notice

2. **Engage actively**
   - Participate in discussions
   - Respond to questions within 24 hours
   - Give feedback on assignments
   - Share announcements

3. **Support students**
   - Monitor inactive students
   - Offer one-on-one help
   - Remove obstacles to learning
   - Celebrate milestones

4. **Track metrics**
   - Check completion rates weekly
   - Monitor engagement patterns
   - Identify content that confuses
   - Note technical issues

### After Cohort Completes

1. **Celebrate completion**
   - Send congratulations message
   - Share completion certificates (if applicable)
   - Recognize top performers
   - Gather feedback

2. **Analyze data**
   - Overall completion rate
   - Module difficulty patterns
   - Time spent per content
   - Student feedback themes

3. **Iterate**
   - Update unclear modules
   - Adjust unlock schedule
   - Revise supplementary materials
   - Plan improvements

4. **Archive**
   - Mark cohort as "completed"
   - Keep records accessible (don't delete)
   - Archive for future reference
   - Extract insights for next cohort

---

## Troubleshooting

### "No students are enrolling"

**Possible Causes:**
- Cohort status is "archived" or "completed"
- Cohort page not easily findable
- Name/description unclear
- Start date in past

**Solutions:**
- Check cohort status (should be "upcoming" or "active")
- Promote cohort in course materials
- Send enrollment email to interested students
- Check course is published

### "Students say module is locked but it should be unlocked"

**Possible Causes:**
- Unlock date is in future
- Lock date is set and past (locks again)
- Time zone mismatch
- Browser cache

**Solutions:**
- Verify unlock date is correct in schedule
- Check if lock_date is set and causing re-lock
- Have students clear browser cache
- Test as teacher (should always see content)

### "Enrollment count doesn't match actual students"

**Possible Causes:**
- Some dropped enrollments still counted
- Paused students not clear
- Display bug

**Solutions:**
- Refresh page
- Check filter (active vs. all statuses)
- Contact support if persistent

### "I accidentally created a cohort"

**Solution:**
- Delete it immediately (before students enroll)
- OR rename to "ARCHIVED: [name]" and mark archived
- Creating duplicate is better than deleting with data

### "I need to change the start date"

**Can I do this?**
- Yes, in most cases
- Update the start date
- Update all module unlock dates accordingly

**Steps:**
1. Click **"Edit"**
2. Change start_date
3. Click **"Update Schedule"** to adjust all dates
4. Verify calendar looks correct
5. Save

---

## FAQ

### Q: Can I have multiple cohorts of the same course running simultaneously?

**A:** Yes! You can create as many cohorts as needed. Each has independent enrollments and schedules. Use this for:
- Multiple sections
- Different pace levels (standard vs. accelerated)
- Different time zones
- Waves of students

### Q: What if I want to make content available immediately?

**A:** Create an unlock schedule with all modules unlocking on the first day of the cohort. Or don't use time-gating at all - all modules unlock by default if no schedule exists.

### Q: Can I change the time-gating schedule after students start?

**A:** Yes, but carefully. Changes affect all students. Consider:
- Extending unlock dates (OK)
- Moving dates forward significantly (may break assumptions)
- Adding new unlock dates (OK)
- Changing lock dates (check who's affected)

Best practice: Announce changes to students.

### Q: What happens if I archive a cohort?

**A:** Students already enrolled can still access content. The cohort no longer appears in enrollment lists, and new students can't enroll. Good for:
- Hiding completed cohorts
- Preventing accidental new enrollments
- Keeping records without cluttering lists

### Q: How do I know if my time-gating schedule is working?

**A:**
- As teacher: You always see all content (bypass time-gating)
- Ask students if they see locked content when expected
- Check progress dashboard - completion dates should cluster around unlock dates
- Review "module completion timeline" to see when students finished

### Q: Can I give individual students different unlock dates?

**A:** Current system doesn't support this. Workaround:
- Create separate cohorts for different groups with different schedules
- Use discussions/messages to give early access (bypassing system)
- Consider custom development if needed

### Q: What if a student enrolls late?

**A:** They can enroll anytime (unless cohort is archived). They:
- See all unlocked modules immediately
- Can't see not-yet-unlocked modules
- Progress counter resets
- Can catch up at their own pace on unlocked content

### Q: How do I handle students who are ahead/behind schedule?

**A:**
- **Ahead**: Offer stretch content, deeper dives, leadership roles
- **Behind**: Provide extra support, extensions, one-on-one help
- **Consider**: Creating "accelerated" and "standard" cohorts with different schedules

### Q: Can I extend the cohort end date?

**A:** Yes, edit the cohort and change the end_date. The course continues as long as the cohort exists (until you delete or archive it).

### Q: How do I download student progress reports?

**A:** Use the **"Reports"** section in your cohort dashboard. Export options typically include:
- CSV format
- PDF summary
- Custom date ranges
- Module or student-specific reports

### Q: What's the difference between "completed" and "archived"?

**Completed**: Cohort finished its course. Students can still access. Shows in completed list.

**Archived**: Hidden from view. Prevents accidental new enrollments. Use this for old cohorts you want to keep but not display.

---

## Additional Resources

- [Cohort Creation Guide](../guides/cohort-creation.md) - Detailed step-by-step
- [Time-Gating Guide](../guides/time-gating.md) - Module scheduling details
- [API Reference](../api/cohorts.md) - For developers integrating cohorts
- [Student Guide](../help/students.md) - What students see and do
- [Troubleshooting](../help/troubleshooting.md) - Common issues

---

## Support

Need help? Contact:
- **Technical Issues**: support@c4c-campus.com
- **Pedagogy Questions**: teaching-team@c4c-campus.com
- **Feature Requests**: feedback@c4c-campus.com

We're here to help you succeed!

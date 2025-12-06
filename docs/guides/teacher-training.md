# Teacher Training Materials: Complete Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Platform Overview](#platform-overview)
3. [Teaching Dashboard](#teaching-dashboard)
4. [Working with Cohorts](#working-with-cohorts)
5. [Creating & Managing Courses](#creating--managing-courses)
6. [Managing Students](#managing-students)
7. [Using Analytics](#using-analytics)
8. [Communication & Support](#communication--support)
9. [Best Practices](#best-practices)
10. [Advanced Features](#advanced-features)
11. [Quick Reference](#quick-reference)

---

## Getting Started

### Pre-Training Checklist

Before starting as a teacher on C4C Campus, ensure you have:

```
ACCOUNT SETUP
[ ] Email address (institutional or personal)
[ ] Password created (12+ characters, mixed case, numbers, symbols)
[ ] Profile photo uploaded (optional but recommended)
[ ] Bio/introduction written
[ ] Email verified
[ ] Phone number on file (optional but recommended)

SYSTEM ACCESS
[ ] Can log in to platform
[ ] Can access Teacher Dashboard
[ ] Can see cohorts you're teaching
[ ] Can view student list
[ ] Can access course materials

RESOURCES
[ ] Read this training guide
[ ] Reviewed student roster guide
[ ] Reviewed progress dashboard guide
[ ] Reviewed struggling student interventions guide
[ ] Bookmarked key pages and tools
[ ] Have contact info for support team
```

### First 48 Hours

**Day 1 (Onboarding):**
1. Complete account setup
2. Explore dashboard (30 minutes)
3. Review cohort information
4. Check student roster
5. Send welcome message to class

**Day 2 (Familiarization):**
1. Review course content/lessons
2. Set up course schedule
3. Create course communication
4. Schedule office hours
5. Test student communication system

### Account Security

**Password Best Practices:**
- Use strong password (12+ characters)
- Include uppercase, lowercase, numbers, symbols
- Never share your password
- Change password quarterly
- Use unique password (not used elsewhere)

**Login Security:**
- Log in only from secure networks
- Don't stay logged in on shared computers
- Log out when done with session
- Report suspicious activity immediately

---

## Platform Overview

### C4C Campus Architecture

```
C4C CAMPUS PLATFORM

┌─────────────────────────────┐
│    Student Dashboard        │ (For students learning)
├─────────────────────────────┤
│   Teacher Dashboard         │ (Where you manage)
├─────────────────────────────┤
│    Progress Analytics       │ (Track student outcomes)
├─────────────────────────────┤
│   Course Builder            │ (Create content)
└─────────────────────────────┘
```

### Key Concepts

#### Courses
**Definition:** Educational programs with structured content
- Examples: "n8n Basics", "Climate Data Analysis"
- Created by teachers
- Can be published or in draft
- Multiple cohorts can run same course

**Your Role:** Create, edit, update course content and structure

#### Cohorts
**Definition:** Groups of students taking same course in same timeframe
- Examples: "Spring 2025 - n8n Basics", "Fall 2025 - Advanced"
- Specific start/end dates
- Specific student roster
- One teacher per cohort (typically)

**Your Role:** Manage student roster, set pacing, track progress

#### Lessons
**Definition:** Individual learning units within a course
- Video content
- Text/readings
- Practice exercises
- Assignments/quizzes
- Discussion prompts

**Your Role:** Create and organize lessons in course builder

#### Enrollments
**Definition:** Record of student participation in a cohort
- Tracks progress
- Records activity
- Stores performance data

**Your Role:** Monitor enrollments, provide support

#### Assessments
**Definition:** Quizzes, assignments, projects for evaluating learning
- Auto-graded quizzes
- Instructor-graded assignments
- Group projects
- Final assessments

**Your Role:** Create assessments, grade submissions, provide feedback

---

## Teaching Dashboard

### Accessing the Dashboard

**URL:** `/teacher/courses`

**How to Navigate:**
1. Log in to C4C Campus
2. Click "Teacher Dashboard" in navigation
3. OR go directly to URL above
4. Dashboard loads with your courses and stats

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│                 TEACHER DASHBOARD HEADER                │
│ [Logo] Teacher Dashboard │ [Progress] [Browse] [Logout]│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ STATISTICS CARDS                                        │
│ [📚 My Courses: 5] [✅ Published: 3] [📝 Drafts: 2]    │
│ [👥 Total Students: 48]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TAB NAVIGATION                                          │
│ [My Courses] [Edit Course] [Cohort Management]        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TAB CONTENT (Changes based on selected tab)            │
│ [Content for active tab displays here]                │
└─────────────────────────────────────────────────────────┘
```

### Statistics Cards

**My Courses:** Total number of courses you've created
- Includes published and draft courses
- Click to see course list

**Published:** Number of courses available to students
- Students can enroll in these
- Click for quick view of published courses

**Drafts:** Courses still in development
- Not yet available to students
- Click to edit or prepare for publishing

**Total Students:** Sum of all enrolled students across all cohorts
- Real-time count
- Updates as students enroll/withdraw

### Dashboard Tabs

#### Tab 1: My Courses
**Purpose:** View and manage all your courses

**What You See:**
- Course name
- Course status (Published/Draft)
- Number of enrolled students
- Number of cohorts
- Difficulty level
- Track/topic

**Actions Available:**
- Edit course
- View course
- Manage cohorts
- Delete course (if no enrollments)
- Create new course

#### Tab 2: Edit Course
**Purpose:** Create or modify course content and structure

**What You Can Do:**
- Add course information
- Create course structure
- Add lessons and content
- Configure assessments
- Set course settings
- Publish course

#### Tab 3: Cohort Management
**Purpose:** Manage student cohorts and enrollment

**What You Can Do:**
- Create new cohorts
- Edit cohort details
- View student roster
- Manage enrollment
- Set cohort dates
- Configure access

---

## Working with Cohorts

### What Is a Cohort?

A **cohort** is a specific group of students taking a course together with defined start/end dates.

**Key Elements:**
- Course: Which course students are taking
- Students: Who is enrolled
- Timeline: Start and end dates
- Pace: Weekly, bi-weekly, custom
- Status: Upcoming, active, or completed

### Creating a Cohort

**Step 1: Navigate to Cohort Management**
1. Go to Teacher Dashboard
2. Click "Cohort Management" tab
3. Click "Create New Cohort" button

**Step 2: Fill in Cohort Information**

```
COHORT CREATION FORM

Course*               [Select Course ▼]
Cohort Name*          [e.g., "Spring 2025 Cohort"]
Start Date*           [March 1, 2025]
End Date              [May 31, 2025] (optional)
Max Students          [50] (default)
Schedule Type*        [Weekly ▼]
```

**Step 3: Add Students**
- Upload student roster (CSV)
- OR manually add students by email
- OR send enrollment link for self-enrollment

**Step 4: Configure Settings**
- Set access controls
- Enable/disable features
- Configure notifications
- Set grading parameters

**Step 5: Review & Create**
1. Review all information
2. Click "Create Cohort"
3. Cohort created and ready to go!

### Editing a Cohort

**What You Can Change:**
- Cohort name
- End date (can extend)
- Max students
- Description
- Communication settings

**What You Cannot Change:**
- Course (select different course)
- Start date (to maintain history)
- Created date

**How to Edit:**
1. Go to Cohort Management tab
2. Find cohort in list
3. Click "Edit" button
4. Modify fields
5. Click "Save Changes"

### Cohort Status

#### Upcoming
- Start date is in future
- Students can enroll but course not active
- You can still edit most settings

**Actions Available:**
- Add students
- Edit dates
- Edit content
- Preview course
- Manage access

#### Active
- Today is between start and end date
- Students can participate
- Content is being delivered

**Actions Available:**
- View student progress
- Monitor engagement
- Provide support
- Manage roster changes
- Limited content editing

#### Completed
- End date has passed
- Archive content is preserved
- Limited editing possible

**Actions Available:**
- View final progress
- Export grades
- Access student work
- Access discussion archives
- Create new cohort for repeat

---

## Creating & Managing Courses

### Course Structure

```
COURSE HIERARCHY

Course (e.g., "n8n Basics")
├── Module 1: Getting Started
│   ├── Lesson 1.1: What is n8n?
│   │   ├── Video
│   │   ├── Reading
│   │   └── Quiz
│   └── Lesson 1.2: Setting Up n8n
│       ├── Video
│       ├── Practice Exercise
│       └── Assignment
├── Module 2: Core Concepts
│   ├── Lesson 2.1: Nodes
│   ├── Lesson 2.2: Connections
│   └── Lesson 2.3: Workflows
└── Module 3: Advanced Topics
    ├── Lesson 3.1: API Integration
    ├── Lesson 3.2: Database Operations
    └── Lesson 3.3: Final Project
```

### Creating a Course

**Step 1: Start Course Creation**
1. Go to Teacher Dashboard
2. Click "Edit Course" tab
3. Click "Create New Course"

**Step 2: Course Information**

```
COURSE CREATION FORM

Course Name*          [e.g., "n8n Workflow Automation"]
Description           [Detailed course description]
Track*                [Animal Advocacy ▼]
Difficulty*           [Beginner ▼]
Estimated Hours       [40]
URL Slug*             [n8n-workflow-automation]
```

**Step 3: Add Course Content**
1. Create modules
2. Add lessons to modules
3. Add content to each lesson
4. Configure assessments

**Step 4: Configure Course Settings**
- Prerequisites (if any)
- Required materials
- Grading scale
- Completion requirements
- Student feedback

**Step 5: Preview & Test**
1. Preview course as student
2. Test all links and content
3. Check for accessibility
4. Verify functionality

**Step 6: Publish**
1. Review checklist
2. Click "Publish Course"
3. Course now available for cohort enrollment

### Adding Content to Lessons

#### Video Content
1. Click "Add Video"
2. Enter video URL (YouTube, Vimeo, etc.)
3. Add title and description
4. Set duration (optional)
5. Configure transcript/captions
6. Save

**Supported Platforms:**
- YouTube
- Vimeo
- Wistia
- Video links (MP4, WebM)

#### Text Content
1. Click "Add Reading"
2. Enter text content
3. Use rich text editor for formatting
4. Add images or embeds
5. Save

#### Practice Exercises
1. Click "Add Practice"
2. Create problem/prompt
3. Set up answer field
4. Configure hints (optional)
5. Set answer key
6. Save

#### Assignments
1. Click "Add Assignment"
2. Create assignment prompt
3. Set submission type (file, text, etc.)
4. Set due date
5. Configure grading rubric
6. Save

#### Quizzes
1. Click "Add Quiz"
2. Create quiz questions
3. Set answer options
4. Specify correct answers
5. Configure grading
6. Set time limit (optional)
7. Save

### Managing Course Content

#### Updating Content
1. Click "Edit Course"
2. Select lesson to modify
3. Click "Edit" on content
4. Make changes
5. Save changes
6. Changes live immediately

#### Reordering Content
1. Click "Edit Course"
2. Use drag-and-drop to reorder
3. OR use order arrows
4. Changes save automatically

#### Removing Content
1. Click "Edit Course"
2. Find content to remove
3. Click delete button
4. Confirm deletion
5. Content removed permanently

#### Archiving Content
- For content you might reuse but don't want active
- Content stays in archive for reference
- Students cannot access archived content

---

## Managing Students

### Student Roster

**Access:** Cohort Management tab → Select cohort → View Roster

**Information Displayed:**
- Student name and email
- Enrollment date
- Current progress
- Last activity
- Engagement score
- Status (Active/Paused/Dropped)

### Adding Students to Cohort

#### Method 1: Invite by Email
1. Open cohort
2. Click "Add Students"
3. Enter email addresses (one per line)
4. Click "Send Invitations"
5. Students receive invitation to enroll

#### Method 2: Upload Roster
1. Open cohort
2. Click "Upload Roster"
3. Select CSV file with student emails
4. Verify data
5. Click "Import"
6. Students added/invited in bulk

#### Method 3: Share Enrollment Link
1. Open cohort
2. Click "Enrollment Settings"
3. Copy enrollment link
4. Share with students
5. Students click link to enroll

#### Method 4: Manual Enrollment
1. Open cohort
2. Click "Add Students" → "Manual Entry"
3. Search for student
4. Click to add to cohort
5. Confirm

### Removing Students from Cohort

**Step 1: Open Student's Record**
- Find student in roster
- Click on student name

**Step 2: Manage Enrollment**
- Click "Remove from Cohort"
- Choose reason (optional)
- Confirm removal

**Step 3: Student Data**
- Progress saved in archive
- Can still view student's work
- Student loses access to course

**Notes:**
- Cannot delete students, only remove from cohort
- Student data is preserved
- Can re-enroll student later if needed

### Communicating with Students

#### Individual Messages
1. Open student's profile
2. Click "Send Message"
3. Type message
4. Click "Send"
5. Message appears in student's inbox

#### Class Announcements
1. Open cohort
2. Click "Create Announcement"
3. Type announcement
4. Choose visibility (all students/specific group)
5. Click "Post"
6. All selected students notified

#### Email Communication
- Use email for formal communication
- Reference specific students with their names
- Keep tone professional and supportive
- Archive important emails

---

## Using Analytics

### Progress Dashboard

**Access:** `/teacher/progress`

**Key Features:**
- Cohort performance overview
- Student progress visualization
- At-risk student identification
- Leaderboard of top performers
- Data export capability

**Metrics Displayed:**
- Average progress percentage
- Course completion rate
- Total enrolled students
- Number of at-risk students
- Individual student progress

**How to Use:**
1. Log in to teacher account
2. Navigate to Progress Dashboard
3. Select cohort from dropdown
4. Review analytics
5. Identify students needing support
6. Export data as needed

### Student Roster Analytics

**What You Can See:**
- Progress for each student
- Last activity timestamp
- Engagement score
- Lessons completed
- Assessment performance

**Analysis You Can Do:**
- Sort by progress (high/low)
- Filter by status
- Search for specific students
- Identify struggling students
- Recognize high performers

**Actions You Can Take:**
- Click student to view details
- Send support messages
- Adjust timeline/deadlines
- Provide resources
- Document interventions

### Data Export

**Export Options:**
1. Click "Export CSV" button
2. Choose export type:
   - Full roster
   - Struggling students only
   - Top performers only
3. File downloads to computer
4. Open in Excel/Sheets for analysis

**Exported Data Includes:**
- Student name, email
- Progress percentage
- Lessons completed
- Engagement score
- Last activity date
- Status

---

## Communication & Support

### Best Practices for Teacher Communication

#### Email Communication
```
PROFESSIONAL EMAIL TEMPLATE

Subject: [Course Name] - [Clear Topic]

Hi [Student Name],

[Friendly greeting and context]

[Main message/content]

[Specific next steps if applicable]

[Closing with your availability]

Best,
[Your Name]
[Your Title]
[Contact Information]
```

#### Discussion Forum Moderation
- Monitor daily for active cohorts
- Respond to questions within 24 hours
- Encourage peer-to-peer discussion
- Keep conversations on-topic
- Model respectful communication
- Celebrate student contributions

#### Feedback on Assignments
```
EFFECTIVE FEEDBACK FRAMEWORK

WHAT THEY DID WELL:
- Acknowledge specific strengths
- Be specific, not generic
- Show you read their work carefully

WHAT COULD IMPROVE:
- Frame as growth opportunity
- Specific examples help
- Actionable suggestions

ENCOURAGEMENT:
- Reinforce that practice builds skill
- Highlight progress
- Motivate continued effort
```

### Office Hours

#### Setting Up Office Hours
1. Choose regular time(s) each week
2. Set duration (typically 1-2 hours)
3. Choose platform (Zoom, Meet, Teams, etc.)
4. Share link with students
5. Keep consistent schedule

#### Effective Office Hours
- Start on time
- Be prepared to discuss course concepts
- Help students problem-solve, not just give answers
- Keep notes on common questions
- Record if students request (with permission)

#### Drop-in vs. Scheduled
**Drop-in:**
- Students log in anytime during window
- Good for community building
- Less predictable attendance

**Scheduled:**
- Students reserve time slot
- Good for detailed discussions
- Better preparation possible

---

## Best Practices

### Course Design Best Practices

#### Lesson Structure
```
EFFECTIVE LESSON STRUCTURE

1. INTRODUCTION (5 minutes)
   - Learning objectives
   - Real-world context
   - Why this matters

2. CONTENT DELIVERY (15-20 minutes)
   - Video, reading, or interactive content
   - Clear explanations
   - Examples and context

3. PRACTICE (10-15 minutes)
   - Guided exercises
   - Immediate feedback
   - Low-stakes practice

4. ASSESSMENT (5-10 minutes)
   - Comprehension check
   - Applied practice
   - Student confidence

5. SUMMARY (5 minutes)
   - Key takeaways
   - Next lesson preview
   - Reflection prompt
```

#### Content Quality
- Use varied content types (video, text, interactive)
- Keep videos under 10 minutes (optimal engagement)
- Include captions and transcripts
- Provide downloadable resources
- Update content regularly (at least quarterly)
- Test all links and content before publishing

#### Accessibility
- Use alt text for images
- Provide transcripts for videos
- Ensure color contrast meets standards
- Support screen readers
- Make content mobile-friendly
- Offer multiple content formats

### Teaching Best Practices

#### Building Community
- Welcome message to each cohort
- Encourage introductions
- Create discussion prompts
- Celebrate diversity
- Encourage peer interaction
- Model collaborative learning

#### Clear Expectations
- Explain grading clearly
- Publish schedule early
- Define participation expectations
- Clarify time commitment
- Explain assessment criteria
- Be explicit about communication norms

#### Feedback & Assessment
- Provide timely feedback (within 3-5 days)
- Be specific in comments
- Balance criticism with encouragement
- Use rubrics for consistency
- Provide models/examples
- Allow revision when appropriate

#### Time Management
- Set specific office hours
- Establish response time norms
- Batch grading for efficiency
- Use templates for efficiency
- Schedule preparation time
- Maintain work-life balance

### Student Support Best Practices

#### Early Intervention
- Check in with students frequently
- Identify struggling students early
- Proactive outreach beats reactive
- Document all interventions
- Follow up on support provided
- Celebrate improvements

#### Inclusive Teaching
- Learn student names and preferences
- Accommodate different learning styles
- Provide multiple ways to engage
- Support diverse backgrounds
- Be culturally responsive
- Welcome questions and feedback

#### Building Relationships
- Use discussion forums actively
- Respond to student posts
- Share your expertise and passion
- Be authentic and real
- Show genuine care for student success
- Create psychological safety

---

## Advanced Features

### Grading & Assessments

#### Setting Up Grading
1. Define grading scale (A-F, points, percentage)
2. Create grading rubric
3. Assign weights to categories
4. Configure automatic grading for quizzes
5. Set grade visibility for students

#### Providing Feedback
1. Review student submission
2. Select rubric criteria
3. Add comments
4. Assign grade
5. Provide overall feedback
6. Submit grade
7. Student notified automatically

#### Viewing Grades
- Individual gradebook per student
- Class-wide grade view
- Filter by assignment
- Export grades
- Identify struggling students

### Discussion Forums

#### Creating Discussion Forums
1. Create forum within course
2. Name the forum
3. Add forum description/guidelines
4. Set posting permissions
5. Configure grading (if applicable)

#### Moderating Discussions
- Monitor for appropriate tone
- Redirect off-topic discussions
- Encourage participation
- Answer questions
- Highlight good examples
- Provide corrections if needed

#### Using Discussions Effectively
- Create structured prompts
- Make discussions low-stakes
- Respond to every post
- Encourage peer response
- Use discussions to assess learning
- Build community through discourse

### Announcements & Notifications

#### Creating Announcements
1. Navigate to cohort
2. Click "Create Announcement"
3. Type announcement
4. Add image/media if desired
5. Choose audience (all students/specific groups)
6. Schedule if desired
7. Post announcement

#### Notification Settings
- Configure which events trigger notifications
- Set notification frequency
- Choose notification method (email, SMS)
- Allow students to customize notifications
- Ensure important updates are not missed

---

## Quick Reference

### Common Tasks Cheat Sheet

#### Logging In
- URL: https://c4c.org/login
- Use email and password
- Enable 2-factor if available

#### Accessing Key Pages
- Teacher Dashboard: `/teacher/courses`
- Progress Analytics: `/teacher/progress`
- Student Profile: Click student name from roster
- Course Editor: Dashboard → Edit Course tab

#### Quick Actions
```
CREATE NEW COURSE:
Dashboard → Edit Course tab → Create New Course

CREATE NEW COHORT:
Dashboard → Cohort Management tab → Create New Cohort

ADD STUDENTS:
Dashboard → Cohort Management → Select cohort → Add Students

VIEW PROGRESS:
Dashboard → Progress button OR /teacher/progress

SEND ANNOUNCEMENT:
Dashboard → Select cohort → Announcements → Create New

GRADE ASSIGNMENT:
Dashboard → Select cohort → Assignments → Click assignment → Grade

MESSAGE STUDENT:
Dashboard → View Roster → Click student → Send Message
```

### Keyboard Shortcuts

```
NAVIGATION
Ctrl+K (Mac: Cmd+K): Quick search
Ctrl+H (Mac: Cmd+H): Go to home
Ctrl+? (Mac: Cmd+?): Help/keyboard shortcuts

WITHIN FORMS
Tab: Move to next field
Shift+Tab: Move to previous field
Enter: Submit form
Escape: Close dialog
```

### Support Resources

```
WHEN YOU NEED HELP:

General Questions:
- Email: support@c4c.org
- Chat: In-app support chat
- FAQ: https://c4c.org/help

Technical Issues:
- IT Support: tech@c4c.org
- Check system status: https://status.c4c.org

Student/Pedagogy Questions:
- Professional development: https://c4c.org/training
- Teaching resources: https://c4c.org/resources
- Community forum: https://forum.c4c.org

Emergency Support:
- Phone: [Support phone number]
- Available: [Support hours]
```

---

## Training Completion

### Knowledge Check

Test your understanding of key concepts:

```
1. What are the main three tabs on the teacher dashboard?
   a) My Courses, Edit Course, Cohort Management ✓
   b) Courses, Students, Grades
   c) Dashboard, Analytics, Settings

2. How often should you check the Progress Dashboard?
   a) Weekly
   b) Daily for active cohorts ✓
   c) Monthly

3. What information helps identify at-risk students?
   a) Progress percentage and last activity ✓
   b) Only grades
   c) Attendance only

4. When should you reach out to a struggling student?
   a) Only at end of course
   b) After they've failed
   c) As soon as you notice warning signs ✓

5. What's the best format for course lessons?
   a) All text
   b) All video
   c) Mixed content types ✓
```

### Certification

Upon completing this training:
- You understand the C4C platform
- You can create courses and cohorts
- You know how to support student success
- You understand analytics and interventions
- You have resources for ongoing support

**Next Steps:**
1. Review the three detailed guides:
   - Student Roster Guide
   - Progress Dashboard Guide
   - Identifying Struggling Students Guide
2. Set up your first course
3. Create your first cohort
4. Connect with support team
5. Start teaching!

---

## Support & Continued Learning

### Resources for Teachers

- **Student Roster Guide**: `/docs/guides/student-roster.md`
- **Progress Dashboard Guide**: `/docs/guides/progress-dashboard.md`
- **Struggling Students Guide**: `/docs/guides/identifying-struggling-students.md`
- **Community Forum**: `forum.c4c.org`
- **Training Videos**: `https://c4c.org/training/videos`

### Getting Help

**Quick Support:** In-app chat (bottom right)
**Email Support:** support@c4c.org
**Community:** forum.c4c.org/teacher-lounge
**Professional Development:** training@c4c.org

---

**Training Version:** 1.0
**Last Updated:** March 2025
**Next Review:** September 2025

Welcome to C4C Campus teaching community! We're excited to support you in making a difference in your students' lives.

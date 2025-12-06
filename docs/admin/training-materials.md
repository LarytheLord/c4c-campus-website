# Admin Training Materials

## Welcome to C4C Campus Administration

This training guide prepares new admins to effectively manage the C4C Campus platform. Complete all sections before assuming full admin responsibilities.

## Training Modules

### Module 1: Access and Setup (30 minutes)

#### Objectives
- Understand admin authentication
- Navigate admin interfaces
- Verify correct access level

#### Getting Started

1. **Login to Platform**
   - Visit c4c-campus.com
   - Enter admin email and password
   - Accept MFA if configured

2. **Verify Admin Access**
   - Navigate to `/admin/dashboard`
   - If "Access Denied" message: Contact senior admin
   - Dashboard should load with statistics

3. **Check Permissions**
   - You should see 4 admin sections in header
   - Dashboard, Users, Applications, Analytics
   - All sections should be accessible

4. **Test Navigation**
   - Click each admin section
   - Verify pages load correctly
   - Practice moving between sections

#### Common Issues
- **401 Unauthorized:** Not logged in, login again
- **403 Forbidden:** Not admin, contact admin team
- **Blank pages:** Clear cache, refresh browser
- **Network errors:** Check internet connection

#### Duration: 30 minutes
- 10 min: Login and access verification
- 10 min: Navigation exploration
- 10 min: Permission verification

### Module 2: Understanding User Roles (30 minutes)

#### Objectives
- Learn three user roles
- Understand when to assign each role
- Recognize responsibilities

#### User Roles Overview

**Students**
- Learn from courses
- Submit assignments
- Participate in cohorts
- Default role for applicants
- **Assign to:** Course learners

**Teachers**
- Create and manage courses
- Monitor student progress
- Grade assignments
- Participate in moderation
- **Assign to:** Content creators and instructors

**Admins**
- Full platform access
- Manage users and roles
- Review applications
- Access analytics
- **Assign to:** Senior team only (limited)

#### When to Assign Roles

| Situation | Role | Reason |
|-----------|------|--------|
| New applicant approved | Student | Access to courses |
| Content creator joins | Teacher | Can create courses |
| Senior team member joins | Admin | Full platform access |
| Promoting student | Teacher | Wants to teach |
| Removing admin status | Student/Teacher | Security or departure |

#### Practice Exercise

1. Go to User Management (`/admin/users`)
2. Find a test user
3. Change their role to Teacher
4. Change back to Student
5. Refresh page and verify change persisted

#### Duration: 30 minutes
- 10 min: Understanding roles
- 10 min: Assignment criteria
- 10 min: Hands-on practice

### Module 3: Processing Applications (45 minutes)

#### Objectives
- Review applications systematically
- Make consistent approval decisions
- Use bulk operations efficiently

#### The Review Workflow

**Step 1: Filter for Review Batch**
- Go to Applications (`/admin/applications`)
- Filter: Status = "Pending"
- Choose Program filter (or All)
- Results show applications awaiting decision

**Step 2: Review Each Application**
- Read applicant information
- Click "View Details" for full text
- Assess fit for program
- Check for completeness
- Verify contact information

**Step 3: Make Decision**
- **Approve:** Good fit, ready for platform
- **Reject:** Not suitable, previous experience, or other reasons
- **Waitlist:** Good but no current capacity

**Step 4: Document (Optional)**
- Keep personal notes on decisions
- Reference for future applicants
- Help identify patterns

**Step 5: Move to Next**
- Repeat until all pending reviewed
- Monitor dashboard for new applications
- Set regular review schedule

#### Review Criteria

Create your evaluation matrix. Example:

| Criteria | Weight | Excellent | Good | Fair | Poor |
|----------|--------|-----------|------|------|------|
| Program Fit | 30% | Perfect match | Good alignment | Some fit | No alignment |
| Experience | 25% | Highly relevant | Relevant | Basic | None |
| Motivation | 25% | Clear, compelling | Stated | Vague | Unclear |
| Commitment | 20% | Full-time | Part-time | Flexible | Uncertain |

#### Bulk Operations Practice

1. Filter to small test set (3-5 pending applications)
2. Check boxes to select applications
3. Click "Approve Selected"
4. Confirm operation
5. Verify status changed to "Approved"
6. Check statistics updated

#### Decision Documentation

Suggested approach:
- Create simple spreadsheet tracking decisions
- Record: Applicant name, decision, brief reason, date
- Share with team for consistency
- Update monthly review process

#### Duration: 45 minutes
- 15 min: Understanding workflow
- 15 min: Reviewing sample applications
- 15 min: Bulk operations practice

### Module 4: Managing Users Effectively (30 minutes)

#### Objectives
- Perform user management tasks
- Use filters and search efficiently
- Execute bulk operations safely

#### User Management Interface

**Key Components:**
- Search by name/email
- Role filter dropdown
- Bulk action buttons
- Selection checkbox system
- User table with sortable columns

#### Common Tasks

**Find a Specific User**
1. Use search field
2. Type name or email
3. Results filter in real-time
4. Click to select

**Promote Multiple Users**
1. Use role filter: "Students"
2. Check boxes for users to promote
3. Click "Make Teachers"
4. Confirm in dialog
5. All selected promoted at once

**Audit Admin Access**
1. Filter role: "Admins"
2. Review list of all admins
3. Verify each should have access
4. Document review date

**Manage Inactive Users**
1. Sort by "Joined" date
2. Find very old accounts (1+ years)
3. Determine if still active
4. Consider role downgrade

#### Safety Practices

**Before Role Changes:**
- Verify you have admin status
- Double-check user identity
- Confirm change is intentional
- Review who else has access

**For Bulk Operations:**
- Start with small batches
- Preview selections before confirming
- Never select "All" without review
- Document bulk operations performed

#### Practice Exercise

1. Navigate to Users (`/admin/users`)
2. Search for a test user
3. Filter by role
4. Select 2-3 users
5. Perform bulk action (don't confirm if production)
6. Cancel operation without saving

#### Duration: 30 minutes
- 10 min: Interface walkthrough
- 10 min: Common tasks
- 10 min: Practice exercise

### Module 5: Reading Platform Analytics (30 minutes)

#### Objectives
- Interpret key metrics
- Identify trends
- Use data for decisions

#### Key Metrics Overview

**User Metrics:**
- Total Students: Platform reach
- Active Enrollments: Current engagement
- Completion Rate: Success indicator

**Engagement Metrics:**
- Total Watch Time: Usage intensity
- Course Popularity: Student preferences
- Cohort Performance: Group success

#### Understanding Dashboards

**Enrollment Trend**
- Shows growth rate over 30 days
- Rising line = more enrollments
- Plateau = stable enrollment
- Declining = concerning trend

**Top Courses**
- Most popular by enrollment
- Indicates student interest
- Informs content strategy
- Shows resource needs

**Completion Rates**
- Measures success
- Higher is better
- Identify struggling courses
- Plan improvements

**Role Distribution**
- Shows user composition
- Balance critical
- Too many admins = risk
- Too few teachers = constraint

#### Using Data for Decisions

**Questions to Ask:**
1. Is enrollment growing? (Check trend)
2. Are students completing? (Check rates)
3. Which courses are popular? (Check bar chart)
4. Is user balance healthy? (Check role distribution)

**Actions Based on Data:**
- Declining enrollment → Improve marketing
- Low completion → Review course content
- Unpopular courses → Consider retiring
- Too many admins → Review and reduce access

#### Practice Analysis

1. Go to Analytics (`/admin/analytics`)
2. Read each metric value
3. Interpret the trend
4. Write 3 observations (what you notice)
5. Suggest one action based on data

#### Duration: 30 minutes
- 10 min: Metrics overview
- 10 min: Interpreting charts
- 10 min: Practice analysis

## Training Schedule

### Week 1: Fundamentals
- Day 1: Module 1 (Access and Setup)
- Day 2: Module 2 (User Roles)
- Day 3-5: Module 3 (Applications) - with supervision

### Week 2: Operations
- Day 1: Module 4 (User Management)
- Day 2: Module 5 (Analytics)
- Day 3-5: Supervised practice on both systems

### Week 3: Independence
- Days 1-5: Perform tasks with check-ins
- Mentor available for questions
- Document any issues

## Success Criteria

### Knowledge Assessment

- [ ] Explain three user roles and when to assign each
- [ ] Walk through complete application review workflow
- [ ] Describe how to use filters and search
- [ ] Interpret key metrics from analytics
- [ ] Explain at least 2 bulk operations

### Skills Assessment

- [ ] Successfully login and access admin panel
- [ ] Change user roles individually and in bulk
- [ ] Review and approve sample applications
- [ ] Filter data by multiple criteria
- [ ] Read and interpret charts

### Practical Assessment

- [ ] Demonstrate 5 core admin tasks
- [ ] Handle at least one error/problem independently
- [ ] Document findings from analytics review
- [ ] Follow all safety protocols
- [ ] Communicate decisions appropriately

## Ongoing Development

### Weekly Tasks
- Review and process pending applications
- Check analytics for trends
- Audit user roles quarterly
- Monitor system health

### Monthly Tasks
- Review platform statistics
- Analyze enrollment trends
- Audit admin access
- Document decisions made

### Quarterly Tasks
- Comprehensive analytics review
- User role audit
- Performance assessment
- Plan improvements

## Quick Reference Card

### Keyboard Shortcuts
- Ctrl+K: Focus search (most interfaces)
- Ctrl+S: Save (where applicable)
- F5: Refresh page
- F12: Open developer console

### Important URLs
- Admin Dashboard: `/admin/dashboard`
- User Management: `/admin/users`
- Application Review: `/admin/applications`
- Analytics: `/admin/analytics`

### Emergency Contacts
- Senior Admin: [Contact info]
- Technical Support: [Support email]
- Database Issues: [DBA contact]

## Mentorship

### During Training
- Mentor available during all practice sessions
- Ask questions before taking actions
- Shadow mentor on actual operations
- Document learnings

### After Training
- Check-ins at 1 week, 1 month, 3 months
- Ongoing support for edge cases
- Annual refresher training
- Advanced training on demand

## Certification

Upon completing all modules and assessments:

- [ ] Training completed date: ___________
- [ ] Knowledge assessment passed: ___________
- [ ] Skills assessment passed: ___________
- [ ] Practical assessment passed: ___________
- [ ] Mentor sign-off: ___________

**Certified Admin:** _________________________ Date: _________


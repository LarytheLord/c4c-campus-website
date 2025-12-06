# Admin Quick Reference Guide

## Platform URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/admin/dashboard` | Platform overview & statistics |
| **Users** | `/admin/users` | User management & roles |
| **Applications** | `/admin/applications` | Review & manage applications |
| **Analytics** | `/admin/analytics` | Platform insights & metrics |

## Core Admin Tasks

### Task 1: Check Platform Health
**Time:** 5 minutes | **Location:** Admin Dashboard

1. Go to `/admin/dashboard`
2. Review Overview Statistics
3. Check System Health status
4. Note any concerning metrics

### Task 2: Review Applications
**Time:** 15-30 minutes | **Location:** Applications

1. Go to `/admin/applications`
2. Filter: Status = "Pending"
3. Read application
4. Click Approve/Reject/Waitlist
5. Move to next

### Task 3: Manage User Roles
**Time:** 5-10 minutes | **Location:** Users

1. Go to `/admin/users`
2. Search for user (optional)
3. Select user in table
4. Click role dropdown
5. Select new role
6. Confirm change

### Task 4: Analyze Platform
**Time:** 10-15 minutes | **Location:** Analytics

1. Go to `/admin/analytics`
2. Read key metrics
3. Review charts
4. Identify trends
5. Document observations

## Admin Roles Explained

### Student Role
- **Access:** Course materials, assignments
- **Cannot:** Manage courses, see admin tools
- **Assign to:** Course learners
- **Default role for:** New applicants

### Teacher Role
- **Access:** Create courses, view progress
- **Cannot:** Manage users, review applications
- **Assign to:** Content creators
- **Promote from:** Students ready to teach

### Admin Role
- **Access:** Full platform access
- **Cannot:** Be limited (full access)
- **Assign to:** Senior team members only
- **Responsibilities:** System administration

## Key Metrics at a Glance

| Metric | What It Means | Good Range |
|--------|---------------|------------|
| Total Users | Platform size | Growing |
| Pending Apps | Work to do | <50 |
| Total Courses | Content library | 5+ |
| Active Cohorts | Groups learning | 1+ |
| Completion Rate | Student success | 60%+ |
| Watch Time | Engagement level | Growing |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| F5 | Refresh page |
| F12 | Open developer tools |
| Ctrl+F | Find on page |
| Ctrl+Shift+R | Hard refresh (clear cache) |

## Common Decisions

### When to Approve Application
- Good program fit
- Clear motivation
- Complete information
- Suitable background

### When to Reject Application
- Poor program fit
- Incomplete information
- Does not meet requirements
- Concerning background

### When to Waitlist Application
- Good applicant
- Program full
- No current spots
- Keep for future cohorts

### When to Change Role to Teacher
- Wants to create content
- Has relevant expertise
- Committed to teaching
- Good reputation

### When to Change Role to Admin
- Senior team member
- Trusted and experienced
- Needs full access
- Emergency only (limit admins)

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Page won't load | Refresh (F5) |
| Missing data | Clear cache (Ctrl+Shift+R) |
| Can't login | Check capslock, reset password |
| Buttons not working | Refresh page |
| Changes not visible | Wait 30 sec, then refresh |

## Batch Operations

### Approve 10 Pending Applications
1. Go to `/admin/applications`
2. Filter: Pending
3. Check 10 checkboxes
4. Click "Approve Selected"
5. Confirm in dialog

### Promote Students to Teachers
1. Go to `/admin/users`
2. Filter: Students
3. Select desired users
4. Click "Make Teachers"
5. Confirm in dialog

### Change Admin
1. Go to `/admin/users`
2. Filter: Admins
3. Find user
4. Click role dropdown
5. Select new role
6. Confirm carefully

## Safety Rules

1. **Never** change your own role
2. **Always** verify before bulk operations
3. **Confirm** important decisions
4. **Document** major actions
5. **Communicate** with team
6. **Backup** before big changes

## Emergency Contacts

| Situation | Contact |
|-----------|---------|
| System down | support@c4c-campus.com |
| Database issue | dba@c4c-campus.com |
| Security concern | security@c4c-campus.com |
| General help | admin-team@c4c-campus.com |

## Quick Checklists

### Daily (5-10 min)
- [ ] Check dashboard health
- [ ] Review pending app count
- [ ] Note critical issues
- [ ] Plan tasks for day

### Weekly (30-45 min)
- [ ] Process all pending apps
- [ ] Review user analytics
- [ ] Audit admin access
- [ ] Document changes

### Monthly (2-3 hours)
- [ ] Comprehensive review
- [ ] Full analytics review
- [ ] User role audit
- [ ] Plan improvements

## Common Issues and Fixes

**"Access Denied"**
- Verify you're logged in
- Check your role is admin
- Try incognito window

**"Page Won't Load"**
- Refresh (F5)
- Clear cache (Ctrl+Shift+R)
- Check internet connection

**"Change Won't Save"**
- Verify admin access
- Check network tab for errors
- Try again in new tab

**"Data Looks Wrong"**
- Wait 30 seconds
- Refresh page
- Check with another admin

## File Locations

**Documentation Base:** `/docs/admin/`

| File | Purpose |
|------|---------|
| `README.md` | Index & overview |
| `admin-dashboard.md` | Dashboard guide |
| `user-management.md` | User management |
| `application-review.md` | Application workflow |
| `analytics.md` | Metrics & charts |
| `training-materials.md` | Training program |
| `troubleshooting.md` | Problem solving |
| `backup-restore-procedures.md` | Data protection |
| `QUICK_REFERENCE.md` | This file |

## Decision Matrix

### Application Status Decisions

```
┌─ Is complete & clear fit?
├─ Yes → APPROVE
├─ No ──┐
│       ├─ Program full?
│       ├─ Yes → WAITLIST
│       ├─ No ──┐
│               └─ Poor fit/incomplete?
│                  └─ REJECT
```

### User Role Decisions

```
┌─ New user needs access?
├─ Wants to learn → STUDENT
├─ Wants to teach → TEACHER
├─ Manages platform → ADMIN (careful!)
└─ Uncertain? → Start with STUDENT
```

## Performance Tips

### Faster Workflow
1. Use filters liberally
2. Use bulk operations
3. Work in batches
4. Keep applications grouped
5. Process daily (not weekly)

### Bulk Operations
- More efficient than individual
- Always verify before confirming
- Cannot be easily undone
- Great for same decisions

### Smart Searching
- Use email to find specific user
- Use name for person search
- Clear filters when not needed
- Reset to "All" to see everything

## Data Access Rules

**As an Admin You Can:**
- View all users
- View all applications
- View all courses
- Change any user role
- Approve/reject applications
- Access all analytics

**As an Admin You Cannot:**
- Change own role
- Delete accounts (use DB)
- Change passwords directly
- See user passwords
- Access private messages

## Keyboard Shortcuts by Page

### All Pages
- F5 = Refresh
- Ctrl+F = Find on page

### User Management
- Click user = Select
- Ctrl+Click = Multi-select

### Applications
- Click app = View details
- Shift+Click = Range select

## Quick Tips

1. **Weekly Processing**
   - Do it same day each week
   - Set calendar reminder
   - Batch similar decisions
   - Document batch total

2. **Bulk Operations**
   - Test with small batch first
   - Then do larger batches
   - Faster than individual changes

3. **Analytics Review**
   - Check monthly trends
   - Document key changes
   - Share insights with team
   - Use for planning

4. **Team Communication**
   - Tell team about changes
   - Share metrics weekly
   - Discuss decisions
   - Document major actions

## Success Metrics

**You're doing well when:**
- Pending apps < 10 at any time
- Processing takes <30 min/week
- Admins < 5 (or justified)
- Users see responsive system
- No major errors/complaints
- Analytics improving monthly

## When to Escalate

**Contact another admin if:**
- Unsure about decision
- User disputes decision
- System misbehaving
- Data looks wrong
- Need role verification

**Contact technical support if:**
- Page won't load
- Buttons don't work
- Database seems down
- Error messages appear
- Data missing or corrupted

## Resources

**Need more details?** See full documentation:
- Dashboard Guide: `admin-dashboard.md`
- User Guide: `user-management.md`
- Applications: `application-review.md`
- Analytics: `analytics.md`
- Troubleshooting: `troubleshooting.md`

**Need training?** See:
- Training Materials: `training-materials.md`

**Need to recover data?** See:
- Backup & Restore: `backup-restore-procedures.md`

---

**Print this page as a quick desk reference!**

Updated: October 29, 2025

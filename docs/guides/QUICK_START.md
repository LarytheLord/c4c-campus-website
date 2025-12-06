# Quick Start Guide - Cohorts & Time-Gating

Get started with cohorts in 5 minutes!

## For Students: Enroll in a Cohort

### 1. Log In
```
Go to: https://your-domain.com/login
Enter your email and password
```

### 2. Browse Courses
```
Click: Courses → Find your course
```

### 3. View Cohorts
```
Click: View Cohorts
See available cohorts with start dates and capacity
```

### 4. Enroll
```
Click: Enroll on your chosen cohort
Done! Check your Dashboard
```

### 5. Start Learning
```
Go to: Dashboard → Click your cohort
Watch unlocked lessons
Check unlock dates for locked modules
```

**That's it!** Check back when new modules unlock.

---

## For Teachers: Create & Run a Cohort

### 1. Create Cohort
```
Go to: Teacher Dashboard → Your Course
Click: Create Cohort

Fill in:
- Name: "Spring 2025"
- Start Date: 2025-03-01
- Max Students: 30 (optional)

Click: Create
```

### 2. Set Module Schedule
```
Click: Configure Schedule

For each module:
- Set Unlock Date (e.g., 2025-03-01)
- Optional: Set Lock Date (e.g., 2025-03-15)

Click: Save
```

### 3. Students Enroll
```
Share cohort with students
Students enroll themselves OR
Click: Enroll Students (bulk upload)
```

### 4. Monitor Progress
```
Click: Dashboard
See: Student count, completion %, activity
Check: Individual student progress
```

### 5. Engage
```
Post announcements
Respond in discussions
Help students who get stuck
```

**Best Practice**: Start with weekly module releases for 8-week course.

---

## Key Concepts at a Glance

### Cohort = Learning Group on a Schedule

```
All students start: March 1, 2025
Module 1 unlocks: March 1
Module 2 unlocks: March 8 (1 week later)
Module 3 unlocks: March 15 (2 weeks later)
...
Students all move together
```

### Time-Gating = Module Locks Until Date

```
[LOCKED] Module 2
Unlocks: March 8, 2025 (3 days remaining)

→ Students see lock status and count down
→ Teachers always see everything (override)
→ Encourages synchronized learning
```

### Enrollment = Student Joins Cohort

```
Student enrolls → Gets access to cohort
Can see unlocked modules immediately
Cannot see locked modules until unlock date
Progress tracked within that cohort
```

---

## Common Workflows

### "I want to release one module per week"

1. Create cohort with start_date = Monday
2. Set Module 1 unlock = Monday
3. Set Module 2 unlock = Monday + 7 days
4. Set Module 3 unlock = Monday + 14 days
5. (repeat for all modules)

Done! Content releases automatically on those dates.

### "I want all content available immediately"

1. Create cohort with start_date = today
2. Set ALL modules unlock = today
3. Don't set lock dates
4. Students can work at their own pace

Done! No time-gating constraints.

### "I want to keep students on current week only"

1. For each module pair:
   - Module 1 unlocks: March 1, locks: March 15
   - Module 2 unlocks: March 8, locks: March 22
   - (overlapping 1-week access windows)

Done! Students can see 2 weeks of content at a time.

### "I accidentally created a cohort"

Option 1: Delete it (if no students enrolled)
```
Click: Delete Cohort
Confirm: Yes, delete
```

Option 2: Rename to "ARCHIVED" and mark archived
```
Click: Edit
Change name to: "ARCHIVED - [original name]"
Change status to: Archived
Save
```

### "I need to move all dates back by 2 weeks"

1. Click: Edit Cohort
2. Change start_date (e.g., 2025-03-01 → 2025-03-15)
3. Click: Auto-Adjust Schedule
4. All unlock dates shift by 2 weeks automatically

Done!

---

## Troubleshooting in 30 Seconds

**"Can't find my cohort"**
→ Check: Are you enrolled? Go to Dashboard. Not there? Click Enroll on course page.

**"Module shows locked but should be unlocked"**
→ Refresh page. Clear cache. Contact teacher. (Teachers can manually unlock if needed.)

**"I can't enroll - says full"**
→ Cohort reached max capacity. Contact teacher to increase capacity or join different cohort.

**"Video won't play"**
→ Try: Refresh, different browser, clear cache, check internet speed.

**"Progress not updating"**
→ Wait 1 minute (processing), then refresh. If still stuck, clear cache and log back in.

---

## API Quick Reference (Developers)

### Create Cohort
```bash
curl -X POST https://domain.com/api/cohorts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "name": "Spring 2025",
    "start_date": "2025-03-01",
    "max_students": 30
  }'
```

### Enroll Student
```bash
curl -X POST https://domain.com/api/cohorts/42/enroll \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Set Module Schedule
```bash
curl -X POST https://domain.com/api/cohorts/42/schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": 1,
    "unlock_date": "2025-03-01"
  }'
```

### Check Module Status
```bash
curl https://domain.com/api/cohorts/42/modules/1/status \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "isUnlocked": true,
  "unlockDate": "2025-03-01",
  "reason": "unlocked"
}
```

---

## Important Details

### Date Format
Always use: `YYYY-MM-DD` (e.g., 2025-03-01)

### Time-Gating Logic
```
Today's date >= Unlock date  →  Module unlocked
Today's date < Lock date (if set)  →  Still unlocked
Today's date >= Lock date  →  Module locked
```

All dates are treated as date-only (no time component).

### Enrollment Rules
- One student per cohort per course
- Cannot be in two cohorts of same course
- To switch: Unenroll then re-enroll

### Teacher Permissions
- Only course creator can manage cohorts
- Only course creator can set schedules
- Teachers always see all content (bypass time-gating)

---

## Next Steps

**Students:**
→ Read [Student Help Center](../help/students.md) for detailed questions

**Teachers:**
→ Read [Teacher Training Guide](../training/teacher-guide.md) for strategies and best practices

**Developers:**
→ Read [Cohort API Reference](../api/cohorts.md) for complete endpoint documentation

**Everyone:**
→ See [Documentation Index](../COHORT_DOCUMENTATION_INDEX.md) for all guides

---

## Files You Created

**Guides:**
- `docs/guides/cohort-creation.md` - Step-by-step cohort creation
- `docs/guides/time-gating.md` - Module scheduling guide
- `docs/guides/enrollment.md` - Enrollment process details

**Training:**
- `docs/training/teacher-guide.md` - Comprehensive teacher training

**Help:**
- `docs/help/students.md` - Student help center

**Reference:**
- `docs/api/cohorts.md` - Complete API documentation
- `docs/COHORT_DOCUMENTATION_INDEX.md` - Master index

---

## Key Files in Codebase

**Implementation:**
- `src/lib/time-gating.ts` - Time-gating utility functions
- `src/pages/api/cohorts.ts` - Cohort CRUD endpoints
- `src/pages/api/cohorts/[id]/enroll.ts` - Enrollment endpoints
- `src/pages/api/cohorts/[id]/schedule.ts` - Schedule endpoints
- `src/types/index.ts` - TypeScript type definitions

**Tests:**
- `tests/integration/cohort-creation.test.ts`
- `tests/integration/cohort-enrollment.test.ts`
- `tests/integration/cohort-schema.test.ts`

**Database:**
- Schema in `schema.sql` - cohorts, cohort_enrollments, cohort_schedules tables

---

## Support

**Students**: Contact support@c4c-campus.com

**Teachers**: Contact teaching-team@c4c-campus.com

**Developers**: Check code comments and API documentation

---

**You're ready!** Start creating cohorts or enroll in one today.

# Discussion Moderation Guide for Teachers

**Date:** October 29, 2025
**Version:** 1.1.0
**Audience:** C4C Campus Teachers & Course Creators

---

## UI Overview & Dashboard

### Teacher Dashboard Interface

**Location:** `/teacher/courses` → Select Course → "Discussions" Tab

**Main Components:**

```
┌──────────────────────────────────────────────────────────┐
│ Course: "n8n Workflow Automation"                        │
│ [Overview] [Discussions] [Forums] [Students] [Settings]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Filters & Search:                                         │
│ [Lesson: All ▾] [Cohort: All ▾] [Status: All ▾]       │
│ [Search: _________________________] 🔍 [Advanced]       │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ PINNED DISCUSSIONS (2)                                   │
│                                                           │
│ 📌 How do I debug workflows? (12 replies)               │
│    Lesson 3: Debugging | Fall 2025 Cohort               │
│    Updated: 2 hours ago | Teacher response: Yes         │
│    [👤 Author: John D] [💬 Reply] [✎ Edit] [📌 Unpin]  │
│    [🔒 Lock] [🗑 Delete]                                │
│                                                           │
│ 📌 API Authentication Guide (8 replies)                 │
│    Lesson 2: APIs | Fall 2025 Cohort                    │
│    Updated: 1 day ago | Teacher response: Yes           │
│    [👤 Author: Jane S] [💬 Reply] [✎ Edit] [📌 Unpin]  │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ RECENT DISCUSSIONS (23)                                  │
│                                                           │
│ How do I validate webhook data?                         │
│    Lesson 4 | Fall 2025 & Spring 2026 Cohorts           │
│    Updated: 30 mins ago | Teacher response: No          │
│    [👤 Author: Alex T] [💬 Reply] [✎ Edit] [📌 Pin]    │
│    [🔒 Lock] [🗑 Delete]                                │
│                                                           │
│ Can you explain variables?                              │
│    Lesson 1 | Spring 2026 Cohort                        │
│    Updated: 5 hours ago | Teacher response: Yes         │
│    [👤 Author: Maria C] [💬 Reply] [✎ Edit] [📌 Pin]   │
│                                                           │
│ [← Prev] Page 2 of 8 [Next →]                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Key UI Elements

**Filters:**
- **Lesson:** Filter by specific lesson or "All"
- **Cohort:** Filter by enrollment group
- **Status:** All / Pinned / Unanswered / Locked / New

**Discussion Cards Show:**
- Pin icon (📌) if pinned
- Title/question text
- Lesson and cohort info
- Update time (how long ago)
- Author name
- Reply count in parentheses
- Teacher response indicator (Yes/No)

**Quick Action Buttons:**
- 👤 Author: Click to see student profile
- 💬 Reply: Open reply interface
- ✎ Edit: Edit the discussion
- 📌 Pin/Unpin: Toggle pinned status
- 🔒 Lock: Prevent further replies (forums)
- 🗑 Delete: Remove discussion

**Color Coding:**
- Orange background: Pinned discussions
- Blue: Teacher responses visible
- Gray: Awaiting teacher response
- Red: Locked threads

### Notification Indicators

**See at a Glance:**
- Unanswered count: Red badge on "Discussions" tab
- New discussions: Blue dot next to lesson name
- Teacher mentions: Notification bell in top right

---

## Overview

As a teacher on the C4C Campus platform, you have powerful moderation tools to manage discussions and forums in your courses. This guide covers all moderation capabilities, workflows, and best practices for maintaining healthy, productive learning environments.

---

## Table of Contents

1. [Teacher Capabilities Overview](#teacher-capabilities-overview)
2. [Lesson Discussion Moderation](#lesson-discussion-moderation)
3. [Course Forum Moderation](#course-forum-moderation)
4. [Pin/Lock/Delete Workflows](#pinlockdelete-workflows)
5. [Abuse Prevention & Reporting](#abuse-prevention--reporting)
6. [Best Practices](#best-practices)
7. [Common Scenarios](#common-scenarios)
8. [FAQ](#faq)

---

## Teacher Capabilities Overview

### What Teachers Can Do

As a teacher in courses you created, you have the following moderation powers:

#### View Permissions
- **See all discussions** in your courses across all cohorts
- **Access full discussion history** including deleted/edited posts (when soft delete is implemented)
- **Monitor student engagement** through the student roster view

#### Moderation Actions
- **Pin discussions** to highlight important questions/answers
- **Lock forum threads** to prevent further replies
- **Edit any discussion/forum/reply** to correct misinformation or improve clarity
- **Delete inappropriate content** that violates community guidelines
- **Mark teacher responses** with special badges for visibility

#### What Teachers Cannot Do
- **View discussions in other teachers' courses**
- **Moderate content in cohorts for courses they didn't create**
- **Access student private messages** (feature not implemented)
- **Permanently ban users** (admin-only capability)

---

## Lesson Discussion Moderation

### Accessing Lesson Discussions

1. Navigate to your course: `/teacher/courses`
2. Select the course from your list
3. Click on the "Discussions" tab
4. Filter by lesson and cohort

### Viewing Discussion Threads

Lesson discussions are **threaded** (nested replies):

```
Top-level Question (Student A)
├─ Answer (Teacher)
│  └─ Follow-up Question (Student A)
│     └─ Clarification (Teacher)
└─ Alternative Solution (Student B)
```

**Key Features:**
- **Threaded structure** - Replies nest under parent comments
- **Unlimited depth** - Conversations can go as deep as needed
- **Teacher badges** - Your responses show a "Teacher" badge
- **Pin capability** - Highlight important discussions at the top

### Pinning Important Discussions

**When to Pin:**
- Excellent student questions that help everyone
- Comprehensive answers to common problems
- Clarifications of confusing lesson concepts
- Community-contributed solutions

**How to Pin:**

**UI Method:**
1. Navigate to the discussion
2. Click the "Pin" icon (📌)
3. Discussion moves to top of list
4. To unpin, click the pin icon again

**API Method:**
```typescript
// PATCH /api/discussions/[id]/pin
await fetch(`/api/discussions/${discussionId}/pin`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ is_pinned: true })
});
```

**Database:**
```sql
-- Pin a discussion
UPDATE lesson_discussions
SET is_pinned = TRUE, updated_at = NOW()
WHERE id = 123;

-- Unpin a discussion
UPDATE lesson_discussions
SET is_pinned = FALSE, updated_at = NOW()
WHERE id = 123;
```

**Result:**
- Pinned discussions appear at the top of the discussion list
- Display order: Pinned (newest first) → Unpinned (newest first)
- All cohorts see pinned discussions if they have access to the lesson

### Editing Discussions

**When to Edit:**
- Correct technical inaccuracies (with note: "[Edited by Teacher]")
- Fix formatting issues
- Remove sensitive information (emails, phone numbers)
- Improve clarity while preserving intent

**Best Practices:**
- Add `[Edited by Teacher: reason]` note
- Don't change the meaning of student posts
- Use sparingly - prefer replies to corrections
- Consider deleting and asking student to repost if major changes needed

**How to Edit:**

**UI Method:**
1. Click the "Edit" button on the discussion
2. Modify the content
3. Add edit note
4. Click "Save"

**API Method:**
```typescript
// PATCH /api/discussions/[id]
await fetch(`/api/discussions/${discussionId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: updatedContent + '\n\n[Edited by Teacher: Fixed code formatting]'
  })
});
```

### Deleting Discussions

**When to Delete:**
- Spam or advertisements
- Harassment or bullying
- Violations of community guidelines
- Duplicate posts
- Off-topic content

**Deletion Types:**

**Soft Delete (Recommended):**
- Discussion shows as "[Deleted by moderator]"
- Preserves conversation context
- Can be restored by admins if needed

**Hard Delete (Permanent):**
- Discussion completely removed from database
- All child replies also deleted (CASCADE)
- Cannot be recovered

**How to Delete:**

**UI Method:**
1. Click the "Delete" button
2. Confirm deletion
3. Optionally add reason

**API Method:**
```typescript
// DELETE /api/discussions/[id]
await fetch(`/api/discussions/${discussionId}`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: 'Spam' })
});
```

**Warning:** Deleting a parent discussion deletes all child replies due to CASCADE behavior.

---

## Course Forum Moderation

### Accessing Course Forums

1. Navigate to `/teacher/courses`
2. Select your course
3. Click the "Forum" tab
4. View all forum posts across cohorts

### Forum Structure

Course forums use a **flat reply structure** (not threaded):

```
Forum Post (Student A)
├─ Reply 1 (Student B)
├─ Reply 2 (Teacher)
└─ Reply 3 (Student A)
```

**Differences from Lesson Discussions:**
- Forum posts have **titles** (discussions don't)
- Replies are **flat** (not nested)
- Forums are **course-level** (not lesson-specific)
- Forums can be **locked** to prevent new replies

### Pinning Forum Posts

**When to Pin:**
- Important course announcements
- Frequently asked questions
- Community resource posts
- Project showcase examples

**Process:** Same as pinning lesson discussions (see above)

**Result:**
- Pinned posts appear at top of forum
- Visible to all cohorts in the course

### Locking Forum Threads

**When to Lock:**
- Discussion has run its course
- Question has been answered comprehensively
- Thread is becoming off-topic
- Prevent necro-posting on old threads
- During course assessment periods (prevent cheating)

**How to Lock:**

**UI Method:**
1. Navigate to forum post
2. Click "Lock Thread" button
3. Confirm action

**API Method:**
```typescript
// PATCH /api/forums/[id]/lock
await fetch(`/api/forums/${forumId}/lock`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ is_locked: true })
});
```

**Database:**
```sql
-- Lock a forum thread
UPDATE course_forums
SET is_locked = TRUE, updated_at = NOW()
WHERE id = 456;
```

**Effect of Locking:**
- Students cannot create new replies
- Students cannot create new posts in locked forums
- Teachers can still post and edit
- Locked indicator shows in UI (🔒)

**When to Unlock:**
- New information requires discussion
- Original concern has been resolved
- Thread was locked in error

### Managing Forum Replies

**View All Replies:**
```sql
SELECT * FROM forum_replies
WHERE forum_post_id = ?
ORDER BY created_at ASC;
```

**Moderation Actions on Replies:**
- **Edit** - Correct misinformation
- **Delete** - Remove inappropriate content
- **Respond** - Add teacher input with badge

**Best Practice:** Review replies regularly to ensure quality and accuracy.

---

## Pin/Lock/Delete Workflows

### Workflow 1: Highlight Valuable Content

**Scenario:** A student posts an excellent question that many students ask.

**Workflow:**
1. Review the discussion thread
2. If comprehensive answer exists, **pin** the discussion
3. Add a teacher response summarizing key points
4. Optional: Lock the forum thread if no further input needed

**Example:**
```
📌 PINNED
Q: How do I debug my n8n workflow when it fails?
A (Teacher): Great question! Here are the steps...
└─ Follow-up (Student): Thanks, this helped!

[Thread locked - Question answered comprehensively]
```

### Workflow 2: Manage Off-Topic Discussion

**Scenario:** A forum thread has drifted off-topic.

**Workflow:**
1. Review the thread
2. Add a teacher post: "Let's get back on topic. For [off-topic], please create a new thread."
3. **Lock** the original thread
4. If severely off-topic, **delete** derailing replies
5. Create a new forum post with proper scope if needed

### Workflow 3: Handle Inappropriate Content

**Scenario:** A student posts spam or violates community guidelines.

**Workflow:**
1. **Immediately delete** the inappropriate content
2. Document the violation (admin panel)
3. If repeat offender, escalate to admin for user suspension
4. Post a reminder about community guidelines if needed

**Example:**
```sql
-- Delete spam discussion
DELETE FROM lesson_discussions WHERE id = 789 AND content LIKE '%buy now%';

-- Add moderation log (future feature)
INSERT INTO moderation_log (action, content_id, reason, moderator_id)
VALUES ('delete', 789, 'Spam advertisement', 'teacher-uuid');
```

### Workflow 4: Curate High-Quality Answers

**Scenario:** Multiple students have provided different solutions to a problem.

**Workflow:**
1. Review all proposed solutions
2. Add a teacher response comparing approaches
3. **Pin** the discussion if valuable for future students
4. Mark your response with technical accuracy notes

**Example:**
```
📌 PINNED
Q: What's the best way to handle errors in n8n?

A1 (Student): Use try-catch blocks
A2 (Student): Add error workflow paths
A3 (Student): Set up error notifications

A (Teacher): All three approaches are valid! Here's when to use each...
[Edited by Teacher: Added comparison table]
```

---

## Abuse Prevention & Reporting

### Types of Abuse to Monitor

1. **Spam**
   - Advertisements
   - Repetitive posts
   - Bot-generated content

2. **Harassment**
   - Personal attacks
   - Bullying
   - Discriminatory language

3. **Cheating**
   - Sharing assignment answers
   - Requesting others to complete work
   - Posting solutions during assessments

4. **Misinformation**
   - Intentionally incorrect technical information
   - Misleading advice
   - Security vulnerabilities

5. **Privacy Violations**
   - Posting others' personal information
   - Sharing private credentials
   - Doxxing attempts

### Reporting Workflow

**As a Teacher:**

1. **Immediate Action:**
   - Delete harmful content immediately
   - Lock thread if needed to stop escalation

2. **Document:**
   - Screenshot the content (if severe)
   - Note the user, time, and context

3. **Escalate to Admin:**
   - Use `/admin` panel → Moderation Reports
   - Provide user ID, discussion ID, and reason
   - Admins can suspend or ban users

4. **Follow-Up:**
   - Monitor user's future posts
   - Add educational comment if appropriate
   - Update community guidelines if pattern emerges

**Reporting API (Future Feature):**
```typescript
// POST /api/moderation/report
await fetch('/api/moderation/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content_type: 'lesson_discussion',
    content_id: discussionId,
    reason: 'harassment',
    description: 'Student repeatedly attacked another student...',
    evidence_urls: ['screenshot1.png']
  })
});
```

### Automated Abuse Detection (Future)

**Planned Features:**
- Spam keyword filtering
- Rate limiting (max posts per hour)
- Duplicate content detection
- Sentiment analysis for hostility
- Auto-flag for manual review

**Current Manual Process:**
- Teachers review flagged content
- Make moderation decisions
- Escalate to admins when needed

---

## Best Practices

### 1. Be Responsive

**Goal:** Create an engaging learning environment

**Practices:**
- Check discussions daily
- Respond to student questions within 24 hours
- Use teacher badge to signal authoritative answers
- Pin your comprehensive answers for future students

### 2. Encourage Student-to-Student Help

**Goal:** Build a collaborative learning community

**Practices:**
- Don't immediately answer every question
- Let students attempt solutions first
- Validate student answers with "Great answer!" or "Correct!"
- Only step in if misinformation is spreading

### 3. Set Clear Expectations

**Goal:** Establish community guidelines

**Practices:**
- Pin a "Forum Guidelines" post at course start
- Model respectful communication
- Explain what's on-topic vs off-topic
- Address violations promptly and professionally

**Example Guidelines Post:**
```
📌 Welcome to the Course Forum!

Rules:
✅ Ask questions, share insights, help others
✅ Stay on topic (course content and projects)
✅ Be respectful and constructive

❌ No spam or self-promotion
❌ No sharing assignment answers
❌ No personal attacks or harassment

Violations may result in post deletion or course removal.
```

### 4. Use Moderation Sparingly

**Goal:** Preserve student autonomy and voice

**Practices:**
- Only edit when necessary (prefer replies)
- Explain deletions with public note
- Unpin discussions after they're no longer relevant
- Unlock threads when new developments arise

### 5. Curate High-Quality Content

**Goal:** Build a knowledge base for future cohorts

**Practices:**
- Pin exceptional student contributions
- Edit posts to improve clarity (with attribution)
- Create summary posts linking to key discussions
- Archive valuable threads for course documentation

### 6. Monitor Engagement

**Goal:** Identify struggling students and adjust course

**Practices:**
- Use student roster to track discussion participation
- Reach out to silent students
- Notice patterns in questions (indicates unclear content)
- Adjust course materials based on common confusions

**Roster View:**
```sql
SELECT
  name,
  email,
  discussion_posts,
  forum_posts,
  last_activity_at
FROM student_roster_view
WHERE cohort_id = ?
ORDER BY discussion_posts ASC;
-- Students with 0 posts may need encouragement
```

---

## Common Scenarios

### Scenario 1: Student Posted Wrong Answer

**Situation:** Student A posted an incorrect solution. Student B followed the advice and it didn't work.

**Action:**
1. Don't delete the incorrect answer (learning opportunity)
2. Add a teacher reply: "Thanks for trying! However, this approach won't work because..."
3. Provide the correct solution
4. Explain why the original approach failed
5. Pin the discussion if it's a common mistake

**Example:**
```
Q: How do I connect to the API?
A (Student): Just use HTTP Request node

A (Teacher): Good start! However, this API requires authentication.
Here's the correct approach:
1. Add HTTP Request node
2. Set Authentication to "Header Auth"
3. Add API key in headers...

[Pinned - Common authentication question]
```

### Scenario 2: Discussion Turned Into Argument

**Situation:** Two students are debating a technical point, getting heated.

**Action:**
1. Add a teacher reply de-escalating: "Great discussion! Let's focus on the technical merits..."
2. Provide the authoritative answer with sources
3. Lock the thread if arguing continues
4. Reach out privately to students if personal conflict

**Example:**
```
Student A: This is the only way to do it!
Student B: That's completely wrong!

Teacher: Both approaches have merit! Let me clarify:
- Approach A works best when...
- Approach B is better for...

[Thread locked - Question resolved]
```

### Scenario 3: Student Asking for Assignment Answers

**Situation:** Student directly asks for homework solution.

**Action:**
1. Don't provide the answer
2. Reply with guiding questions
3. Point to relevant lesson materials
4. Encourage problem-solving process

**Example:**
```
Q: Can someone give me the answer to Assignment 3 Question 2?

A (Teacher): I can't provide the answer directly, but here's how to approach it:
1. Review Lesson 5 on [topic]
2. Try breaking the problem into smaller steps
3. Share what you've tried so far, and I'll guide you!
```

### Scenario 4: Multiple Cohorts Asking Same Question

**Situation:** You notice students in different cohorts asking identical questions.

**Action:**
1. Pin the best answer in one cohort
2. Consider updating lesson content to clarify
3. Create a FAQ forum post
4. Add note to lesson: "See pinned discussion on X"

**Systemic Fix:**
- Update lesson video or text
- Add practice exercise addressing confusion
- Create supplemental resource

### Scenario 5: Off-Topic Discussion Gaining Traction

**Situation:** Students are chatting about non-course topics.

**Action:**
1. If harmless (team bonding): create a "General Chat" forum
2. If disruptive: post reminder to stay on-topic
3. Lock thread if it continues
4. Delete if spam or inappropriate

**Example:**
```
Teacher: I love the enthusiasm! However, let's keep this forum focused on
course content. Feel free to chat in the "General Discussion" forum!

[Thread locked]
```

---

## FAQ

### Q: Can I delete a discussion and all its replies at once?

**A:** Yes. Deleting a parent discussion will **cascade delete** all child replies due to the foreign key constraint. Be careful - this is permanent (unless soft delete is implemented).

```sql
-- This deletes the discussion and all nested replies
DELETE FROM lesson_discussions WHERE id = 123;
```

**Best Practice:** Consider soft delete instead:
```sql
-- Future feature: Soft delete
UPDATE lesson_discussions SET deleted_at = NOW() WHERE id = 123;
```

### Q: Can I moderate discussions in courses I didn't create?

**A:** No. Teachers can only moderate courses they created (`courses.created_by = your user ID`). This is enforced by RLS policies.

If you need to moderate another teacher's course, ask an admin to grant you co-teacher status (future feature).

### Q: What happens if I lock a forum post that already has replies?

**A:** Existing replies remain visible. Students cannot add new replies, but you can still respond as a teacher.

### Q: Can I pin discussions in all cohorts at once?

**A:** Yes. Pinning a discussion pins it for all cohorts that have access to that lesson. The pin status is not cohort-specific.

### Q: How do I see which discussions I've pinned?

**A:** Use the teacher dashboard filter:

```sql
SELECT * FROM lesson_discussions
WHERE is_pinned = TRUE
AND lesson_id IN (
  SELECT l.id FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN courses c ON m.course_id = c.id
  WHERE c.created_by = 'your-user-id'
)
ORDER BY updated_at DESC;
```

### Q: What's the difference between editing and deleting?

**A:**
- **Edit:** Modify content while preserving context. Use for corrections.
- **Delete:** Remove entirely. Use for policy violations.

**Guideline:** Edit for accuracy, delete for violations.

### Q: Can students see edit history?

**A:** Not currently. Edit history tracking is a planned feature. Best practice: add `[Edited by Teacher: reason]` note manually.

### Q: How do I prevent students from deleting their posts after I respond?

**A:** Currently, students can delete their own posts (and your replies via CASCADE). To preserve valuable discussions:

1. Screenshot important threads before students can delete
2. Request admin to disable student delete permissions (future RLS policy update)
3. Use soft delete system when implemented

### Q: Can I transfer discussion moderation to another teacher?

**A:** Moderation is tied to course ownership. To transfer:

1. Admin changes `courses.created_by` to new teacher's ID
2. New teacher inherits moderation powers
3. You lose access to discussions

**Alternative:** Request admin to add co-teacher role (planned feature).

### Q: How do I handle duplicate questions?

**A:**
1. Answer the first one comprehensively
2. Pin it
3. On duplicates, reply: "See pinned discussion: [link]"
4. Consider adding to course FAQ

---

## Advanced Moderation Techniques

### Using the Student Roster

**Access:** `/teacher/courses` → Select course → "Students" tab

**Metrics Available:**
- `discussion_posts` - Number of lesson discussions by student
- `forum_posts` - Number of forum posts by student
- `last_activity_at` - Last time student engaged

**Use Cases:**

**Identify Struggling Students:**
```sql
-- Students with no discussion activity
SELECT name, email, enrolled_at
FROM student_roster_view
WHERE cohort_id = ? AND discussion_posts = 0 AND forum_posts = 0;
```

**Reward Top Contributors:**
```sql
-- Most active discussants
SELECT name, discussion_posts, forum_posts
FROM student_roster_view
WHERE cohort_id = ?
ORDER BY (discussion_posts + forum_posts) DESC
LIMIT 10;
```

**Monitor Engagement Over Time:**
```sql
-- Students who stopped participating
SELECT name, last_activity_at, completed_lessons
FROM student_roster_view
WHERE cohort_id = ?
AND last_activity_at < NOW() - INTERVAL '7 days';
```

### Bulk Moderation

**Scenario:** You need to moderate multiple discussions at once.

**Future API Feature:**
```typescript
// Bulk pin discussions
await fetch('/api/discussions/bulk', {
  method: 'PATCH',
  body: JSON.stringify({
    ids: [123, 456, 789],
    action: 'pin',
    is_pinned: true
  })
});
```

**Current Workaround (SQL):**
```sql
-- Bulk pin discussions on a specific topic
UPDATE lesson_discussions
SET is_pinned = TRUE
WHERE lesson_id IN (SELECT id FROM lessons WHERE name LIKE '%Authentication%')
AND content LIKE '%login%';
```

### Creating Moderation Templates

**Goal:** Standardize common moderation responses

**Example Templates:**

**Template 1: Off-Topic Redirect**
```
Thanks for posting! This topic is better suited for [Other Forum].
Please repost there, and I'll answer it!

[Thread will be locked]
```

**Template 2: Duplicate Question**
```
Great question! This has been answered in detail here: [link to pinned discussion]

If you have follow-up questions, please post them on that thread!
```

**Template 3: Insufficient Detail**
```
I'd love to help! Can you provide more details:
- What have you tried so far?
- What error message are you seeing?
- What outcome are you expecting?

Reply with this info, and I'll jump in!
```

**Template 4: Community Guidelines Violation**
```
This post has been removed for violating community guidelines:
- [Specific guideline violated]

Please review our guidelines: [link]

Further violations may result in course removal.
```

### Moderation Analytics

**Track Your Moderation Activity:**

```sql
-- Discussions you've moderated (future feature)
SELECT
  action_type,
  COUNT(*) as count
FROM moderation_log
WHERE moderator_id = 'your-user-id'
AND created_at > NOW() - INTERVAL '30 days'
GROUP BY action_type;
```

**Results:**
```
action_type  | count
-------------|------
pin          | 15
lock         | 8
delete       | 3
edit         | 12
```

---

## Keyboard Shortcuts (Future Feature)

**Planned shortcuts for efficient moderation:**

- `P` - Pin discussion
- `L` - Lock thread
- `E` - Edit post
- `D` - Delete (with confirmation)
- `R` - Reply
- `Esc` - Close moderation panel

---

## Integration with Teacher Dashboard

### Discussion Tab

**Access:** `/teacher/courses` → Select course → "Discussions" tab

**Features:**
- View all discussions across cohorts
- Filter by lesson, cohort, pinned status
- Search discussion content
- Bulk moderation actions
- Quick reply interface

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Discussions in "n8n Basics"                         │
├─────────────────────────────────────────────────────┤
│ Filters: [All Cohorts ▾] [All Lessons ▾] [Pinned ☐]│
│ Search: [____________________] 🔍                    │
├─────────────────────────────────────────────────────┤
│ 📌 How do I debug workflows? (12 replies)           │
│    Lesson 3: Debugging | Cohort Fall 2025           │
│    Last activity: 2 hours ago                       │
│    [Reply] [Edit] [Unpin] [Lock]                    │
├─────────────────────────────────────────────────────┤
│ What's the difference between Trigger and Polling?  │
│    Lesson 1: Basics | Cohort Fall 2025              │
│    Last activity: 1 day ago                         │
│    [Reply] [Edit] [Pin] [Lock] [Delete]             │
└─────────────────────────────────────────────────────┘
```

---

## Conclusion

Effective discussion moderation creates a positive, productive learning environment. As a teacher, your moderation powers include:

- **Visibility:** See all discussions in your courses
- **Curation:** Pin valuable content for future students
- **Control:** Lock threads and edit/delete content
- **Guidance:** Provide authoritative answers with teacher badge

**Key Principles:**
1. Be responsive and engaged
2. Encourage peer learning
3. Moderate with transparency
4. Build a knowledge base
5. Foster respectful communication

**Resources:**
- ERD Diagram: `/docs/diagrams/discussion-erd.md`
- API Documentation: `/docs/api/discussions.md`
- Community Guidelines: `/docs/community-guidelines.md`
- Admin Escalation: Contact `admin@c4c.com`

---

**Document Status:** Complete
**Last Updated:** October 29, 2025
**Maintained By:** C4C Platform Team

For questions or feedback, contact the C4C support team or post in the "Teachers" forum.

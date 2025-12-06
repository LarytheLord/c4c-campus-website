# Teacher Moderation Guide

**Date:** October 29, 2025
**Version:** 1.0.0
**Audience:** C4C Campus Teachers & Course Moderators

---

## Quick Start

**New to moderation? Start here:**

1. Access Dashboard: Go to `/teacher` → Select your course → "Discussions" tab
2. Review Discussions: See all discussions in your course
3. Take Action: Pin important ones, delete violations, respond to questions
4. Engage: Reply to questions with the teacher badge
5. Monitor: Check discussion activity weekly

**Most Common Actions:**
- Pin excellent questions (📌 icon)
- Delete spam or violations
- Reply to answer student questions
- Lock threads that are resolved

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Viewing & Filtering Discussions](#viewing--filtering-discussions)
3. [Core Moderation Actions](#core-moderation-actions)
4. [Common Scenarios](#common-scenarios)
5. [Best Practices](#best-practices)
6. [Safety & Abuse Response](#safety--abuse-response)
7. [Quick Reference](#quick-reference)

---

## Dashboard Overview

### Accessing the Discussion Dashboard

**Location:** `/teacher/courses` → Select Course → "Discussions" Tab

**What You See:**
```
┌─────────────────────────────────────────────────────────┐
│ Discussions in "n8n Workflow Automation"               │
├─────────────────────────────────────────────────────────┤
│ Filters:                                                 │
│ [Lesson: All ▾] [Cohort: All ▾] [Status: All ▾]      │
│ [Search: _____________________] 🔍                      │
├─────────────────────────────────────────────────────────┤
│ 📌 PINNED | How do I debug workflows? (12 replies)     │
│    Lesson 3 | Fall 2025 Cohort | Last: 2h ago         │
│    [Reply] [Edit] [Unpin] [Delete] [Lock]             │
├─────────────────────────────────────────────────────────┤
│ How do I validate data in HTTP requests?                │
│    Lesson 2 | Fall 2025 Cohort | Last: 1d ago         │
│    [Reply] [Edit] [Pin] [Delete] [Lock]               │
├─────────────────────────────────────────────────────────┤
│ [← Prev] Page 3 of 7 [Next →]                          │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Pinned Section:** Show pinned discussions first
- **Filters:** Narrow by lesson, cohort, status
- **Search:** Find specific discussions
- **Quick Actions:** Pin, edit, delete without opening
- **Pagination:** Navigate large discussion lists

### Dashboard Metrics

**See at a Glance:**
- Total discussions this week
- Unanswered questions (with teacher badge)
- Discussion participation rate
- Most active students
- Trending topics

**Access Metrics:**
1. Dashboard → "Overview" tab
2. Or click course name for course-level stats

---

## Viewing & Filtering Discussions

### Filter Options

**By Lesson:**
- "All Lessons" - See all discussions
- Select specific lesson - See only that lesson's discussions

**By Cohort:**
- "All Cohorts" - See discussions from all cohorts you teach
- Select specific cohort - Isolate one cohort

**By Status:**
- "All" - Show all discussions
- "Pinned Only" - Only pinned discussions
- "Unanswered" - Questions with no teacher response
- "Locked" - Only locked threads (forums)
- "New" - Created in last 24 hours

**By Time:**
- "All Time" - Everything ever
- "Last 7 Days" - Recent discussions
- "Last 24 Hours" - Today's discussions

### Search Discussions

**Full Text Search:**
1. Click search box at top
2. Type keywords or phrase
3. Results show matching discussions
4. Click to open full thread

**Example Searches:**
- "API authentication" - Find discussions about that topic
- "student name" - Find their posts
- "error 401" - Find common errors
- "workflow" - See all discussions mentioning workflows

**Advanced Search (Coming):**
- Filter by author: `from:john.doe@email.com`
- Filter by date: `after:2025-10-20`
- Filter by type: `type:forum` or `type:lesson`
- Exclude: `-spam`

### Sort Options

**Current Sorting:**
1. Pinned discussions first (all sorted by update time)
2. Unpinned by most recent activity

**Planned Sorting Options:**
- Most replies (popular)
- Most views
- Unanswered
- By creation date (oldest/newest)
- By author

---

## Core Moderation Actions

### 1. Pinning Discussions

**Purpose:** Highlight important content so students see it first

**When to Pin:**
- ✅ Excellent student questions
- ✅ Comprehensive answers
- ✅ Common mistakes (educational value)
- ✅ Course announcements
- ✅ FAQ responses
- ✅ Pre-assessment clarifications

**When NOT to Pin:**
- ❌ Your own posts (appears unbiased)
- ❌ Temporary discussions (unpin when irrelevant)
- ❌ Controversial topics
- ❌ More than 5-10 per lesson (dilutes impact)

**How to Pin:**

**Via Dashboard:**
1. Find discussion in list
2. Click pin icon (📌)
3. Discussion moves to pinned section
4. Automatically re-sorted by update time

**Via Discussion Page:**
1. Open the discussion
2. Click "Pin Discussion" button
3. See confirmation

**UI Indication:**
```
📌 PINNED
Question: How do I debug workflows?
Last activity: 2 hours ago
[Unpin] [Delete]
```

**Best Practices:**
- **Pin comprehensive answers:** Full solutions, not quick tips
- **Unpin when irrelevant:** After discussion expires or cohort finishes
- **Limit pinned items:** 5-10 per lesson maximum
- **Pin early:** Get good answers visible quickly
- **Communicate:** Consider adding comment "Great question - pinned!"

**Example Pinned Discussion:**
```
📌 PINNED
Q: How do I authenticate with the Google Sheets API?

A (Teacher): Great question! Many students ask this. Here's the
complete setup:

1. Go to Google Cloud Console
2. Create OAuth credentials
3. Add to n8n as [steps]
4. Test connection with [steps]

Related resources:
- Google Sheets API docs: [link]
- n8n documentation: [link]

See replies below for common issues!
```

### 2. Responding to Discussions

**Your Teacher Badge:**
- Posts appear marked with 👨‍🏫 Teacher badge
- Automatic if you're the course creator
- Gives your answer authority and visibility

**When to Respond:**
- Student asked for clarification
- Misinformation is spreading
- Question has multiple answers - need official one
- Excellent student answer exists - validate it
- Discussion is stagnating - inject energy

**When NOT to Respond:**
- Student is still working on solution
- Peer mentoring is happening
- Question is off-topic (correct with guidance)
- Multiple good answers already exist

**Types of Responses:**

**1. Clarification**
```
Great question! To clarify: [explanation]

Think of it like: [analogy]

Here's an example: [code/screenshot]

Does this help? Ask if you need more detail.
```

**2. Validation of Good Answer**
```
Exactly right! [Student], great explanation of [concept].

I'd add that [additional insight] which is important when
[use case].

Thanks for helping your classmates!
```

**3. Correction of Misconception**
```
Good attempt! However, that approach won't work because
[technical reason].

The correct approach is:
1. [Step 1]
2. [Step 2]

Here's why: [explanation]

Let me know if you have follow-up questions!
```

**4. Comprehensive Answer**
```
Let me provide a comprehensive answer since this is a
common question:

[Full explanation with sections]

Key takeaway: [Summary]

Common mistake: [What students often get wrong]

Additional resources: [Links]

Try it and let me know what you find!
```

### 3. Editing Content

**Purpose:** Fix errors, remove sensitive info, improve clarity

**When to Edit:**
- ✅ Fix technical errors
- ✅ Remove personal information
- ✅ Fix formatting or typos
- ✅ Clarify confusing statements
- ✅ Remove profanity

**When NOT to Edit:**
- ❌ Change meaning of student post
- ❌ Hide unpopular opinions
- ❌ Without noting the edit
- ❌ To remove "wrong" answers (better to reply)

**How to Edit:**

1. Click "Edit" button on post
2. Make changes
3. Add note: `[Edited by Teacher: Fixed code formatting]`
4. Save

**Edit Notes Guide:**
- Always note what you edited and why
- Be transparent
- Examples:
  - `[Edited by Teacher: Fixed typo]`
  - `[Edited by Teacher: Removed personal email]`
  - `[Edited by Teacher: Corrected SQL syntax]`
  - `[Edited by Teacher: Improved formatting]`

**Example Edit:**
```
Original:
Q: Wheres the authenicate node?? Its not in my node menu????

Edited:
Q: Where is the Authentication node? It's not appearing in my
node menu.

[Edited by Teacher: Fixed spelling and formatting for clarity]
```

### 4. Deleting Content

**Purpose:** Remove harmful, spam, or guideline-violating content

**Types of Deletion:**

**Soft Delete (Recommended):**
- Shows `[Deleted by moderator]`
- Preserves thread context
- Reviewable by admins
- Can be restored

**Hard Delete (Permanent):**
- Completely removed
- Affects all child replies (CASCADE)
- Cannot be recovered
- Use only for serious violations

**When to Delete:**

**Soft Delete:**
- Spam or ads
- Mildly off-topic
- Experimental posts student wants removed
- Duplicates

**Hard Delete:**
- Hate speech or harassment
- Privacy violations (shared personal info)
- Explicit content
- Illegal activity
- Serious violations

**How to Delete:**

1. Click "Delete" button
2. Choose deletion type (soft/hard)
3. Optional: Add reason
4. Confirm

**Deletion Notice:**
```
[This discussion was removed by a moderator for violating
community guidelines. If you believe this is a mistake,
contact your teacher.]
```

**After Deletion:**
- Notify student (optional): "Your post was deleted because..."
- Document reason: For pattern detection
- Monitor for repeat violations

### 5. Locking Threads (Forums)

**Purpose:** Prevent further replies while keeping discussion visible

**When to Lock:**
- ✅ Discussion is fully resolved
- ✅ Question has comprehensive answer
- ✅ Thread is going off-topic
- ✅ Prevent necro-posting (old thread revival)
- ✅ During exams (prevent cheating)
- ✅ Excessive arguments

**When NOT to Lock:**
- ❌ Just because you're done answering
- ❌ To silence unpopular opinions
- ❌ Without clear reason
- ❌ Without notice to students

**How to Lock:**

1. Open forum post
2. Click "Lock Thread" button
3. Confirm action

**UI Indication:**
```
🔒 LOCKED | Question: How do I connect to the API?
Last reply: Oct 25, 2025
Students cannot reply. Teachers can still respond.
[Unlock] [Delete]
```

**Student Experience:**
- See 🔒 icon
- Read existing replies
- Cannot click "Reply" button
- See message: "This thread is locked"

**Unlock When:**
- New information requires discussion
- You locked it by mistake
- Original issue resurfaces
- Time-limited lock expires

---

## Common Scenarios

### Scenario 1: Multiple Wrong Answers

**Situation:** Several students have posted incorrect solutions.

**Your Action:**
1. **Don't delete** - Learning opportunity
2. **Reply to each:** Explain why approach won't work
3. **Provide correct solution:** Full explanation
4. **Pin correct answer:** If comprehensive
5. **Reply to original:** Summarize correct approach

**Example Response:**
```
Thanks for trying, everyone! Let me clarify:

@Student1: That approach won't work because HTTP Request
node requires [specific configuration].

@Student2: Close! However, [specific issue].

The correct approach is:
1. [Step 1 with detail]
2. [Step 2 with detail]
3. [Step 3 with detail]

Here's why: [Technical explanation]

Key learning: [What students should take away]
```

### Scenario 2: Question Asked Multiple Times

**Situation:** Same question asked in 5 different threads.

**Your Action:**
1. **Answer best version:** Thoroughly
2. **Pin that answer:** Visibility
3. **On duplicates:** Reply with link to pinned discussion
4. **Consider:** Updating lesson content if multiple students confused

**Response Template:**
```
Great question! This is covered in detail in the pinned
discussion: [link to pinned]

If you have follow-up questions specific to your situation,
reply there and I'll help!
```

**Systemic Fix:**
- Lesson unclear on that topic?
- Add clarification to video or notes
- Create practice exercise
- Add FAQ to lesson

### Scenario 3: Student Being Disruptive

**Situation:** Student is arguing, using inappropriate language, or attacking others.

**Your Action:**
1. **Immediate:** Delete offensive content
2. **Respond:** "Please review community guidelines: [link]"
3. **If pattern:** Document incidents
4. **Escalate:** Contact admin if harassment
5. **Private conversation:** Offer to discuss offline

**Example Response:**
```
I've deleted that post as it violates our community guidelines
regarding respectful communication.

Let's keep discussions focused on course content and supportive
of each other. Here are our guidelines: [link]

If you'd like to discuss further, happy to chat offline.
```

### Scenario 4: Excellent Student Contribution

**Situation:** Student posts brilliant solution or insight.

**Your Action:**
1. **Validate:** Reply with praise
2. **Explain:** Why this answer is excellent
3. **Pin:** Make it visible to others
4. **Credit:** Highlight their contribution

**Example Response:**
```
Fantastic explanation, @Student! You've clearly understood
[concept] and explained it beautifully.

I particularly like how you:
- [Specific thing 1]
- [Specific thing 2]
- [Specific thing 3]

This is exactly the kind of collaborative learning I love to
see. Thanks for helping your classmates!

[Pinning this - great reference for future students]
```

### Scenario 5: Off-Topic Discussion

**Situation:** Students are chatting about non-course topics.

**Your Action:**
1. **Assess:** Is it harmless bonding or disruptive?
2. **If harmless:** Let it continue or suggest general forum
3. **If disruptive:** Redirect to on-topic forum
4. **Lock if needed:** To refocus discussion

**Example Response (Supportive):**
```
I love the team spirit here! However, let's keep this forum
focused on course content.

Feel free to chat in the "General Discussion" forum or Slack
channel. Back to [topic] - how's everyone progressing?
```

**Example Response (Corrective):**
```
This is getting off-topic. Let's keep this forum focused on
[course topic].

To discuss [other topic], please use [other forum/channel].

Back to our question about [original topic]...
```

### Scenario 6: Potential Academic Dishonesty

**Situation:** Student appears to have submitted others' work or shared assignment answers.

**Your Action:**
1. **Document:** Screenshot/note the incident
2. **Private message:** Don't publicly accuse
3. **Ask questions:** "Can you explain your solution?"
4. **Escalate:** To admin if confirmed cheating
5. **Follow up:** Monitor their work more closely

**Example Private Message:**
```
Hi [Student],

I reviewed your submitted code and discussion responses.
I notice some things that seem inconsistent with your
previous work.

Can you explain your approach to [assignment]? Walk me
through your thought process.

I want to make sure you're getting the learning value from
this assignment. Let's chat!
```

### Scenario 7: Student in Distress

**Situation:** Student posts about struggling, mental health, or crisis.

**Your Action:**
1. **Respond privately:** Not in public forum
2. **Show compassion:** Acknowledge the struggle
3. **Encourage resources:** Student services, counseling
4. **Escalate:** Contact student services
5. **Remove post:** If personal info exposed

**Example Private Response:**
```
Hi [Student],

I read your post. I'm glad you reached out - that takes courage.

You're not alone in struggling with this. I'd like to help
connect you with resources:

- Student Services: [contact]
- Counseling: [contact]
- Mental Health Crisis: [contact]

Let's also discuss academic accommodations if needed.

Please reach out so we can talk. You're valued here.
```

---

## Best Practices

### 1. Be Responsive

**Goal:** Create an engaged, active community

**Practices:**
- Check discussions daily (even briefly)
- Respond within 24 hours to direct questions
- Reply to student answers to validate
- Acknowledge excellent contributions
- Show you're engaged and care

**Tools:**
- Set a daily reminder to check discussions
- Use email notifications
- Pin unanswered questions to your view

### 2. Encourage Peer Learning

**Goal:** Build a collaborative community

**Practices:**
- Don't answer every question immediately
- Let students attempt first
- Validate good student answers
- "Has anyone else tried this?" - invite discussion
- Create study groups or pair students
- Celebrate peer contributions

**Example Response:**
```
Before I jump in with the answer, has anyone else
encountered this issue? What did you try?

[Wait for student responses, then validate or guide]
```

### 3. Set Clear Expectations

**Goal:** Students know what's expected

**Practices:**
- Pin a "Forum Guidelines" post at course start
- Model respectful communication
- Explain what's on/off-topic
- Provide discussion rubric or guidelines
- Address violations promptly and professionally

**Pinned Guidelines Post:**
```
📌 COURSE FORUM GUIDELINES

Welcome to our course forum! Here's what makes great discussions:

DO:
- Ask questions about course content
- Share resources and ideas
- Help each other learn
- Be respectful and kind
- Show your thinking process

DON'T:
- Share assignment answers
- Use inappropriate language
- Attack or mock others
- Post spam or ads
- Repeat already-answered questions

Questions? See [course syllabus] or ask me!
```

### 4. Moderate Consistently

**Goal:** Maintain standards fairly

**Practices:**
- Apply rules consistently
- Don't play favorites
- Enforce equally for all students
- Document pattern violations
- Update guidelines as needed

**Red Flags:**
- If you always delete certain types of comments
- If you respond differently based on student
- If rules aren't clear to everyone
- If you make exceptions frequently

### 5. Curate Knowledge

**Goal:** Build a resource library

**Practices:**
- Pin high-quality answers
- Link between related discussions
- Create summary posts of key topics
- Add resources to lesson descriptions
- Export/archive valuable threads

**Example Summary Post:**
```
📌 FREQUENTLY ASKED QUESTIONS - Week 1

Here are the most common questions from this week:

1. How do I set up the HTTP Request node?
   → See pinned discussion: [link]

2. What's the difference between Trigger and Polling?
   → See pinned discussion: [link]

3. How do I test my workflow?
   → See lesson resources: [link]

More questions? Ask below!
```

### 6. Monitor Engagement

**Goal:** Identify struggling students

**Practices:**
- Note who's not posting
- Review their question types
- Check assignment submissions vs. discussions
- Reach out privately to quiet students
- Adjust content if many questions cluster

**Engagement Patterns:**
- No posts: May need encouragement or be struggling
- Many questions: Good sign of engagement; may indicate confusion
- Technical questions: Good - shows they're thinking
- Repeated same question: Concept not clear; revise teaching

### 7. Respond Transparently

**Goal:** Maintain trust and fairness

**Practices:**
- Explain why you delete/edit content
- Admit when you don't know something
- Correct yourself if you made a mistake
- Reference community guidelines when enforcing
- Share reasoning for moderation decisions

**Example Transparent Response:**
```
I deleted your post because it violated our community
guideline about [specific rule]. Specifically: [what you did].

I want to help you succeed in this course. Here's how to
engage respectfully: [guidance].

If you disagree, let's discuss offline.
```

---

## Safety & Abuse Response

### Recognizing Abuse

**Warning Signs:**

**Harassment:**
- Targeted attacks on individuals
- Repeated unwanted contact
- Mocking or ridiculing
- Threatening language
- Sexual advances

**Discrimination:**
- Slurs or stereotypes
- Exclusionary statements
- "You don't belong here" comments
- Based on identity or background

**Misinformation:**
- False information presented as fact
- Conspiracy theories
- Impersonation
- Scams or fraud

**Cheating:**
- Sharing assignment answers
- Requesting others do work
- Posting during locked assessment
- Violating academic integrity

**Privacy Violations:**
- Posting others' personal info
- Sharing credentials
- Doxxing attempts
- Recording without consent

### Response Protocol

**When You See Abuse:**

1. **Don't delay** - Act quickly
2. **Document** - Screenshot or note details
3. **Evaluate** - Determine severity
4. **Respond appropriately** - See severity levels below
5. **Follow up** - Monitor for repeat

**Severity Levels:**

**Level 1: Minor Violation**
- Mild profanity, off-topic
- Action: Edit/delete post, private message with guidance
- Message tone: Educational, not punitive

**Level 2: Moderate Violation**
- Harassment, discrimination, cheating
- Action: Delete post, 3-7 day suspension, private meeting
- Message tone: Serious, clear expectations

**Level 3: Severe Violation**
- Hate speech, threats, illegal activity
- Action: Immediate removal, admin escalation
- Message tone: Final warning

### Escalation to Admin

**When to Contact Admin:**
- Harassment or threats
- Discrimination or hate speech
- Sexual content or advances
- Potential illegal activity
- Repeat offender
- Privacy violations
- Student in distress/crisis

**How to Report:**
1. Email: admin@c4c.com
2. Subject: "Urgent: [violation type]"
3. Include:
   - Student name/username
   - Discussion URL or screenshot
   - What happened (specific violation)
   - When it happened
   - Why you're escalating
   - Any previous incidents

**What Admin Does:**
- Investigates the incident
- Reviews moderation history
- Determines consequences
- Takes appropriate action (suspension, ban, etc.)
- Updates you on outcome
- Provides support if needed

### Supporting Affected Students

**If Someone Was Harassed:**

1. **Acknowledge:** "I saw what happened. I'm sorry you experienced that."
2. **Validate:** "That was inappropriate and not okay."
3. **Assure:** "I've removed it and am following up."
4. **Support:** "How can I help? You can always reach out to me."
5. **Document:** Note in system for pattern detection

**If Someone Was Called Out:**

1. **Private conversation:** Not in public
2. **Explain guideline:** "This violates [guideline]"
3. **Offer redemption:** "Here's how to do better"
4. **Monitor:** Track if behavior improves
5. **Escalate:** If pattern continues

---

## Quick Reference

### Keyboard Shortcuts (Available Now)

- **Tab + D:** Delete (with confirmation)
- **Tab + P:** Pin/Unpin
- **Tab + E:** Edit
- **Tab + L:** Lock (forums)
- **/:** Open command menu

### Quick Action Buttons

| Action | Location | Shortcut | Result |
|--------|----------|----------|--------|
| Pin | Post header | 📌 button | Moves to top |
| Reply | Below post | Reply button | Opens reply box |
| Edit | Post header | Edit button | Opens editor |
| Delete | Post header | Delete button | Removes content |
| Lock | Forum post | Lock button | Prevents replies |

### Common Responses Templates

**Quick Questions Template:**
```
Great question! Quick answer: [answer]

More detail: [explanation]

Examples:
- [example 1]
- [example 2]

Let me know if you need more!
```

**Misconception Correction:**
```
Good try! However: [correction]

Why that doesn't work: [explanation]

The right approach:
1. [step]
2. [step]

Here's why: [reasoning]
```

**Validating Good Answer:**
```
Exactly right, @[student]! Great explanation.

I'd add: [additional insight]

This is great peer learning - thanks!
```

### Moderation Checklist

**Daily (5 minutes):**
- [ ] Check for new discussions
- [ ] Reply to unanswered questions
- [ ] Delete obvious spam
- [ ] Check for policy violations

**Weekly (15 minutes):**
- [ ] Review engagement metrics
- [ ] Pin high-quality content
- [ ] Unpin outdated discussions
- [ ] Check for patterns in questions

**Monthly (30 minutes):**
- [ ] Review all pinned discussions
- [ ] Archive old forum threads
- [ ] Update FAQ based on questions
- [ ] Revise lesson content if needed

---

## Resources

**Internal Documentation:**
- Community Guidelines: `docs/guides/community-guidelines.md`
- Discussion System Guide: `docs/guides/discussion-system.md`
- Database Schema: `schema.sql`

**Related Guides:**
- Teacher Dashboard: `docs/guides/teacher-dashboard.md`
- Progress Tracking: `docs/guides/progress-tracking.md`
- Student Roster: `docs/guides/student-roster.md`

**Support:**
- Questions? Email: support@c4c.com
- Report abuse: admin@c4c.com
- Technical issues: tech-support@c4c.com

---

**Document Status:** Complete
**Last Updated:** October 29, 2025
**Version:** 1.0.0

Questions or feedback? Contact the teaching team!

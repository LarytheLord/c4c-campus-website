# Discussion System Guide

**Date:** October 29, 2025
**Version:** 1.0.0
**Audience:** All Users (Students, Teachers, Developers)

---

## Table of Contents

1. [Overview](#overview)
2. [For Students](#for-students)
3. [For Teachers](#for-teachers)
4. [Technical Architecture](#technical-architecture)
5. [UI Components & Features](#ui-components--features)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The C4C Campus discussion system provides collaborative learning spaces where students can ask questions, share insights, and learn from each other, while teachers maintain quality and keep discussions on track.

### Key Features

**For Students:**
- Ask questions in lesson-specific discussions
- Reply to questions with threaded conversations
- Engage in course-wide forums
- Search and filter discussions
- See teacher responses highlighted with badges

**For Teachers:**
- Monitor all discussions in your courses
- Pin important questions and answers
- Lock threads to prevent further discussion
- Edit or delete inappropriate content
- Mark your responses with teacher badge

### Two Discussion Types

#### 1. Lesson Discussions
- **Scope:** Specific to individual lessons
- **Structure:** Threaded (nested replies)
- **Use Case:** Questions about lesson content
- **Example:** "How do I set up the HTTP Request node?"

#### 2. Course Forums
- **Scope:** Entire course level
- **Structure:** Flat replies (no nesting)
- **Use Case:** General Q&A, projects, announcements
- **Example:** "Project showcase: my n8n automation"

---

## For Students

### Getting Started

#### Accessing Discussions

**In a Lesson:**
1. Open a lesson from your dashboard
2. Scroll to the "Discussion" section at the bottom
3. You'll see existing questions and a text input box

**In a Course Forum:**
1. Navigate to your course page
2. Click the "Forum" tab
3. Browse existing posts or create a new one

#### Posting a Question

**In Lesson Discussions:**
```
1. Click "Ask a question or share your thoughts..."
2. Type your question clearly
3. Click "Post Comment"
4. Your question appears in the discussion list
```

**Best Practices for Questions:**
- Be specific: "How do I..." vs "What is..."
- Include context: What are you trying to do? What happened?
- Show your work: What have you tried already?
- Use clear formatting: Separate steps, use line breaks

**Example Good Question:**
```
I'm trying to connect to the OpenWeather API but getting a 401 error.

What I've done:
1. Created an API account and got my API key
2. Added HTTP Request node
3. Set URL to: https://api.openweathermap.org/data/2.5/weather

What I expect: Weather data for Boston
What I'm getting: 401 Unauthorized error

My API key is definitely correct. What am I missing?
```

#### Replying to Questions

**How to Reply:**
1. Click "Reply" under the question you want to answer
2. Type your response in the reply box
3. Click "Post Reply"

**What Makes a Good Reply:**
- Address the specific question
- Explain your reasoning, not just the answer
- Provide examples or links if helpful
- Be respectful and encouraging

### Understanding Discussion Layout

```
Topic-Level Comments (Most Recent First)
├─ Teacher's Response (Marked with 👨‍🏫 badge)
│  └─ Student Follow-up
│     └─ Teacher Clarification
└─ Another Student's Answer

Pinned at Top (📌):
├─ How to Debug Workflows (Important!)
├─ API Authentication Guide
└─ Common n8n Mistakes
```

### Editing and Deleting Your Posts

**Edit Your Post:**
1. Find your post in the discussion
2. Click the "Edit" button
3. Modify the content
4. Click "Save"

**When to Edit:**
- Fix typos or formatting
- Add clarifying information
- Correct code errors

**Delete Your Post:**
1. Click the "Delete" button
2. Confirm deletion
3. Post is permanently removed (takes all replies with it)

**When to Delete:**
- You posted by mistake
- You found a better place for the question
- The question is no longer relevant

**Note:** If you delete a post that has replies, all replies are also deleted. Teachers can often help restore important discussions.

### Finding Answers

**Search Discussions:**
- Use browser Find (Ctrl+F or Cmd+F) to search page text
- Look for pinned discussions first (marked with 📌)
- Filter by lesson using the dropdown

**Reading Threaded Discussions:**
- Indented replies show who answered whom
- Look for teacher badge (👨‍🏫) for official answers
- "Edited" label shows if a post was modified

### Notifications

When someone replies to your question, you'll see:
- A notification badge on the course
- Email notification (if enabled in settings)

---

## For Teachers

### Accessing the Discussion Dashboard

**Navigate to Teacher Dashboard:**
1. Go to `/teacher` or `/teacher/courses`
2. Select your course
3. Click the "Discussions" tab

**Discussions Tab Features:**
- View all discussions in your course
- Filter by lesson, cohort, or status
- Search discussion content
- Quick actions (pin, lock, delete)

### Managing Discussions

#### Pinning Important Content

**When to Pin:**
- Excellent student questions
- Comprehensive answers
- Common mistakes (to help future students)
- Announcements

**How to Pin:**
1. Hover over or click on a discussion
2. Click the pin icon (📌)
3. Discussion moves to top of list
4. All cohorts see it if they have lesson access

**UI Indicator:**
```
📌 PINNED
How do I debug workflows? (15 replies)
Lesson 3: Debugging | Last activity: 2h ago
[Unpin] [Lock] [Delete]
```

#### Locking Forum Threads

**When to Lock:**
- Discussion is resolved
- To prevent off-topic expansion
- During assessment periods
- Prevent "necro-posting" (reviving old threads)

**How to Lock:**
1. Navigate to forum post
2. Click "Lock Thread" button
3. Confirm action

**Effect of Locking:**
- Students see 🔒 (locked) indicator
- Students can't reply to locked posts
- Teachers can still reply and edit
- Existing replies remain visible

**Unlock When:**
- New information requires discussion
- You locked it by mistake
- Original issue resurfaces

#### Editing Posts

**When to Edit:**
- Correct technical errors
- Remove sensitive information
- Fix formatting
- Clarify unclear statements

**Best Practices:**
- Add note: "[Edited by Teacher: Fixed code formatting]"
- Don't change the meaning of student posts
- Use sparingly - prefer replies for corrections

**How to Edit:**
1. Click "Edit" on the post
2. Modify content
3. Add reason for edit
4. Save changes

#### Deleting Content

**When to Delete:**
- Spam or advertisements
- Harassment or bullying
- Community guideline violations
- Duplicate posts
- Severely off-topic content

**Types of Deletion:**

**Soft Delete (Recommended):**
- Shows "[Deleted by moderator]"
- Preserves context
- Can be reviewed by admins

**Hard Delete (Permanent):**
- Completely removed
- Affects all child replies
- Cannot be recovered

**How to Delete:**
1. Click "Delete" button
2. Confirm deletion
3. Optionally add reason

**Warning:** Deleting a parent comment deletes all replies (CASCADE delete). Consider editing or soft-deleting instead.

### Responding as a Teacher

**Teacher Badge:**
- Your responses are marked with 👨‍🏫 Teacher badge
- Students immediately recognize official answers
- Badge appears automatically if `is_teacher` = true

**When to Respond:**
- Clarify misconceptions
- Provide official answers
- Encourage student discussion
- Highlight excellent student responses

**Best Practices:**
1. **Don't answer immediately** - Let students try first
2. **Validate student answers** - "Great solution! Here's why it works..."
3. **Add context** - Explain not just what, but why
4. **Encourage peer learning** - "Has anyone else tried this approach?"

### Using the Discussion Analytics

**View Engagement Metrics:**
```sql
SELECT
  COUNT(*) as total_discussions,
  COUNT(DISTINCT user_id) as unique_students,
  AVG(char_length(content)) as avg_response_length
FROM lesson_discussions
WHERE lesson_id = ?
  AND cohort_id = ?;
```

**Identify Struggling Students:**
- Students with few or no posts may need encouragement
- Review their questions for common misunderstandings
- Reach out privately to silent students

**Track Popular Topics:**
- Count discussions per lesson
- Pin discussions for consistently popular topics
- Use as signal to add lesson content

---

## Technical Architecture

### Database Schema

**Three Main Tables:**

**1. lesson_discussions**
```
id              UUID PRIMARY KEY
lesson_id       INTEGER (foreign key to lessons)
cohort_id       UUID (foreign key to cohorts)
user_id         UUID (who posted)
parent_id       UUID (self-reference for threaded replies)
content         TEXT
is_teacher_response BOOLEAN
is_pinned       BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Key Features:**
- `parent_id` creates threaded structure
- `is_pinned` sorts pinned discussions first
- `is_teacher_response` marks teacher replies
- `updated_at` auto-updates on edit

**2. course_forums**
```
id              UUID PRIMARY KEY
course_id       INTEGER (foreign key to courses)
cohort_id       UUID (foreign key to cohorts)
user_id         UUID (who created post)
title           TEXT
content         TEXT
is_pinned       BOOLEAN
is_locked       BOOLEAN (prevents new replies)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**3. forum_replies**
```
id              UUID PRIMARY KEY
forum_post_id   UUID (foreign key to course_forums)
user_id         UUID (who replied)
content         TEXT
is_teacher_response BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Data Flow

```
Student Posts Question
    ↓
INSERT into lesson_discussions (content, parent_id=NULL)
    ↓
Realtime event triggers
    ↓
DiscussionThread component refetches
    ↓
New comment appears in UI (sorted, pinned first)
    ↓
Student Replies to Question
    ↓
INSERT into lesson_discussions (content, parent_id=question_id)
    ↓
Reply appears indented under parent
```

### Real-Time Updates

**Supabase Realtime Subscription:**
```typescript
const channel = supabase
  .channel(`lesson-discussions-${lessonId}-${cohortId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'lesson_discussions'
    },
    () => {
      // Refetch discussions on any change
      fetchComments();
    }
  )
  .subscribe();
```

**Result:** Comments appear instantly for all users viewing the lesson

---

## UI Components & Features

### DiscussionThread Component

**Location:** `/src/components/DiscussionThread.tsx`

**Props:**
```typescript
interface DiscussionThreadProps {
  lessonId: number;        // Which lesson
  cohortId: string;        // Which cohort
  currentUserId: string;   // Logged-in user
  isTeacher: boolean;      // Teacher privileges?
  className?: string;      // CSS classes
}
```

**Features:**
- Loads all comments for a lesson
- Sorts pinned first, then newest
- Subscribes to real-time updates
- Handles edit/delete/pin operations

### Comment Component

**Location:** `/src/components/Comment.tsx`

**Displays:**
- Author name and avatar
- Comment content with relative timestamps
- Teacher badge (if teacher response)
- Pinned badge (if pinned)
- Edit indicator (if edited)

**Actions:**
- Reply (threaded)
- Edit (owner only)
- Delete (owner only)
- Pin/Unpin (teachers only)

### CommentInput Component

**Location:** `/src/components/CommentInput.tsx`

**Features:**
- Rich text input with basic formatting
- Character count
- Auto-grow textarea
- Submit/Cancel buttons
- Placeholder text

### ModerationActions Component

**Location:** `/src/components/ModerationActions.tsx`

**Teachers See:**
- Pin/Unpin button
- Delete button
- Lock button (for forums)
- Edit button

**Students See:**
- Nothing (unless their own post)

---

## Common Tasks

### Task: Answer a Student Question

**Steps:**
1. Navigate to lesson discussion
2. Find the student's question
3. Click "Reply" or "Post Comment"
4. Type your answer
5. Click "Post Reply"

**Best Practice:**
- Explain your reasoning
- Provide examples
- Use clear formatting
- Consider pinning if comprehensive

### Task: Pin a Frequently Asked Question

**Steps:**
1. Open the discussion
2. Click the pin icon (📌)
3. Discussion moves to top
4. All students see it first

**When to Use:**
- Multiple students asking same question
- Essential information
- Common mistakes
- Course announcements

### Task: Lock a Forum to Prevent Off-Topic Discussion

**Steps:**
1. Navigate to forum post
2. Click "Lock Thread"
3. Confirm action
4. Post shows 🔒 locked indicator
5. Students can't reply
6. You can still reply

### Task: Delete Spam

**Steps:**
1. Click "Delete" button on post
2. Confirm deletion
3. Content is removed
4. All replies are also deleted

**Alternative:** Edit post to "[Removed by moderator]" to preserve thread context

### Task: Find Pinned Discussions

**For Students:**
- Scroll to top of discussion section
- Pinned items show 📌 badge
- Appear before unpinned items

**For Teachers:**
- Dashboard → Discussions tab
- Filter: "Show pinned only"
- Bulk actions available

### Task: Monitor Student Participation

**View Engagement:**
1. Dashboard → Students tab
2. See discussion/forum post counts per student
3. Identify students with zero posts
4. Click student to see their activity

**Take Action:**
- Private message: "I noticed you haven't asked questions yet. Do you have any questions?"
- In discussion: Directly respond to encourage participation
- Review their assignments to identify struggles

### Task: Search for a Past Discussion

**Within a Lesson:**
1. Use Cmd+F (Mac) or Ctrl+F (Windows)
2. Search for keywords
3. Click through matches

**Across Course:**
1. Dashboard → Discussions tab
2. Click search box
3. Type search term
4. Results show matching discussions

---

## Troubleshooting

### Issue: I can't see the discussion section

**Causes:**
- Lesson content hasn't loaded
- You're not enrolled in the course
- Discussions are disabled for this course

**Solution:**
1. Refresh the page
2. Verify enrollment: Dashboard → Courses
3. Contact teacher if discussions missing

### Issue: My reply didn't appear

**Causes:**
- Network connectivity issue
- Content was rejected (profanity filter?)
- Real-time subscription failed

**Solution:**
1. Check your internet connection
2. Refresh the page
3. Try posting again
4. Check for error messages

### Issue: I can't edit my post

**Causes:**
- Too much time has passed (future feature limit)
- Post was deleted
- You're not the author

**Solution:**
1. Verify you authored the post
2. Check post wasn't deleted
3. Contact teacher if issue persists

### Issue: Discussions are loading slowly

**Causes:**
- Large number of comments
- Slow internet connection
- Server is busy

**Solution:**
1. Wait a moment for loading to complete
2. Try refreshing
3. Report to admin if consistently slow

### Issue: I see an error message

**Common Errors:**

**"Failed to post comment"**
- Check internet connection
- Try again in a moment
- Contact support with error details

**"You don't have permission"**
- Verify you're logged in
- Verify you're enrolled
- Log out and back in

**"Discussion not found"**
- Lesson may have been deleted
- Course may have been removed
- Refresh and try again

### Issue: Teacher isn't responding

**What to Do:**
1. Review pinned discussions first (might answer question)
2. Check if other students answered
3. Wait 24 hours (teacher response time)
4. Post in course forum for visibility
5. Email teacher directly if urgent

### Issue: Inappropriate Content in Discussion

**Report the Problem:**
1. Note the post ID or screenshot
2. Contact your teacher
3. Use admin reporting tool (if available)
4. DO NOT reply to the inappropriate content

---

## Security & Privacy

### What You Share

**Public:**
- Your name (or email if name not provided)
- Your comments and replies
- Timestamp of posts
- Avatar/profile picture (if uploaded)

**Private:**
- Your email (not visible to other students)
- Your account details
- Your enrollment status (visible to teachers only)

### Best Practices

1. **Don't share personal information:**
   - Phone numbers
   - Addresses
   - Social media accounts
   - Financial information

2. **Don't share credentials:**
   - API keys
   - Passwords
   - Authentication tokens

3. **Be respectful:**
   - No harassment or bullying
   - No discriminatory language
   - No spam or self-promotion

4. **Don't cheat:**
   - Don't share assignment answers
   - Don't ask others to do your work
   - Don't post during assessments

---

## API Reference

### Endpoints (For Developers)

**Create Discussion:**
```
POST /api/discussions
{
  lesson_id: number,
  cohort_id: string,
  content: string,
  parent_id?: string  // For replies
}
```

**Get Discussions:**
```
GET /api/discussions?lesson_id=X&cohort_id=Y
```

**Update Discussion:**
```
PATCH /api/discussions/:id
{
  content: string,
  is_pinned?: boolean
}
```

**Delete Discussion:**
```
DELETE /api/discussions/:id
```

**Pin Discussion:**
```
PATCH /api/discussions/:id/pin
{
  is_pinned: boolean
}
```

---

## Related Documentation

- **Moderation Guide:** `docs/guides/moderation.md` (Teachers)
- **Community Guidelines:** `docs/guides/community-guidelines.md` (Students)
- **Database Schema:** `schema.sql` (Developers)
- **ERD Diagram:** `docs/diagrams/discussion-erd.md` (Architecture)
- **Teacher Training:** `docs/guides/teacher-training-moderation.md`

---

## Support

**Have Questions?**
- Review relevant section in this guide
- Check the FAQ section of your guide
- Contact your teacher
- Email support@c4c.com

**Found a Bug?**
- Note what happened
- Steps to reproduce
- Your browser and device
- Contact support with details

**Feature Request?**
- Post in "Feature Requests" forum
- Describe the feature and why it's needed
- Vote on existing feature requests

---

**Document Status:** Complete
**Last Updated:** October 29, 2025
**Version:** 1.0.0

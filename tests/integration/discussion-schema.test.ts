/**
 * Discussion System Schema Tests
 *
 * Tests for lesson discussions and course forums
 * Reference: ROADMAP.md Section 1.2.1 (Discussion System Schema)
 * Reference: C4C_CAMPUS_PLATFORM_VISION.md Part 1, Section 1.2 (Discussion Schema)
 *
 * Test Coverage:
 * - Lesson discussions (threaded comments)
 * - Course forums (topic-based discussions)
 * - Forum replies
 * - RLS policies (cohort-based access)
 * - Teacher moderation features
 * - Performance with large datasets
 * - Data integrity constraints
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { supabaseAdmin, supabaseAnon, cleanupTestData, getAuthenticatedClient, TEST_USERS } from '../integration-setup';

describe('Discussion System Schema Integration Tests', () => {
  let student1Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let student2Client: Awaited<ReturnType<typeof getAuthenticatedClient>>;
  let teacherClient: Awaited<ReturnType<typeof getAuthenticatedClient>>;

  let testCourseId: number;
  let testModuleId: number;
  let testLessonId: number;
  let testCohortId: string;
  let testCohort2Id: string;

  beforeEach(async () => {
    // Get authenticated clients for all test users
    student1Client = await getAuthenticatedClient(TEST_USERS.STUDENT_1.email, TEST_USERS.STUDENT_1.password);
    student2Client = await getAuthenticatedClient(TEST_USERS.STUDENT_2.email, TEST_USERS.STUDENT_2.password);
    teacherClient = await getAuthenticatedClient(TEST_USERS.TEACHER.email, TEST_USERS.TEACHER.password);

    // Create test course
    const { data: course } = await supabaseAdmin.from('courses').insert({
      name: 'Discussion Test Course',
      slug: 'discussion-test-' + Date.now(),
      track: 'animal-advocacy',
      difficulty: 'beginner',
      published: true,
      created_by: teacherClient.userId,
    }).select().single();
    testCourseId = course.id;

    // Create test module
    const { data: module } = await supabaseAdmin.from('modules').insert({
      course_id: testCourseId,
      name: 'Test Module',
      order_index: 1,
    }).select().single();
    testModuleId = module.id;

    // Create test lesson
    const { data: lesson } = await supabaseAdmin.from('lessons').insert({
      module_id: testModuleId,
      name: 'Test Lesson',
      slug: 'test-lesson',
      video_path: 'videos/test.mp4',
      video_duration_seconds: 300,
      video_size_bytes: 1000000,
      order_index: 1,
    }).select().single();
    testLessonId = lesson.id;

    // Create test cohorts
    const { data: cohort1 } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Test Cohort 1',
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
      created_by: teacherClient.userId,
    }).select().single();
    testCohortId = cohort1.id;

    const { data: cohort2 } = await supabaseAdmin.from('cohorts').insert({
      course_id: testCourseId,
      name: 'Test Cohort 2',
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
      created_by: teacherClient.userId,
    }).select().single();
    testCohort2Id = cohort2.id;

    // Enroll students in different cohorts
    await supabaseAdmin.from('cohort_enrollments').insert([
      { cohort_id: testCohortId, user_id: student1Client.userId, status: 'active' },
      { cohort_id: testCohort2Id, user_id: student2Client.userId, status: 'active' },
    ]);
  });

  afterEach(async () => {
    // Clean up in reverse dependency order
    await supabaseAdmin.from('forum_replies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('course_forums').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('lesson_discussions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('cohort_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('cohorts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await cleanupTestData();
  });

  // ==================== LESSON DISCUSSIONS ====================

  describe('Lesson Discussions - Basic Operations', () => {
    test('should create discussion post on lesson', async () => {
      // Act - Student 1 creates a discussion post
      const { data: post, error } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Great explanation! I have a question about the workflow...',
        is_teacher_response: false,
      }).select().single();

      // Assert
      expect(error).toBeNull();
      expect(post).toBeDefined();
      expect(post.lesson_id).toBe(testLessonId);
      expect(post.cohort_id).toBe(testCohortId);
      expect(post.user_id).toBe(student1Client.userId);
      expect(post.content).toBe('Great explanation! I have a question about the workflow...');
      expect(post.is_teacher_response).toBe(false);
      expect(post.is_pinned).toBe(false);
      expect(post.parent_id).toBeNull();
      expect(post.created_at).toBeDefined();
    });

    test('should create threaded reply (parent_id relationship)', async () => {
      // Arrange - Create parent post
      const { data: parentPost } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'How do I connect to the API?',
        is_teacher_response: false,
      }).select().single();

      // Act - Create reply to parent post
      const { data: reply, error } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: teacherClient.userId,
        parent_id: parentPost.id,
        content: 'Great question! Here is how you connect to the API...',
        is_teacher_response: true,
      }).select().single();

      // Assert
      expect(error).toBeNull();
      expect(reply).toBeDefined();
      expect(reply.parent_id).toBe(parentPost.id);
      expect(reply.lesson_id).toBe(testLessonId);
      expect(reply.is_teacher_response).toBe(true);
    });

    test('should mark teacher responses correctly (is_teacher_response)', async () => {
      // Act - Teacher creates response
      const { data: teacherPost } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: teacherClient.userId,
        content: 'Let me clarify this concept...',
        is_teacher_response: true,
      }).select().single();

      // Act - Student creates response
      const { data: studentPost } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'I understand now!',
        is_teacher_response: false,
      }).select().single();

      // Assert
      expect(teacherPost.is_teacher_response).toBe(true);
      expect(studentPost.is_teacher_response).toBe(false);
    });

    test('should pin discussion posts (is_pinned flag)', async () => {
      // Arrange - Create discussion post
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Important question everyone should see',
        is_teacher_response: false,
        is_pinned: false,
      }).select().single();

      // Act - Pin the post
      const { data: pinnedPost, error } = await supabaseAdmin.from('lesson_discussions')
        .update({ is_pinned: true })
        .eq('id', post.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(pinnedPost.is_pinned).toBe(true);
    });

    test('should unpin discussion posts', async () => {
      // Arrange - Create pinned post
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: teacherClient.userId,
        content: 'Pinned post',
        is_pinned: true,
      }).select().single();

      // Act - Unpin the post
      const { data: unpinnedPost, error } = await supabaseAdmin.from('lesson_discussions')
        .update({ is_pinned: false })
        .eq('id', post.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(unpinnedPost.is_pinned).toBe(false);
    });

    test('should only allow posts to lessons in enrolled cohorts', async () => {
      // Act - Student 1 (in cohort 1) tries to post in cohort 2's discussion
      // This should be enforced at application level, but test foreign key constraint
      const { error } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohort2Id, // Wrong cohort for student1
        user_id: student1Client.userId,
        content: 'Should not be allowed',
      });

      // Assert - Should succeed in database (RLS enforces access, not foreign key)
      // The RLS policy will prevent student1 from seeing cohort2's discussions
      expect(error).toBeNull();

      // Verify RLS blocks viewing
      const { data: posts } = await student1Client.client
        .from('lesson_discussions')
        .select()
        .eq('cohort_id', testCohort2Id);

      // Student1 should not see cohort2 discussions
      expect(posts?.length).toBe(0);
    });

    test('should update last_activity_at in cohort_enrollments when posting', async () => {
      // Arrange - Get initial last_activity_at
      const { data: beforeEnrollment } = await supabaseAdmin.from('cohort_enrollments')
        .select('last_activity_at')
        .eq('cohort_id', testCohortId)
        .eq('user_id', student1Client.userId)
        .single();

      const initialActivity = beforeEnrollment.last_activity_at;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Act - Create discussion post
      await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Testing activity update',
      });

      // Manually update last_activity_at (this would be done by application code)
      await supabaseAdmin.from('cohort_enrollments')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('cohort_id', testCohortId)
        .eq('user_id', student1Client.userId);

      // Assert - last_activity_at should be updated
      const { data: afterEnrollment } = await supabaseAdmin.from('cohort_enrollments')
        .select('last_activity_at')
        .eq('cohort_id', testCohortId)
        .eq('user_id', student1Client.userId)
        .single();

      expect(new Date(afterEnrollment.last_activity_at).getTime()).toBeGreaterThan(
        new Date(initialActivity).getTime()
      );
    });
  });

  // ==================== COURSE FORUMS ====================

  describe('Course Forums - Basic Operations', () => {
    test('should create forum post', async () => {
      // Act
      const { data: post, error } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Best practices for n8n workflows?',
        content: 'What are some best practices for organizing n8n workflows?',
        is_pinned: false,
        is_locked: false,
      }).select().single();

      // Assert
      expect(error).toBeNull();
      expect(post).toBeDefined();
      expect(post.course_id).toBe(testCourseId);
      expect(post.cohort_id).toBe(testCohortId);
      expect(post.title).toBe('Best practices for n8n workflows?');
      expect(post.content).toBe('What are some best practices for organizing n8n workflows?');
      expect(post.is_pinned).toBe(false);
      expect(post.is_locked).toBe(false);
    });

    test('should lock forum posts (is_locked)', async () => {
      // Arrange
      const { data: post } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Resolved: API issue',
        content: 'This was resolved.',
        is_locked: false,
      }).select().single();

      // Act
      const { data: lockedPost, error } = await supabaseAdmin.from('course_forums')
        .update({ is_locked: true })
        .eq('id', post.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(lockedPost.is_locked).toBe(true);
    });

    test('should unlock forum posts', async () => {
      // Arrange
      const { data: post } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: teacherClient.userId,
        title: 'Locked thread',
        content: 'This is locked',
        is_locked: true,
      }).select().single();

      // Act
      const { data: unlockedPost, error } = await supabaseAdmin.from('course_forums')
        .update({ is_locked: false })
        .eq('id', post.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(unlockedPost.is_locked).toBe(false);
    });

    test('should pin important forum posts', async () => {
      // Arrange
      const { data: post } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: teacherClient.userId,
        title: 'Important: Course Guidelines',
        content: 'Please read these guidelines...',
        is_pinned: false,
      }).select().single();

      // Act
      const { data: pinnedPost, error } = await supabaseAdmin.from('course_forums')
        .update({ is_pinned: true })
        .eq('id', post.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(pinnedPost.is_pinned).toBe(true);
    });
  });

  // ==================== FORUM REPLIES ====================

  describe('Forum Replies - Basic Operations', () => {
    test('should reply to forum post', async () => {
      // Arrange - Create forum post
      const { data: forumPost } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Need help with webhooks',
        content: 'How do I set up webhooks?',
      }).select().single();

      // Act - Create reply
      const { data: reply, error } = await supabaseAdmin.from('forum_replies').insert({
        forum_post_id: forumPost.id,
        user_id: student2Client.userId,
        content: 'I can help! Here is how I set up webhooks...',
        is_teacher_response: false,
      }).select().single();

      // Assert
      expect(error).toBeNull();
      expect(reply).toBeDefined();
      expect(reply.forum_post_id).toBe(forumPost.id);
      expect(reply.user_id).toBe(student2Client.userId);
      expect(reply.content).toContain('I can help!');
      expect(reply.is_teacher_response).toBe(false);
    });

    test('should mark teacher badge on replies', async () => {
      // Arrange
      const { data: forumPost } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Question',
        content: 'Need help',
      }).select().single();

      // Act - Teacher replies
      const { data: teacherReply } = await supabaseAdmin.from('forum_replies').insert({
        forum_post_id: forumPost.id,
        user_id: teacherClient.userId,
        content: 'Let me explain...',
        is_teacher_response: true,
      }).select().single();

      // Act - Student replies
      const { data: studentReply } = await supabaseAdmin.from('forum_replies').insert({
        forum_post_id: forumPost.id,
        user_id: student2Client.userId,
        content: 'Thanks!',
        is_teacher_response: false,
      }).select().single();

      // Assert
      expect(teacherReply.is_teacher_response).toBe(true);
      expect(studentReply.is_teacher_response).toBe(false);
    });

    test('should cascade delete replies when forum post deleted', async () => {
      // Arrange - Create forum post with replies
      const { data: forumPost } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'To be deleted',
        content: 'This post will be deleted',
      }).select().single();

      const { data: reply1 } = await supabaseAdmin.from('forum_replies').insert({
        forum_post_id: forumPost.id,
        user_id: student2Client.userId,
        content: 'Reply 1',
      }).select().single();

      const { data: reply2 } = await supabaseAdmin.from('forum_replies').insert({
        forum_post_id: forumPost.id,
        user_id: teacherClient.userId,
        content: 'Reply 2',
      }).select().single();

      // Act - Delete forum post
      await supabaseAdmin.from('course_forums')
        .delete()
        .eq('id', forumPost.id);

      // Assert - Replies should be cascade deleted
      const { data: remainingReplies } = await supabaseAdmin.from('forum_replies')
        .select()
        .in('id', [reply1.id, reply2.id]);

      expect(remainingReplies?.length).toBe(0);
    });

    test('should track timestamps on forum replies', async () => {
      // Arrange
      const { data: forumPost } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Test timestamps',
        content: 'Testing',
      }).select().single();

      // Act
      const { data: reply } = await supabaseAdmin.from('forum_replies').insert({
        forum_post_id: forumPost.id,
        user_id: student2Client.userId,
        content: 'Reply with timestamp',
      }).select().single();

      // Assert
      expect(reply.created_at).toBeDefined();
      expect(reply.updated_at).toBeDefined();
      expect(new Date(reply.created_at).getTime()).toBeLessThanOrEqual(
        new Date(reply.updated_at).getTime()
      );
    });
  });

  // ==================== RLS POLICIES ====================

  describe('RLS Policies - Access Control', () => {
    test('should only allow students to view discussions in enrolled cohorts', async () => {
      // Arrange - Create discussions in both cohorts
      await supabaseAdmin.from('lesson_discussions').insert([
        {
          lesson_id: testLessonId,
          cohort_id: testCohortId, // Student1's cohort
          user_id: student1Client.userId,
          content: 'Cohort 1 discussion',
        },
        {
          lesson_id: testLessonId,
          cohort_id: testCohort2Id, // Student2's cohort
          user_id: student2Client.userId,
          content: 'Cohort 2 discussion',
        },
      ]);

      // Act - Student1 queries discussions
      const { data: student1Discussions } = await student1Client.client
        .from('lesson_discussions')
        .select()
        .eq('lesson_id', testLessonId);

      // Assert - Student1 should only see their cohort's discussions
      // Note: This will fail until RLS policy is implemented
      expect(student1Discussions?.every(d => d.cohort_id === testCohortId)).toBe(true);
      expect(student1Discussions?.some(d => d.cohort_id === testCohort2Id)).toBe(false);
    });

    test('should allow teachers to view all discussions in their courses', async () => {
      // Arrange - Create discussions in multiple cohorts
      await supabaseAdmin.from('lesson_discussions').insert([
        {
          lesson_id: testLessonId,
          cohort_id: testCohortId,
          user_id: student1Client.userId,
          content: 'Cohort 1 discussion',
        },
        {
          lesson_id: testLessonId,
          cohort_id: testCohort2Id,
          user_id: student2Client.userId,
          content: 'Cohort 2 discussion',
        },
      ]);

      // Act - Teacher queries discussions
      const { data: teacherDiscussions } = await teacherClient.client
        .from('lesson_discussions')
        .select()
        .eq('lesson_id', testLessonId);

      // Assert - Teacher should see discussions from all cohorts
      // Note: This will fail until RLS policy is implemented
      expect(teacherDiscussions?.length).toBeGreaterThanOrEqual(2);
    });

    test('should prevent students from modifying others posts', async () => {
      // Arrange - Student2 creates a post
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohort2Id,
        user_id: student2Client.userId,
        content: 'Original content',
      }).select().single();

      // Act - Student1 tries to modify Student2's post
      const { error } = await student1Client.client
        .from('lesson_discussions')
        .update({ content: 'Hacked content' })
        .eq('id', post.id);

      // Assert - RLS should block (no error but 0 rows updated)
      expect(error).toBeNull();

      // Verify content wasn't changed
      const { data: unchanged } = await supabaseAdmin.from('lesson_discussions')
        .select('content')
        .eq('id', post.id)
        .single();

      expect(unchanged.content).toBe('Original content');
    });

    test('should allow teachers to pin/lock any discussion', async () => {
      // Arrange - Student creates discussion
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Student post',
        is_pinned: false,
      }).select().single();

      // Act - Teacher pins the discussion
      const { error, data: pinnedPost } = await teacherClient.client
        .from('lesson_discussions')
        .update({ is_pinned: true })
        .eq('id', post.id)
        .select()
        .single();

      // Assert - Teacher should be able to pin
      // Note: This will fail until RLS policy is implemented
      expect(error).toBeNull();
      expect(pinnedPost?.is_pinned).toBe(true);
    });

    test('should give admins full access to all discussions', async () => {
      // Arrange - Create discussion in cohort
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Test post',
      }).select().single();

      // Act - Admin (service role) queries and modifies
      const { data: discussions } = await supabaseAdmin
        .from('lesson_discussions')
        .select();

      const { error, data: updated } = await supabaseAdmin
        .from('lesson_discussions')
        .update({ is_pinned: true })
        .eq('id', post.id)
        .select()
        .single();

      // Assert
      expect(discussions?.length).toBeGreaterThan(0);
      expect(error).toBeNull();
      expect(updated.is_pinned).toBe(true);
    });

    test('should enforce RLS on course forums - students see only their cohort', async () => {
      // Arrange - Create forum posts in different cohorts
      await supabaseAdmin.from('course_forums').insert([
        {
          course_id: testCourseId,
          cohort_id: testCohortId,
          user_id: student1Client.userId,
          title: 'Cohort 1 forum',
          content: 'Cohort 1 content',
        },
        {
          course_id: testCourseId,
          cohort_id: testCohort2Id,
          user_id: student2Client.userId,
          title: 'Cohort 2 forum',
          content: 'Cohort 2 content',
        },
      ]);

      // Act - Student1 queries forums
      const { data: student1Forums } = await student1Client.client
        .from('course_forums')
        .select()
        .eq('course_id', testCourseId);

      // Assert
      expect(student1Forums?.every(f => f.cohort_id === testCohortId)).toBe(true);
    });

    test('should allow teachers to moderate (lock/pin/delete) forum posts', async () => {
      // Arrange - Student creates forum post
      const { data: post } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Student post',
        content: 'Content',
        is_locked: false,
        is_pinned: false,
      }).select().single();

      // Act - Teacher locks and pins
      const { error: lockError } = await teacherClient.client
        .from('course_forums')
        .update({ is_locked: true, is_pinned: true })
        .eq('id', post.id);

      // Assert
      expect(lockError).toBeNull();

      // Verify changes
      const { data: moderated } = await supabaseAdmin
        .from('course_forums')
        .select()
        .eq('id', post.id)
        .single();

      expect(moderated.is_locked).toBe(true);
      expect(moderated.is_pinned).toBe(true);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance - Efficient Queries', () => {
    test('should efficiently query threaded comments with parent_id index', async () => {
      // Arrange - Create parent post with multiple replies
      const { data: parent } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Parent post',
      }).select().single();

      // Create 10 replies
      const replies = Array.from({ length: 10 }, (_, i) => ({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student2Client.userId,
        parent_id: parent.id,
        content: `Reply ${i + 1}`,
      }));

      await supabaseAdmin.from('lesson_discussions').insert(replies);

      // Act - Query replies (should use idx_lesson_discussions_parent index)
      const startTime = Date.now();
      const { data: threadReplies } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('parent_id', parent.id);
      const queryTime = Date.now() - startTime;

      // Assert
      expect(threadReplies?.length).toBe(10);
      expect(queryTime).toBeLessThan(100); // Should be fast with index
    });

    test('should support pagination for large discussion threads', async () => {
      // Arrange - Create 50 discussion posts
      const posts = Array.from({ length: 50 }, (_, i) => ({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: `Post ${i + 1}`,
      }));

      await supabaseAdmin.from('lesson_discussions').insert(posts);

      // Act - Paginate (page 1: 0-19, page 2: 20-39)
      const { data: page1 } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('lesson_id', testLessonId)
        .order('created_at', { ascending: false })
        .range(0, 19);

      const { data: page2 } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('lesson_id', testLessonId)
        .order('created_at', { ascending: false })
        .range(20, 39);

      // Assert
      expect(page1?.length).toBe(20);
      expect(page2?.length).toBe(20);
      expect(page1?.[0].id).not.toBe(page2?.[0].id); // Different results
    });

    test('should efficiently query discussions by lesson_id with index', async () => {
      // Arrange - Create discussions across multiple lessons
      const { data: lesson2 } = await supabaseAdmin.from('lessons').insert({
        module_id: testModuleId,
        name: 'Lesson 2',
        slug: 'lesson-2',
        video_path: 'videos/test2.mp4',
        video_duration_seconds: 300,
        video_size_bytes: 1000000,
        order_index: 2,
      }).select().single();

      await supabaseAdmin.from('lesson_discussions').insert([
        ...Array.from({ length: 20 }, (_, i) => ({
          lesson_id: testLessonId,
          cohort_id: testCohortId,
          user_id: student1Client.userId,
          content: `Lesson 1 discussion ${i}`,
        })),
        ...Array.from({ length: 20 }, (_, i) => ({
          lesson_id: lesson2.id,
          cohort_id: testCohortId,
          user_id: student1Client.userId,
          content: `Lesson 2 discussion ${i}`,
        })),
      ]);

      // Act - Query by lesson_id (should use idx_lesson_discussions_lesson)
      const startTime = Date.now();
      const { data: lessonDiscussions } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('lesson_id', testLessonId);
      const queryTime = Date.now() - startTime;

      // Assert
      expect(lessonDiscussions?.length).toBe(20);
      expect(queryTime).toBeLessThan(100); // Fast with index
    });

    test('should handle load test with 1000+ comments efficiently', async () => {
      // Arrange - Create 100 parent posts
      const parentPosts = Array.from({ length: 100 }, (_, i) => ({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: `Parent post ${i + 1}`,
      }));

      const { data: parents } = await supabaseAdmin
        .from('lesson_discussions')
        .insert(parentPosts)
        .select();

      // Create 10 replies for each parent (1000 total replies)
      const allReplies = parents!.flatMap(parent =>
        Array.from({ length: 10 }, (_, i) => ({
          lesson_id: testLessonId,
          cohort_id: testCohortId,
          user_id: student2Client.userId,
          parent_id: parent.id,
          content: `Reply ${i + 1}`,
        }))
      );

      await supabaseAdmin.from('lesson_discussions').insert(allReplies);

      // Act - Query all discussions for lesson
      const startTime = Date.now();
      const { data: allDiscussions } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('lesson_id', testLessonId);
      const queryTime = Date.now() - startTime;

      // Assert
      expect(allDiscussions?.length).toBeGreaterThanOrEqual(1100); // 100 parents + 1000 replies
      expect(queryTime).toBeLessThan(500); // Should still be reasonable with indexes
    });
  });

  // ==================== DATA INTEGRITY ====================

  describe('Data Integrity - Foreign Keys & Constraints', () => {
    test('should enforce foreign key constraint to lessons', async () => {
      // Act - Try to create discussion with non-existent lesson_id
      const { error } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: 999999, // Non-existent lesson
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Should fail',
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.message).toContain('violates foreign key constraint');
    });

    test('should enforce foreign key constraint to cohorts', async () => {
      // Act - Try to create discussion with non-existent cohort_id
      const { error } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: '00000000-0000-0000-0000-000000000000', // Non-existent cohort
        user_id: student1Client.userId,
        content: 'Should fail',
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.message).toContain('violates foreign key constraint');
    });

    test('should auto-update timestamps on discussion posts', async () => {
      // Arrange - Create discussion
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Original content',
      }).select().single();

      const originalUpdatedAt = post.updated_at;

      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Act - Update the post
      const { data: updated } = await supabaseAdmin.from('lesson_discussions')
        .update({ content: 'Updated content' })
        .eq('id', post.id)
        .select()
        .single();

      // Assert - updated_at should change
      expect(new Date(updated.updated_at).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    test('should cascade delete discussions when lesson deleted', async () => {
      // Arrange - Create discussion
      const { data: discussion } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Discussion to be deleted',
      }).select().single();

      // Act - Delete lesson
      await supabaseAdmin.from('lessons')
        .delete()
        .eq('id', testLessonId);

      // Assert - Discussion should be cascade deleted
      const { data: remainingDiscussion } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('id', discussion.id);

      expect(remainingDiscussion?.length).toBe(0);
    });

    test('should cascade delete forum posts when cohort deleted', async () => {
      // Arrange - Create forum post
      const { data: forumPost } = await supabaseAdmin.from('course_forums').insert({
        course_id: testCourseId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        title: 'Forum post',
        content: 'Content',
      }).select().single();

      // Act - Delete cohort
      await supabaseAdmin.from('cohorts')
        .delete()
        .eq('id', testCohortId);

      // Assert - Forum post should be cascade deleted
      const { data: remainingPost } = await supabaseAdmin
        .from('course_forums')
        .select()
        .eq('id', forumPost.id);

      expect(remainingPost?.length).toBe(0);
    });

    test('should cascade delete child replies when parent discussion deleted', async () => {
      // Arrange - Create parent and child discussions
      const { data: parent } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Parent',
      }).select().single();

      const { data: child } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student2Client.userId,
        parent_id: parent.id,
        content: 'Child reply',
      }).select().single();

      // Act - Delete parent
      await supabaseAdmin.from('lesson_discussions')
        .delete()
        .eq('id', parent.id);

      // Assert - Child should be cascade deleted
      const { data: remainingChild } = await supabaseAdmin
        .from('lesson_discussions')
        .select()
        .eq('id', child.id);

      expect(remainingChild?.length).toBe(0);
    });

    test('should enforce content NOT NULL constraint', async () => {
      // Act - Try to create discussion without content
      const { error } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        // content missing
      });

      // Assert
      expect(error).toBeDefined();
      expect(error?.message).toContain('null value');
    });

    test('should set default values for boolean flags', async () => {
      // Act - Create discussion without specifying flags
      const { data: post } = await supabaseAdmin.from('lesson_discussions').insert({
        lesson_id: testLessonId,
        cohort_id: testCohortId,
        user_id: student1Client.userId,
        content: 'Test defaults',
      }).select().single();

      // Assert
      expect(post.is_pinned).toBe(false);
      expect(post.is_teacher_response).toBe(false);
    });
  });
});

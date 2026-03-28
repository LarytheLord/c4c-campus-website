/**
 * Comment Component Tests
 *
 * Tests for individual comment display and interactions
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Comment } from '../../src/components/Comment';
import type { LessonDiscussion, UserProfile } from '../../src/types';

describe('Comment Component', () => {
  const mockComment: LessonDiscussion = {
    id: 'comment-1',
    lesson_id: 1,
    cohort_id: 'cohort-1',
    user_id: 'user-1',
    parent_id: null,
    content: 'This is a test comment',
    is_teacher_response: false,
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockAuthor: UserProfile = {
    id: 'user-1',
    email: 'student@example.com',
    name: 'Test Student',
  };

  test('renders comment content', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
      />
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Test Student')).toBeInTheDocument();
  });

  test('displays teacher badge for teacher responses', () => {
    const teacherComment = { ...mockComment, is_teacher_response: true };
    const teacherAuthor = { ...mockAuthor, is_teacher: true };

    render(
      <Comment
        comment={teacherComment}
        author={teacherAuthor}
        currentUserId="user-2"
        isTeacher={false}
      />
    );

    expect(screen.getByText('Teacher')).toBeInTheDocument();
  });

  test('displays pinned badge for pinned comments', () => {
    const pinnedComment = { ...mockComment, is_pinned: true };

    render(
      <Comment
        comment={pinnedComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
      />
    );

    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  test('shows edit and delete buttons for own comment', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-1"
        isTeacher={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('does not show edit/delete for other users comments', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('shows reply button when onReply provided', () => {
    const onReply = vi.fn();

    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
        onReply={onReply}
      />
    );

    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  test('calls onReply when reply button clicked', () => {
    const onReply = vi.fn();

    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
        onReply={onReply}
      />
    );

    fireEvent.click(screen.getByText('Reply'));
    expect(onReply).toHaveBeenCalledWith('comment-1');
  });

  test('enters edit mode when edit button clicked', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-1"
        isTeacher={false}
        onEdit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByDisplayValue('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls onEdit when save button clicked after editing', () => {
    const onEdit = vi.fn();

    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-1"
        isTeacher={false}
        onEdit={onEdit}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change content
    const textarea = screen.getByDisplayValue('This is a test comment');
    fireEvent.change(textarea, { target: { value: 'Updated comment' } });

    // Save
    fireEvent.click(screen.getByText('Save'));

    expect(onEdit).toHaveBeenCalledWith('comment-1', 'Updated comment');
  });

  test('cancels edit mode when cancel button clicked', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-1"
        isTeacher={false}
        onEdit={vi.fn()}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Save')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  test('shows moderation actions for teachers', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={true}
        onPin={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // ModerationActions component should be rendered
    expect(screen.getByLabelText('Moderation actions')).toBeInTheDocument();
  });

  test('applies correct nesting depth styling', () => {
    const { container } = render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
        depth={2}
      />
    );

    const commentDiv = container.firstChild as HTMLElement;
    expect(commentDiv.className).toContain('ml-8');
  });

  test('hides reply button at max depth', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
        onReply={vi.fn()}
        depth={3}
      />
    );

    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  test('shows edited indicator when comment was edited', () => {
    const editedComment = {
      ...mockComment,
      updated_at: new Date(Date.now() + 60000).toISOString(), // 1 minute later
    };

    render(
      <Comment
        comment={editedComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
      />
    );

    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  test('renders user avatar if provided', () => {
    const authorWithAvatar = {
      ...mockAuthor,
      avatar_url: 'https://example.com/avatar.jpg',
    };

    render(
      <Comment
        comment={mockComment}
        author={authorWithAvatar}
        currentUserId="user-2"
        isTeacher={false}
      />
    );

    const avatar = screen.getByAltText('Test Student');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('renders fallback avatar with initial if no avatar provided', () => {
    render(
      <Comment
        comment={mockComment}
        author={mockAuthor}
        currentUserId="user-2"
        isTeacher={false}
      />
    );

    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test Student"
  });
});

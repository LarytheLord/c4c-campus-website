/**
 * ModerationActions Component Tests
 *
 * Tests for teacher moderation controls
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModerationActions } from '../../src/components/ModerationActions';

describe('ModerationActions Component', () => {
  test('renders menu button', () => {
    render(<ModerationActions commentId="comment-1" />);

    expect(screen.getByLabelText('Moderation actions')).toBeInTheDocument();
  });

  test('opens dropdown menu when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <ModerationActions
        commentId="comment-1"
        onPin={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  test('shows pin option when onPin provided', async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();

    render(
      <ModerationActions commentId="comment-1" onPin={onPin} />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Pin')).toBeInTheDocument();
    });
  });

  test('shows unpin option when comment is pinned', async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();

    render(
      <ModerationActions commentId="comment-1" isPinned={true} onPin={onPin} />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Unpin')).toBeInTheDocument();
    });
  });

  test('calls onPin with correct arguments when pin clicked', async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();

    render(
      <ModerationActions commentId="comment-1" isPinned={false} onPin={onPin} />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    const pinButton = await screen.findByText('Pin');
    await user.click(pinButton);

    expect(onPin).toHaveBeenCalledWith('comment-1', true);
  });

  test('calls onPin with false when unpin clicked', async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();

    render(
      <ModerationActions commentId="comment-1" isPinned={true} onPin={onPin} />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    const unpinButton = await screen.findByText('Unpin');
    await user.click(unpinButton);

    expect(onPin).toHaveBeenCalledWith('comment-1', false);
  });

  test('shows lock option for forum posts', async () => {
    const user = userEvent.setup();
    const onLock = vi.fn();

    render(
      <ModerationActions forumPostId="post-1" onLock={onLock} />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Lock Thread')).toBeInTheDocument();
    });
  });

  test('shows unlock option when forum post is locked', async () => {
    const user = userEvent.setup();
    const onLock = vi.fn();

    render(
      <ModerationActions forumPostId="post-1" isLocked={true} onLock={onLock} />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Unlock Thread')).toBeInTheDocument();
    });
  });

  test('does not show lock option for comments', async () => {
    const user = userEvent.setup();
    const onLock = vi.fn();

    render(
      <ModerationActions commentId="comment-1" onLock={onLock} />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.queryByText('Lock Thread')).not.toBeInTheDocument();
    });
  });

  test('calls onLock with correct arguments', async () => {
    const user = userEvent.setup();
    const onLock = vi.fn();

    render(
      <ModerationActions forumPostId="post-1" isLocked={false} onLock={onLock} />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    const lockButton = await screen.findByText('Lock Thread');
    await user.click(lockButton);

    expect(onLock).toHaveBeenCalledWith('post-1', true);
  });

  test('shows delete option when onDelete provided', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <ModerationActions commentId="comment-1" onDelete={onDelete} />
    );

    const button = screen.getByLabelText('Moderation actions');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  test('shows confirmation dialog before deleting', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <ModerationActions commentId="comment-1" onDelete={onDelete} />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    const deleteButton = await screen.findByText('Delete');
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('comment-1');

    confirmSpy.mockRestore();
  });

  test('does not delete if confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <ModerationActions commentId="comment-1" onDelete={onDelete} />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    const deleteButton = await screen.findByText('Delete');
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  test('closes dropdown after action', async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();

    render(
      <ModerationActions commentId="comment-1" onPin={onPin} />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    const pinButton = await screen.findByText('Pin');
    await user.click(pinButton);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <ModerationActions commentId="comment-1" onPin={vi.fn()} />
        <button>Outside</button>
      </div>
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    const outsideButton = screen.getByText('Outside');
    await user.click(outsideButton);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('shows divider between pin/lock and delete actions', async () => {
    const user = userEvent.setup();

    render(
      <ModerationActions
        commentId="comment-1"
        onPin={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const menuButton = screen.getByLabelText('Moderation actions');
    await user.click(menuButton);

    await waitFor(() => {
      const menu = screen.getByRole('menu');
      const dividers = menu.querySelectorAll('.border-t');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  test('renders nothing when no id provided', () => {
    const { container } = render(
      <ModerationActions onPin={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('applies custom className', () => {
    const { container } = render(
      <ModerationActions commentId="comment-1" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

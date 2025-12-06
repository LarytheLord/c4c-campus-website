/**
 * Tests for Leaderboard Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Leaderboard from '../../src/components/Leaderboard';
import type { LeaderboardEntry } from '../../src/types';

describe('Leaderboard Component', () => {
  const mockEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      user_id: 'user-1',
      name: 'Alice Johnson',
      completed_lessons: 20,
      completion_percentage: 100,
      time_spent_hours: 25.5,
      last_activity_at: new Date().toISOString()
    },
    {
      rank: 2,
      user_id: 'user-2',
      name: 'Bob Smith',
      completed_lessons: 18,
      completion_percentage: 90,
      time_spent_hours: 22.0,
      last_activity_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      rank: 3,
      user_id: 'user-3',
      name: 'Carol White',
      completed_lessons: 16,
      completion_percentage: 80,
      time_spent_hours: 20.5,
      last_activity_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      rank: 4,
      user_id: 'user-4',
      name: 'David Brown',
      completed_lessons: 14,
      completion_percentage: 70,
      time_spent_hours: 18.0,
      last_activity_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      rank: 5,
      user_id: 'user-5',
      name: 'Emma Davis',
      completed_lessons: 12,
      completion_percentage: 60,
      time_spent_hours: 15.5,
      last_activity_at: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    },
    {
      rank: 6,
      user_id: 'user-6',
      name: 'Frank Miller',
      completed_lessons: 10,
      completion_percentage: 50,
      time_spent_hours: 13.0,
      last_activity_at: new Date(Date.now() - 432000000).toISOString() // 5 days ago
    }
  ];

  it('renders loading state correctly', () => {
    render(<Leaderboard entries={[]} loading={true} />);
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders empty state when no entries', () => {
    render(<Leaderboard entries={[]} loading={false} />);
    expect(screen.getByText(/No student progress yet/)).toBeDefined();
  });

  it('renders leaderboard header', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('Top Performers')).toBeDefined();
    expect(screen.getByText('Students leading the way')).toBeDefined();
  });

  it('displays top 5 entries by default', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    // Alice appears twice (in leaderboard and congratulations message), use getAllByText
    expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0);
    expect(screen.getByText('Bob Smith')).toBeDefined();
    expect(screen.getByText('Carol White')).toBeDefined();
    expect(screen.getByText('David Brown')).toBeDefined();
    expect(screen.getByText('Emma Davis')).toBeDefined();
    // Frank Miller should not be rendered yet (initially hidden)
    expect(screen.queryByText('Frank Miller')).toBeNull();
  });

  it('shows "Show All" button when more than 5 entries', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('Show All (6)')).toBeDefined();
  });

  it('expands to show all entries when "Show All" clicked', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);

    const showAllButton = screen.getByText('Show All (6)');
    fireEvent.click(showAllButton);

    expect(screen.getByText('Frank Miller')).toBeDefined();
    expect(screen.getByText('Show Less')).toBeDefined();
  });

  it('displays medal emojis for top 3', () => {
    const { container } = render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(container.textContent).toContain('🥇');
    expect(container.textContent).toContain('🥈');
    expect(container.textContent).toContain('🥉');
  });

  it('displays rank number for positions 4+', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('#4')).toBeDefined();
    expect(screen.getByText('#5')).toBeDefined();
  });

  it('displays correct completion percentages', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('90%')).toBeDefined();
    expect(screen.getByText('80%')).toBeDefined();
  });

  it('displays completed lessons count', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('20')).toBeDefined(); // Alice's lessons
    expect(screen.getByText('18')).toBeDefined(); // Bob's lessons
  });

  it('displays time spent correctly', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('25.5h')).toBeDefined();
    expect(screen.getByText('22h')).toBeDefined();
  });

  it('formats last activity as "Today" for current day', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('Today')).toBeDefined();
  });

  it('formats last activity as "Yesterday" for 1 day ago', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('Yesterday')).toBeDefined();
  });

  it('shows progress bar for each entry', () => {
    const { container } = render(<Leaderboard entries={mockEntries} loading={false} />);
    const progressBars = container.querySelectorAll('[style*="width: 100%"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('calculates and displays average statistics', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText('Avg. Completion')).toBeDefined();
    expect(screen.getByText('Avg. Lessons')).toBeDefined();
    expect(screen.getByText('Avg. Time')).toBeDefined();
  });

  it('shows congratulations message for 100% completion', () => {
    render(<Leaderboard entries={mockEntries} loading={false} />);
    expect(screen.getByText(/has completed the entire course/)).toBeDefined();
    expect(screen.getByText(/Congratulations!/)).toBeDefined();
  });

  it('does not show congratulations if no 100% completion', () => {
    const incompleteEntries = mockEntries.map(e => ({
      ...e,
      completion_percentage: 90
    }));

    render(<Leaderboard entries={incompleteEntries} loading={false} />);
    expect(screen.queryByText(/has completed the entire course/)).toBeNull();
  });

  it('applies gradient styling to top 3 entries', () => {
    const { container } = render(<Leaderboard entries={mockEntries} loading={false} />);
    const gradientElements = container.querySelectorAll('.bg-gradient-to-r');
    expect(gradientElements.length).toBeGreaterThan(2);
  });

  it('handles single entry correctly', () => {
    const singleEntry = [mockEntries[0]];
    render(<Leaderboard entries={singleEntry} loading={false} />);

    // Alice appears twice (in leaderboard and congratulations message)
    expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0);
    // Show All button should not be present for single entry
    expect(screen.queryByText(/Show All/)).toBeNull();
  });

  it('handles exactly 5 entries without Show All button', () => {
    const fiveEntries = mockEntries.slice(0, 5);
    render(<Leaderboard entries={fiveEntries} loading={false} />);

    expect(screen.queryByText(/Show All/)).toBeNull();
  });
});

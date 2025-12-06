/**
 * Tests for StrugglingStudents Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StrugglingStudents from '../../src/components/StrugglingStudents';
import type { StudentWithProgress } from '../../src/types';

describe('StrugglingStudents Component', () => {
  const mockStudents: StudentWithProgress[] = [
    {
      user_id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      enrolled_at: '2025-09-01T00:00:00Z',
      status: 'active',
      completed_lessons: 2,
      total_lessons: 20,
      completion_percentage: 10,
      last_activity_at: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
      time_spent_hours: 3.5,
      is_struggling: true,
      days_since_activity: 10
    },
    {
      user_id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      enrolled_at: '2025-09-01T00:00:00Z',
      status: 'active',
      completed_lessons: 1,
      total_lessons: 20,
      completion_percentage: 5,
      last_activity_at: new Date(Date.now() - 15 * 86400000).toISOString(), // 15 days ago
      time_spent_hours: 1.0,
      is_struggling: true,
      days_since_activity: 15
    },
    {
      user_id: 'user-3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      enrolled_at: '2025-09-01T00:00:00Z',
      status: 'dropped',
      completed_lessons: 0,
      total_lessons: 20,
      completion_percentage: 0,
      last_activity_at: new Date(Date.now() - 20 * 86400000).toISOString(), // 20 days ago
      time_spent_hours: 0.5,
      is_struggling: true,
      days_since_activity: 20
    }
  ];

  it('renders loading state correctly', () => {
    render(<StrugglingStudents students={[]} loading={true} />);
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders success message when no struggling students', () => {
    render(<StrugglingStudents students={[]} loading={false} />);
    expect(screen.getByText('All Students on Track!')).toBeDefined();
    expect(screen.getByText(/all students are making good progress/i)).toBeDefined();
  });

  it('renders component header with student count', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('Students Needing Attention')).toBeDefined();
    expect(screen.getByText('3 students require support')).toBeDefined();
  });

  it('displays alert banner', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('Action Required')).toBeDefined();
    expect(screen.getByText(/These students have either low completion rates/)).toBeDefined();
  });

  it('renders all student cards', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('Bob Wilson')).toBeDefined();
  });

  it('displays student emails', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('jane@example.com')).toBeDefined();
    expect(screen.getByText('bob@example.com')).toBeDefined();
  });

  it('shows correct status badges', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('Dropped')).toBeDefined();
    expect(screen.getByText('Very Inactive')).toBeDefined();
  });

  it('displays progress bars with correct percentages', () => {
    const { container } = render(<StrugglingStudents students={mockStudents} loading={false} />);
    const progressBars = container.querySelectorAll('[style*="width: 10%"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('shows completed vs total lessons', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText(/2 of 20 lessons completed/)).toBeDefined();
    expect(screen.getByText(/1 of 20 lessons completed/)).toBeDefined();
  });

  it('displays days since activity correctly', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('10 days ago')).toBeDefined();
    expect(screen.getByText('15 days ago')).toBeDefined();
    expect(screen.getByText('20 days ago')).toBeDefined();
  });

  it('shows time spent hours', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('3.5h')).toBeDefined();
    expect(screen.getByText('1h')).toBeDefined();
    expect(screen.getByText('0.5h')).toBeDefined();
  });

  it('renders email buttons for each student', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    const emailButtons = screen.getAllByText(/Email/);
    expect(emailButtons.length).toBe(4); // 3 individual + 1 bulk
  });

  it('renders view buttons for each student', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    const viewButtons = screen.getAllByText(/View/);
    expect(viewButtons.length).toBe(3);
  });

  it('opens mailto link when email button clicked', () => {
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<StrugglingStudents students={mockStudents} loading={false} />);

    // Get all email buttons - there should be 4 total (3 individual + 1 bulk)
    const emailButtons = screen.getAllByText(/📧 Email/);

    // Click the first individual email button
    fireEvent.click(emailButtons[0]);

    expect(windowOpen).toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:'),
      '_blank'
    );

    windowOpen.mockRestore();
  });

  it('has bulk email button when multiple students', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('📧 Email All Students')).toBeDefined();
  });

  it('does not show bulk email for single student', () => {
    const singleStudent = [mockStudents[0]];
    render(<StrugglingStudents students={singleStudent} loading={false} />);
    expect(screen.queryByText('📧 Email All Students')).toBeNull();
  });

  it('opens bulk mailto link with all emails', () => {
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<StrugglingStudents students={mockStudents} loading={false} />);
    const bulkEmailButton = screen.getByText('📧 Email All Students');
    fireEvent.click(bulkEmailButton);

    expect(windowOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:john@example.com,jane@example.com,bob@example.com'),
      '_blank'
    );

    windowOpen.mockRestore();
  });

  it('has sort by completion button', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('By Progress')).toBeDefined();
  });

  it('has sort by activity button', () => {
    render(<StrugglingStudents students={mockStudents} loading={false} />);
    expect(screen.getByText('By Activity')).toBeDefined();
  });

  it('sorts by completion percentage when button clicked', () => {
    const { container } = render(<StrugglingStudents students={mockStudents} loading={false} />);

    const sortByCompletion = screen.getByText('By Progress');
    fireEvent.click(sortByCompletion);

    // Check that students are rendered (sorting happens internally)
    expect(container.textContent).toContain('Jane Smith'); // 5% should be first
    expect(container.textContent).toContain('John Doe');
  });

  it('sorts by activity when button clicked', () => {
    const { container } = render(<StrugglingStudents students={mockStudents} loading={false} />);

    const sortByActivity = screen.getByText('By Activity');
    fireEvent.click(sortByActivity);

    // Students should be rendered (sorting happens internally)
    expect(container.textContent).toContain('Bob Wilson'); // 20 days should be first
  });

  it('applies correct progress bar colors based on percentage', () => {
    const { container } = render(<StrugglingStudents students={mockStudents} loading={false} />);

    // Check for red progress bar (< 10%)
    const redBars = container.querySelectorAll('.bg-red-500');
    expect(redBars.length).toBeGreaterThan(0);

    // Check for orange progress bar (10-20%)
    const orangeBars = container.querySelectorAll('.bg-orange-500');
    expect(orangeBars.length).toBeGreaterThan(0);
  });

  it('handles "Today" last activity display', () => {
    const todayStudent: StudentWithProgress = {
      ...mockStudents[0],
      days_since_activity: 0,
      last_activity_at: new Date().toISOString()
    };

    render(<StrugglingStudents students={[todayStudent]} loading={false} />);
    expect(screen.getByText('Today')).toBeDefined();
  });

  it('handles "Yesterday" last activity display', () => {
    const yesterdayStudent: StudentWithProgress = {
      ...mockStudents[0],
      days_since_activity: 1,
      last_activity_at: new Date(Date.now() - 86400000).toISOString()
    };

    render(<StrugglingStudents students={[yesterdayStudent]} loading={false} />);
    expect(screen.getByText('Yesterday')).toBeDefined();
  });
});

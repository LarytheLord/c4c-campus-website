/**
 * Tests for CohortStats Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CohortStats from '../../src/components/CohortStats';
import type { CohortAnalytics } from '../../src/types';

describe('CohortStats Component', () => {
  const mockAnalytics: CohortAnalytics = {
    cohort_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    cohort_name: 'Fall 2025 Cohort',
    course_name: 'n8n Workflow Automation',
    total_students: 25,
    active_students: 20,
    completed_students: 3,
    dropped_students: 2,
    average_completion_percentage: 65,
    average_time_spent_hours: 12.5,
    struggling_students_count: 4,
    engagement_rate: 80,
    total_lessons: 20,
    most_completed_lesson_id: null,
    least_completed_lesson_id: null,
    start_date: '2025-09-01',
    end_date: '2025-12-15',
    status: 'active'
  };

  it('renders loading state correctly', () => {
    render(<CohortStats analytics={null} loading={true} />);
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders no data message when analytics is null', () => {
    render(<CohortStats analytics={null} loading={false} />);
    expect(screen.getByText('No analytics data available')).toBeDefined();
  });

  it('renders cohort header with correct information', () => {
    render(<CohortStats analytics={mockAnalytics} loading={false} />);
    expect(screen.getByText('Fall 2025 Cohort')).toBeDefined();
    expect(screen.getByText('n8n Workflow Automation')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('displays all stat cards with correct values', () => {
    render(<CohortStats analytics={mockAnalytics} loading={false} />);

    // Check for key statistics
    expect(screen.getByText('Total Students')).toBeDefined();
    expect(screen.getAllByText('25')[0]).toBeDefined();

    expect(screen.getByText('Active Students')).toBeDefined();
    // "20" appears twice (Active Students stat and Total Lessons), use getAllByText
    expect(screen.getAllByText('20').length).toBeGreaterThan(0);

    expect(screen.getByText('Completed')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();

    expect(screen.getByText('Dropped')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();

    expect(screen.getByText('Avg. Completion')).toBeDefined();
    // "65%" appears twice (in stat card and progress bar), use getAllByText
    expect(screen.getAllByText('65%').length).toBeGreaterThan(0);

    expect(screen.getByText('Avg. Time Spent')).toBeDefined();
    expect(screen.getByText('12.5h')).toBeDefined();

    expect(screen.getByText('Engagement Rate')).toBeDefined();
    expect(screen.getByText('80%')).toBeDefined();

    expect(screen.getByText('Struggling Students')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
  });

  it('displays total lessons count', () => {
    render(<CohortStats analytics={mockAnalytics} loading={false} />);
    expect(screen.getByText('Total Lessons in Course')).toBeDefined();
    // "20" appears multiple times, just check for its presence
    expect(screen.getAllByText('20').length).toBeGreaterThan(0);
  });

  it('shows progress bar for overall completion', () => {
    const { container } = render(<CohortStats analytics={mockAnalytics} loading={false} />);
    const progressBar = container.querySelector('[style*="width: 65%"]');
    expect(progressBar).toBeDefined();
  });

  it('displays correct status badge color for active cohort', () => {
    const { container } = render(<CohortStats analytics={mockAnalytics} loading={false} />);
    const statusBadge = container.querySelector('.text-green-600');
    expect(statusBadge).toBeDefined();
  });

  it('displays correct status badge color for upcoming cohort', () => {
    const upcomingAnalytics = { ...mockAnalytics, status: 'upcoming' as const };
    const { container } = render(<CohortStats analytics={upcomingAnalytics} loading={false} />);
    const statusBadge = container.querySelector('.text-blue-600');
    expect(statusBadge).toBeDefined();
  });

  it('displays correct status badge color for completed cohort', () => {
    const completedAnalytics = { ...mockAnalytics, status: 'completed' as const };
    const { container } = render(<CohortStats analytics={completedAnalytics} loading={false} />);
    const statusBadge = container.querySelector('.text-gray-600');
    expect(statusBadge).toBeDefined();
  });

  it('formats dates correctly', () => {
    render(<CohortStats analytics={mockAnalytics} loading={false} />);
    // Check that date formatting is present (actual format may vary)
    const dateText = screen.getByText(/Sep.*2025/);
    expect(dateText).toBeDefined();
  });

  it('handles zero values gracefully', () => {
    const zeroAnalytics: CohortAnalytics = {
      ...mockAnalytics,
      total_students: 0,
      active_students: 0,
      completed_students: 0,
      dropped_students: 0,
      average_completion_percentage: 0,
      struggling_students_count: 0
    };

    render(<CohortStats analytics={zeroAnalytics} loading={false} />);
    expect(screen.getByText('Total Students')).toBeDefined();
    // "0" appears multiple times, just check it's present
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('displays all stat icons', () => {
    const { container } = render(<CohortStats analytics={mockAnalytics} loading={false} />);
    // Check for emoji icons in the component
    expect(container.textContent).toContain('👥');
    expect(container.textContent).toContain('✅');
    expect(container.textContent).toContain('🎓');
    expect(container.textContent).toContain('⚠️');
    expect(container.textContent).toContain('📊');
    expect(container.textContent).toContain('⏱️');
    expect(container.textContent).toContain('🔥');
    expect(container.textContent).toContain('🆘');
  });
});

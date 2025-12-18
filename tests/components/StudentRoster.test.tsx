/**
 * ⚠️ SKIPPED: StudentRoster Component Not Implemented ⚠️
 *
 * WHY SKIPPED:
 * The StudentRoster component does not exist at src/components/StudentRoster.tsx
 * or any other location in the codebase.
 *
 * WHAT'S MISSING:
 * - Component for displaying student roster in cohorts
 * - Student sorting functionality (by name, progress, last activity, status)
 * - Student filtering (by status: active, completed, dropped, paused)
 * - Search functionality (search by name or email)
 * - Pagination for large cohorts
 * - Individual student progress display
 *
 * IS THIS PLANNED?
 * This is a PLANNED feature. The database schema supports it (cohort_enrollments table),
 * and the tests define the expected behavior.
 *
 * CURRENT WORKAROUND:
 * Teachers can view student enrollments through the database directly or via
 * basic admin tools, but there is NO polished UI component for this.
 *
 * TO IMPLEMENT:
 * 1. Create src/components/StudentRoster.tsx component
 * 2. Implement sorting, filtering, and search logic
 * 3. Add pagination for large cohorts (>50 students)
 * 4. Style the component to match existing design system
 * 5. Remove describe.skip and run these tests
 *
 * Related Database Tables:
 * - cohort_enrollments (student-cohort relationships)
 * - profiles (student names and emails)
 * - lesson_progress (completed lessons count)
 * - lesson_discussions (discussion posts count)
 * - course_forums (forum posts count)
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
// Component does not exist yet - tests skipped
// import StudentRoster, { StudentRosterData } from '@/components/StudentRoster';

// Temporary type definition until component is implemented
interface StudentRosterData {
  cohort_id: number;
  course_id: number;
  user_id: string;
  name: string;
  email: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  last_activity_at: string;
  completed_lessons: number;
  discussion_posts: number;
  forum_posts: number;
}

// Stub component to prevent errors when tests are skipped
const StudentRoster = (_props: any) => null;

// Mock data
const mockStudents: StudentRosterData[] = [
  {
    cohort_id: 1,
    course_id: 1,
    user_id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    enrolled_at: '2025-01-01T00:00:00Z',
    status: 'active',
    last_activity_at: '2025-10-28T10:00:00Z',
    completed_lessons: 80,
    discussion_posts: 15,
    forum_posts: 5,
  },
  {
    cohort_id: 1,
    course_id: 1,
    user_id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    enrolled_at: '2025-01-02T00:00:00Z',
    status: 'active',
    last_activity_at: '2025-10-27T14:30:00Z',
    completed_lessons: 50,
    discussion_posts: 8,
    forum_posts: 2,
  },
  {
    cohort_id: 1,
    course_id: 1,
    user_id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    enrolled_at: '2025-01-03T00:00:00Z',
    status: 'completed',
    last_activity_at: '2025-10-20T09:15:00Z',
    completed_lessons: 100,
    discussion_posts: 25,
    forum_posts: 10,
  },
  {
    cohort_id: 1,
    course_id: 1,
    user_id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    enrolled_at: '2025-01-04T00:00:00Z',
    status: 'dropped',
    last_activity_at: '2025-09-15T16:45:00Z',
    completed_lessons: 20,
    discussion_posts: 3,
    forum_posts: 1,
  },
  {
    cohort_id: 1,
    course_id: 1,
    user_id: '5',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    enrolled_at: '2025-01-05T00:00:00Z',
    status: 'paused',
    last_activity_at: '2025-10-15T08:20:00Z',
    completed_lessons: 35,
    discussion_posts: 5,
    forum_posts: 2,
  },
];

describe.skip('StudentRoster Component', () => {
  // ==================== RENDERING ====================

  test('should render student roster table', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert - Check headers (use aria-label for sorting buttons)
    expect(screen.getByLabelText(/sort by name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by progress/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by last activity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by status/i)).toBeInTheDocument();
  });

  test('should display all students', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert - All students visible (getAllByText since names appear in both desktop and mobile)
    expect(screen.getAllByText('Alice Johnson')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Bob Smith')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Charlie Brown')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Diana Prince')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ethan Hunt')[0]).toBeInTheDocument();
  });

  test('should display student emails', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert (emails appear in both desktop and mobile)
    expect(screen.getAllByText('alice@example.com')[0]).toBeInTheDocument();
    expect(screen.getAllByText('bob@example.com')[0]).toBeInTheDocument();
  });

  test('should display progress percentages', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert - Check percentages (appear in both desktop and mobile)
    expect(screen.getAllByText('80%')[0]).toBeInTheDocument(); // Alice: 80/100
    expect(screen.getAllByText('50%')[0]).toBeInTheDocument(); // Bob: 50/100
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument(); // Charlie: 100/100
  });

  test('should display status badges', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert - All status badges visible (appear in both desktop and mobile)
    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Completed')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Dropped')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Paused')[0]).toBeInTheDocument();
  });

  test('should show loading state', () => {
    // Arrange & Act
    const { container } = render(<StudentRoster students={[]} isLoading={true} />);

    // Assert - Look for spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('should show empty state when no students', () => {
    // Arrange & Act
    render(<StudentRoster students={[]} totalLessons={100} />);

    // Assert (appears in both desktop and mobile)
    expect(screen.getAllByText(/no students enrolled yet/i)[0]).toBeInTheDocument();
  });

  // ==================== SEARCH FUNCTIONALITY ====================

  test('should filter students by name search', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Search for "Alice"
    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'Alice');

    // Assert
    expect(screen.getAllByText('Alice Johnson')[0]).toBeInTheDocument();
    expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
  });

  test('should filter students by email search', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Search by email
    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'bob@example');

    // Assert
    expect(screen.getAllByText('Bob Smith')[0]).toBeInTheDocument();
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
  });

  test('should be case insensitive', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Search with different case
    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'CHARLIE');

    // Assert
    expect(screen.getAllByText('Charlie Brown')[0]).toBeInTheDocument();
  });

  test('should show no results message for non-matching search', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Search for non-existent name
    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'NonExistent');

    // Assert (appears in both desktop and mobile)
    expect(screen.getAllByText(/no students match your filters/i)[0]).toBeInTheDocument();
  });

  // ==================== STATUS FILTERING ====================

  test('should filter by active status', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Filter by active
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'active');

    // Assert - Only active students shown
    expect(screen.getAllByText('Alice Johnson')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Bob Smith')[0]).toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    expect(screen.queryByText('Diana Prince')).not.toBeInTheDocument();
  });

  test('should filter by completed status', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'completed');

    // Assert
    expect(screen.getAllByText('Charlie Brown')[0]).toBeInTheDocument();
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
  });

  test('should filter by dropped status', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'dropped');

    // Assert
    expect(screen.getAllByText('Diana Prince')[0]).toBeInTheDocument();
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
  });

  test('should show all students when "all" is selected', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - First filter, then reset
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'active');
    await user.selectOptions(statusFilter, 'all');

    // Assert - All students shown again
    expect(screen.getAllByText('Alice Johnson')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Charlie Brown')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Diana Prince')[0]).toBeInTheDocument();
  });

  // ==================== SORTING ====================

  test('should sort by name ascending by default', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert - Check order (Alice, Bob, Charlie, Diana, Ethan)
    const rows = screen.getAllByRole('button');
    const nameButtons = rows.filter(r => r.textContent?.includes('Johnson') || r.textContent?.includes('Smith'));
    expect(nameButtons[0]).toHaveTextContent('Alice Johnson');
  });

  test('should sort by name descending on second click', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Click name header twice
    const nameHeader = screen.getByLabelText(/sort by name/i);
    await user.click(nameHeader);

    // Assert - Ethan should be first (descending)
    const rows = screen.getAllByRole('button');
    const studentRows = rows.filter(r => r.textContent?.includes('@example.com'));
    expect(studentRows[0]).toHaveTextContent('Ethan Hunt');
  });

  test('should sort by progress percentage', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Click progress header
    const progressHeader = screen.getByLabelText(/sort by progress/i);
    await user.click(progressHeader);

    // Assert - Diana (20%) should be first
    const rows = screen.getAllByRole('button');
    const studentRows = rows.filter(r => r.textContent?.includes('@example.com'));
    expect(studentRows[0]).toHaveTextContent('Diana Prince');
  });

  test('should sort by last activity', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Click last activity header
    const activityHeader = screen.getByLabelText(/sort by last activity/i);
    await user.click(activityHeader);

    // Assert - Diana (oldest) should be first
    const rows = screen.getAllByRole('button');
    const studentRows = rows.filter(r => r.textContent?.includes('@example.com'));
    expect(studentRows[0]).toHaveTextContent('Diana Prince');
  });

  test('should sort by status', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Click status header
    const statusHeader = screen.getByLabelText(/sort by status/i);
    await user.click(statusHeader);

    // Assert - Active status comes first alphabetically
    const rows = screen.getAllByRole('button');
    const studentRows = rows.filter(r => r.textContent?.includes('@example.com'));
    expect(studentRows[0]).toHaveTextContent('Alice Johnson'); // Active
  });

  // ==================== PAGINATION ====================

  test('should show pagination when more than 50 students', () => {
    // Arrange - Create 60 students
    const manyStudents: StudentRosterData[] = Array.from({ length: 60 }, (_, i) => ({
      cohort_id: 1,
      course_id: 1,
      user_id: `${i}`,
      name: `Student ${i}`,
      email: `student${i}@example.com`,
      enrolled_at: '2025-01-01T00:00:00Z',
      status: 'active' as const,
      last_activity_at: '2025-10-28T10:00:00Z',
      completed_lessons: 50,
      discussion_posts: 5,
      forum_posts: 2,
    }));

    // Act
    render(<StudentRoster students={manyStudents} totalLessons={100} />);

    // Assert - Pagination controls visible
    expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
  });

  test('should navigate to next page', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const manyStudents: StudentRosterData[] = Array.from({ length: 60 }, (_, i) => ({
      cohort_id: 1,
      course_id: 1,
      user_id: `${i}`,
      name: `Student ${i}`,
      email: `student${i}@example.com`,
      enrolled_at: '2025-01-01T00:00:00Z',
      status: 'active' as const,
      last_activity_at: '2025-10-28T10:00:00Z',
      completed_lessons: 50,
      discussion_posts: 5,
      forum_posts: 2,
    }));
    render(<StudentRoster students={manyStudents} totalLessons={100} />);

    // Act
    const nextButton = screen.getByLabelText(/next page/i);
    await user.click(nextButton);

    // Assert
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
  });

  test('should disable previous button on first page', () => {
    // Arrange
    const manyStudents: StudentRosterData[] = Array.from({ length: 60 }, (_, i) => ({
      cohort_id: 1,
      course_id: 1,
      user_id: `${i}`,
      name: `Student ${i}`,
      email: `student${i}@example.com`,
      enrolled_at: '2025-01-01T00:00:00Z',
      status: 'active' as const,
      last_activity_at: '2025-10-28T10:00:00Z',
      completed_lessons: 50,
      discussion_posts: 5,
      forum_posts: 2,
    }));

    // Act
    render(<StudentRoster students={manyStudents} totalLessons={100} />);

    // Assert
    const previousButton = screen.getByLabelText(/previous page/i);
    expect(previousButton).toBeDisabled();
  });

  test('should reset to page 1 when filters change', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const manyStudents: StudentRosterData[] = Array.from({ length: 60 }, (_, i) => ({
      cohort_id: 1,
      course_id: 1,
      user_id: `${i}`,
      name: `Student ${i}`,
      email: `student${i}@example.com`,
      enrolled_at: '2025-01-01T00:00:00Z',
      status: 'active' as const,
      last_activity_at: '2025-10-28T10:00:00Z',
      completed_lessons: 50,
      discussion_posts: 5,
      forum_posts: 2,
    }));
    render(<StudentRoster students={manyStudents} totalLessons={100} />);

    // Act - Go to page 2
    const nextButton = screen.getByLabelText(/next page/i);
    await user.click(nextButton);
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();

    // Act - Change filter via status dropdown
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'completed');

    // Assert - No students match (all are active), so pagination should be hidden
    // Just verify the empty state
    expect(screen.getAllByText(/no students match your filters/i)[0]).toBeInTheDocument();
  });

  // ==================== ROW CLICK ====================

  test('should call onStudentClick when row is clicked', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockOnClick = vi.fn();
    render(<StudentRoster students={mockStudents} totalLessons={100} onStudentClick={mockOnClick} />);

    // Act - Click on Alice's row
    const rows = screen.getAllByRole('button');
    const aliceRow = rows.find(r => r.textContent?.includes('Alice Johnson'));
    if (aliceRow) {
      await user.click(aliceRow);
    }

    // Assert
    expect(mockOnClick).toHaveBeenCalledWith(mockStudents[0]);
  });

  test('should allow keyboard navigation on rows', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockOnClick = vi.fn();
    render(<StudentRoster students={mockStudents} totalLessons={100} onStudentClick={mockOnClick} />);

    // Act - Press Enter on row
    const rows = screen.getAllByRole('button');
    const aliceRow = rows.find(r => r.textContent?.includes('Alice Johnson'));
    if (aliceRow) {
      aliceRow.focus();
      await user.keyboard('{Enter}');
    }

    // Assert
    expect(mockOnClick).toHaveBeenCalled();
  });

  // ==================== MOBILE RESPONSIVE ====================

  test('should render mobile card view on small screens', () => {
    // Note: This test would require viewport manipulation
    // For now, we just verify the mobile elements exist in the DOM
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Both desktop and mobile views are in DOM, controlled by CSS
    expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0);
  });

  // ==================== EDGE CASES ====================

  test('should handle zero total lessons', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={0} />);

    // Assert - Should show 0% for all
    const percentages = screen.getAllByText('0%');
    expect(percentages.length).toBeGreaterThan(0);
  });

  test('should handle students with 0 completed lessons', () => {
    // Arrange
    const zeroProgressStudent: StudentRosterData[] = [{
      cohort_id: 1,
      course_id: 1,
      user_id: '1',
      name: 'New Student',
      email: 'new@example.com',
      enrolled_at: '2025-10-29T00:00:00Z',
      status: 'active',
      last_activity_at: '2025-10-29T00:00:00Z',
      completed_lessons: 0,
      discussion_posts: 0,
      forum_posts: 0,
    }];

    // Act
    render(<StudentRoster students={zeroProgressStudent} totalLessons={100} />);

    // Assert (appears in both desktop and mobile)
    expect(screen.getAllByText('0%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('0 of 100 lessons')[0]).toBeInTheDocument();
  });

  test('should show results count', () => {
    // Arrange & Act
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Assert
    expect(screen.getByText(/showing 5 of 5 students/i)).toBeInTheDocument();
  });

  test('should show filtered count', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<StudentRoster students={mockStudents} totalLessons={100} />);

    // Act - Apply filter
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(statusFilter, 'active');

    // Assert
    expect(screen.getByText(/filtered from 5 total/i)).toBeInTheDocument();
  });
});

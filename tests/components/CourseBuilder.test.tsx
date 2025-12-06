/**
 * CourseBuilder Component Tests
 * 
 * Tests teacher course creation/editing interface
 * Reference: TEST_PLAN.md Section 2.2
 * Note: Per anti-pattern #1, student features built FIRST (Phase 7.1-7.3), then teacher builder (Phase 7.4)
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import CourseBuilder from '@/components/course/CourseBuilder';
import { mockCourse } from '../fixtures/courses';

describe('CourseBuilder Component', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnPublish: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue({ success: true });
    mockOnPublish = vi.fn().mockResolvedValue({ success: true });
  });
  
  // ==================== FORM RENDERING ====================
  
  test('should render all required fields', () => {
    // Arrange & Act
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Assert
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/track/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration.*weeks/i)).toBeInTheDocument();
  });
  
  test('should pre-fill form when editing existing course', () => {
    // Arrange & Act
    render(
      <CourseBuilder
        course={mockCourse}
        onSave={mockOnSave}
        onPublish={mockOnPublish}
      />
    );
    
    // Assert - Fields populated with existing data
    expect(screen.getByDisplayValue(mockCourse.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCourse.description!)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // default_duration_weeks
  });
  
  // ==================== VALIDATION ====================
  
  test('should require course name', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Try to save without name
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Assert - Shows validation error
    await waitFor(() => {
      expect(screen.getByText(/course name is required/i)).toBeInTheDocument();
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  test('should require track selection', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Fill name but not track
    await user.type(screen.getByLabelText(/course name/i), 'Test Course');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/track is required/i)).toBeInTheDocument();
    });
  });
  
  test('should validate duration weeks is positive number', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);

    // Act - Enter negative weeks
    await user.type(screen.getByLabelText(/duration.*weeks/i), '-5');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/weeks must be positive/i)).toBeInTheDocument();
    });
  });
  
  test('should sanitize XSS in course name', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);

    // Act - Enter XSS attempt
    await user.type(screen.getByLabelText(/course name/i), '<script>alert("xss")</script>');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Assert - Script tags stripped
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.not.stringContaining('<script>')
        })
      );
    });
  });
  
  // ==================== COURSE CREATION ====================
  
  test('should create new course with valid data', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Fill all required fields
    await user.type(screen.getByLabelText(/course name/i), 'n8n Advanced Patterns');
    await user.type(screen.getByLabelText(/description/i), 'Learn advanced n8n workflow patterns');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'intermediate');
    await user.type(screen.getByLabelText(/duration.*weeks/i), '3');
    
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert - onSave called with correct data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'n8n Advanced Patterns',
        slug: 'n8n-advanced-patterns', // Auto-generated from title
        description: 'Learn advanced n8n workflow patterns',
        track: 'animal-advocacy',
        difficulty: 'intermediate',
        default_duration_weeks: 3,
        is_published: false, // Defaults to draft
      });
    });
  });
  
  test('should update existing course', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(
      <CourseBuilder
        course={mockCourse}
        onSave={mockOnSave}
        onPublish={mockOnPublish}
      />
    );

    // Act - Modify name
    const nameInput = screen.getByLabelText(/course name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Course Name');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Assert - Includes course ID for update, keeps original slug (doesn't auto-regenerate)
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockCourse.id,
          title: 'Updated Course Name',
          slug: mockCourse.slug, // Keeps original slug to prevent URL changes
        })
      );
    });
  });
  
  // ==================== PUBLISH TOGGLE ====================
  
  test('should show publish button for draft courses', () => {
    // Arrange - Draft course
    const draft = { ...mockCourse, is_published: false };

    // Act
    render(
      <CourseBuilder
        course={draft}
        onSave={mockOnSave}
        onPublish={mockOnPublish}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
  });

  test('should show unpublish button for published courses', () => {
    // Arrange - Published course
    const published = { ...mockCourse, is_published: true };

    // Act
    render(
      <CourseBuilder
        course={published}
        onSave={mockOnSave}
        onPublish={mockOnPublish}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /unpublish/i })).toBeInTheDocument();
  });

  test('should toggle published status', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const draft = { ...mockCourse, is_published: false };
    
    render(
      <CourseBuilder
        course={draft}
        onSave={mockOnSave}
        onPublish={mockOnPublish}
      />
    );
    
    // Act - Click publish
    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);
    
    // Assert - Calls onPublish with true
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalledWith(mockCourse.id, true);
    });
  });
  
  // ==================== SLUG GENERATION ====================
  
  test('should auto-generate slug from course name', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Type course name
    await user.type(screen.getByLabelText(/course name/i), 'n8n & AI Integration');
    
    // Assert - Slug preview shows "n8n-ai-integration"
    expect(screen.getByText(/slug.*n8n-ai-integration/i)).toBeInTheDocument();
  });
  
  test('should allow manual slug override', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);

    // Act - Enter custom slug
    await user.type(screen.getByLabelText(/course name/i), 'Test Course');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.clear(screen.getByLabelText(/slug/i));
    await user.type(screen.getByLabelText(/slug/i), 'custom-slug');

    await user.click(screen.getByRole('button', { name: /save/i }));

    // Assert - Uses custom slug
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'custom-slug' })
      );
    });
  });
  
  // ==================== ERROR HANDLING ====================
  
  test('should display error message on save failure', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    mockOnSave.mockRejectedValueOnce(new Error('Database connection failed'));
    
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Fill and save
    await user.type(screen.getByLabelText(/course name/i), 'Test');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert - Error displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to save course/i)).toBeInTheDocument();
    });
  });
  
  test('should disable save button while saving', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    let resolveSave: (value: any) => void;
    mockOnSave.mockReturnValue(new Promise(resolve => { resolveSave = resolve; }));
    
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Start save
    await user.type(screen.getByLabelText(/course name/i), 'Test');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Assert - Button disabled during save
    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving.../i)).toBeInTheDocument();
  });
  
  // ==================== EDGE CASES ====================
  
  test('should handle empty description (optional field)', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Save without description
    await user.type(screen.getByLabelText(/course name/i), 'Minimal Course');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'beginner');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert - Saves successfully with null description
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null // or empty string
        })
      );
    });
  });
  
  test('should handle very long course name', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const longName = 'A'.repeat(300); // 300 characters
    
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act
    await user.type(screen.getByLabelText(/course name/i), longName);
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert - Truncated or shows error
    await waitFor(() => {
      const errorOrTruncation = 
        screen.queryByText(/name too long/i) ||
        mockOnSave.mock.calls[0]?.[0].name.length <= 255;
      expect(errorOrTruncation).toBeTruthy();
    });
  });
  
  test('should prevent saving without required fields', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Leave all fields empty, try to save
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert - Multiple validation errors shown
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/track is required/i)).toBeInTheDocument();
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  // ==================== TRACK & DIFFICULTY OPTIONS ====================
  
  test('should display correct track options', () => {
    // Arrange & Act
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Assert - From BOOTCAMP_ARCHITECTURE.md types (line 95)
    const trackSelect = screen.getByLabelText(/track/i);
    expect(trackSelect).toContainHTML('animal-advocacy');
    expect(trackSelect).toContainHTML('climate');
    expect(trackSelect).toContainHTML('human-rights');
  });
  
  test('should display correct difficulty options', () => {
    // Arrange & Act
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Assert - From BOOTCAMP_ARCHITECTURE.md types (line 96)
    const difficultySelect = screen.getByLabelText(/difficulty/i);
    expect(difficultySelect).toContainHTML('beginner');
    expect(difficultySelect).toContainHTML('intermediate');
    expect(difficultySelect).toContainHTML('advanced');
  });
  
  // ==================== SAVE/CANCEL ====================
  
  test('should call onSave with form data', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act - Fill form completely
    await user.type(screen.getByLabelText(/course name/i), 'Complete Course');
    await user.type(screen.getByLabelText(/description/i), 'Full description here');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'beginner');
    await user.type(screen.getByLabelText(/duration.*weeks/i), '2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Complete Course',
        slug: 'complete-course',
        description: 'Full description here',
        track: 'animal-advocacy',
        difficulty: 'beginner',
        default_duration_weeks: 2,
        is_published: false,
      });
    });
  });
  
  test('should show success message after save', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act
    await user.type(screen.getByLabelText(/course name/i), 'Test');
    await user.selectOptions(screen.getByLabelText(/track/i), 'animal-advocacy');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/course saved successfully/i)).toBeInTheDocument();
    });
  });
  
  // ==================== ACCESSIBILITY ====================
  
  test('should have accessible form labels', () => {
    // Arrange & Act
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Assert - All inputs have labels
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/track/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration.*weeks/i)).toBeInTheDocument();
  });
  
  test('should announce validation errors to screen readers', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    render(<CourseBuilder onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Act
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert - Error region has aria-live
    await waitFor(() => {
      const errorRegion = screen.getByRole('alert');
      expect(errorRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
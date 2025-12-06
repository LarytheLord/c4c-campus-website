/**
 * LessonNav Component Tests
 * 
 * Tests lesson navigation controls (prev/next buttons)
 * Reference: TEST_PLAN.md Section 2.2
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import LessonNav from '@/components/course/LessonNav';
import { mockModule, mockLessons } from '../fixtures/courses';

describe('LessonNav Component', () => {
  const firstLesson = mockLessons[0]; // id: 1, order: 1
  const middleLesson = mockLessons[1]; // id: 2, order: 2
  const lastLesson = { ...mockLessons[2], order_index: 3 }; // id: 3, order: 3 (fixed from 1)
  const orderedLessons = [firstLesson, middleLesson, lastLesson];

  // ==================== BUTTON RENDERING ====================
  
  test('should render prev and next buttons', () => {
    // Arrange & Act
    render(
      <LessonNav
        currentLesson={middleLesson}
        allLessons={orderedLessons}
        onNavigate={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });
  
  // ==================== NAVIGATION BEHAVIOR ====================
  
  test('should navigate to next lesson on next click', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockNavigate = vi.fn();
    
    render(
      <LessonNav
        currentLesson={firstLesson}
        allLessons={orderedLessons}
        onNavigate={mockNavigate}
      />
    );

    // Act
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Assert - Navigates to lesson 2 (order_index 2)
    expect(mockNavigate).toHaveBeenCalledWith(orderedLessons[1]);
  });
  
  test('should navigate to previous lesson on prev click', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockNavigate = vi.fn();
    
    render(
      <LessonNav
        currentLesson={middleLesson}
        allLessons={orderedLessons}
        onNavigate={mockNavigate}
      />
    );

    // Act
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    // Assert - Navigates to lesson 1
    expect(mockNavigate).toHaveBeenCalledWith(orderedLessons[0]);
  });
  
  // ==================== DISABLED STATES ====================
  
  test('should disable prev button on first lesson', () => {
    // Arrange & Act
    render(
      <LessonNav
        currentLesson={firstLesson}
        allLessons={orderedLessons}
        onNavigate={vi.fn()}
      />
    );

    // Assert
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });
  
  test('should disable next button on last lesson', () => {
    // Arrange & Act
    render(
      <LessonNav
        currentLesson={lastLesson}
        allLessons={orderedLessons}
        onNavigate={vi.fn()}
      />
    );

    // Assert
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });
  
  test('should not call onNavigate when prev disabled', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockNavigate = vi.fn();
    
    render(
      <LessonNav
        currentLesson={firstLesson}
        allLessons={orderedLessons}
        onNavigate={mockNavigate}
      />
    );

    // Act - Try to click disabled prev button
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    // Assert - Navigation not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('should not call onNavigate when next disabled', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockNavigate = vi.fn();
    
    render(
      <LessonNav
        currentLesson={lastLesson}
        allLessons={orderedLessons}
        onNavigate={mockNavigate}
      />
    );

    // Act - Try to click disabled next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Assert
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  // ==================== LESSON ORDER ====================
  
  test('should navigate in order by order_index', async () => {
    // Arrange - Lessons intentionally out of ID order
    const unorderedLessons = [
      { ...mockLessons[2], id: 5, order_index: 1 }, // First
      { ...mockLessons[0], id: 3, order_index: 2 }, // Second
      { ...mockLessons[1], id: 1, order_index: 3 }, // Third
    ];
    
    const user = userEvent.setup({ delay: null });
    const mockNavigate = vi.fn();
    
    render(
      <LessonNav
        currentLesson={unorderedLessons[0]}
        allLessons={unorderedLessons}
        onNavigate={mockNavigate}
      />
    );
    
    // Act
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    // Assert - Goes to lesson with order_index 2, not ID order
    expect(mockNavigate).toHaveBeenCalledWith(unorderedLessons[1]);
  });
  
  // ==================== EDGE CASES ====================
  
  test('should handle single lesson (both buttons disabled)', () => {
    // Arrange & Act - Only one lesson
    render(
      <LessonNav
        currentLesson={firstLesson}
        allLessons={[firstLesson]}
        onNavigate={vi.fn()}
      />
    );
    
    // Assert
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
  
  test('should handle empty lessons array', () => {
    // Arrange & Act
    const { container } = render(
      <LessonNav
        currentLesson={firstLesson}
        allLessons={[]}
        onNavigate={vi.fn()}
      />
    );
    
    // Assert - Renders nothing or both disabled
    const buttons = screen.queryAllByRole('button');
    buttons.forEach(button => expect(button).toBeDisabled());
  });
  
  // ==================== ACCESSIBILITY ====================
  
  test('should have accessible labels', () => {
    // Arrange & Act
    render(
      <LessonNav
        currentLesson={middleLesson}
        allLessons={orderedLessons}
        onNavigate={vi.fn()}
      />
    );

    // Assert - Buttons have clear labels
    expect(screen.getByRole('button', { name: /previous lesson/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next lesson/i })).toBeInTheDocument();
  });
  
  test('should support keyboard navigation', async () => {
    // Arrange
    const user = userEvent.setup({ delay: null });
    const mockNavigate = vi.fn();
    
    render(
      <LessonNav
        currentLesson={middleLesson}
        allLessons={orderedLessons}
        onNavigate={mockNavigate}
      />
    );

    // Act - Tab to next button, press Enter
    await user.tab();
    await user.tab(); // Assuming prev is first, next is second
    await user.keyboard('{Enter}');

    // Assert - Navigation triggered
    expect(mockNavigate).toHaveBeenCalled();
  });
});
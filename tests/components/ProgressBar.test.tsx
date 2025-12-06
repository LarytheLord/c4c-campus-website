/**
 * ProgressBar Component Tests
 * 
 * Tests progress display accuracy
 * Reference: TEST_PLAN.md Section 2.2
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/course/ProgressBar';

describe('ProgressBar Component', () => {
  // ==================== PERCENTAGE DISPLAY ====================
  
  test('should display 0% when no lessons completed', () => {
    // Arrange & Act
    render(<ProgressBar completed={0} total={10} />);
    
    // Assert
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
  
  test('should display 50% when half completed', () => {
    // Arrange & Act
    render(<ProgressBar completed={5} total={10} />);
    
    // Assert
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
  
  test('should display 100% when all completed', () => {
    // Arrange & Act
    render(<ProgressBar completed={10} total={10} />);
    
    // Assert
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
  
  test('should round to nearest integer', () => {
    // Arrange & Act - 1/3 = 33.333...%
    render(<ProgressBar completed={1} total={3} />);
    
    // Assert - Displays "33%" not "33.333%"
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
  
  // ==================== COMPLETED COUNT ====================
  
  test('should show completed count out of total', () => {
    // Arrange & Act
    render(<ProgressBar completed={7} total={15} />);

    // Assert
    expect(screen.getByTestId('count-display')).toHaveTextContent(/7.*15/);
  });
  
  test('should show "0 of 0" when no lessons exist', () => {
    // Arrange & Act
    render(<ProgressBar completed={0} total={0} />);

    // Assert
    expect(screen.getByTestId('count-display')).toHaveTextContent(/0.*0/);
  });
  
  // ==================== VISUAL FILL ====================
  
  test('should set progressbar aria value correctly', () => {
    // Arrange & Act
    render(<ProgressBar completed={3} total={10} />);
    
    // Assert
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '30');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });
  
  test('should apply correct width style', () => {
    // Arrange & Act
    render(<ProgressBar completed={6} total={12} />);
    
    // Assert - 50% width
    const fill = screen.getByRole('progressbar').querySelector('[role="presentation"]');
    expect(fill).toHaveStyle({ width: '50%' });
  });
  
  // ==================== EDGE CASES ====================
  
  test('should handle division by zero gracefully', () => {
    // Arrange & Act - Total is 0
    render(<ProgressBar completed={0} total={0} />);
    
    // Assert - Shows 0%, not NaN% or crash
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
  
  test('should handle completed > total', () => {
    // Arrange & Act - Invalid state: 15 completed but only 10 total
    render(<ProgressBar completed={15} total={10} />);
    
    // Assert - Clamps to 100%, not >100%
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
  
  test('should handle negative values', () => {
    // Arrange & Act
    render(<ProgressBar completed={-5} total={10} />);
    
    // Assert - Clamps to 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
  
  test('should handle non-integer values', () => {
    // Arrange & Act - Fractional lessons (shouldn't happen but defensive)
    render(<ProgressBar completed={2.7} total={8.3} />);
    
    // Assert - Calculates correctly, rounds percentage
    expect(screen.getByText('33%')).toBeInTheDocument(); // 2.7/8.3 ≈ 32.5% → 33%
  });
  
  // ==================== ACCESSIBILITY ====================
  
  test('should have accessible label', () => {
    // Arrange & Act
    render(<ProgressBar completed={4} total={12} />);
    
    // Assert
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAccessibleName(/progress|course progress/i);
  });
  
  test('should include screen reader text', () => {
    // Arrange & Act
    render(<ProgressBar completed={8} total={20} />);

    // Assert - Screen reader announces "40% complete, 8 of 20 lessons"
    const srText = screen.getByTestId('sr-text');
    expect(srText).toHaveClass('sr-only');
    expect(srText).toHaveTextContent(/40.*complete.*8.*20/i);
  });
});
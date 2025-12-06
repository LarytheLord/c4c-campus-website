import { describe, test, expect } from 'vitest';
import { slugify, formatDuration, calculateProgress } from '@/lib/utils';

/**
 * Utility Functions Tests
 * 
 * Testing BEHAVIOR not implementation.
 * Functions don't exist yet - tests will FAIL (RED state) until Phase 7.
 */

describe('slugify', () => {
  // Happy path - convert course name to URL-safe slug
  test('should convert course name to URL-safe slug', () => {
    // Arrange
    const input = 'n8n Workflow Automation Basics';
    const expected = 'n8n-workflow-automation-basics';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should handle multiple spaces by converting to single dashes', () => {
    // Arrange
    const input = 'Advanced   AI    Development';
    const expected = 'advanced-ai-development';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should remove special characters except dashes', () => {
    // Arrange
    const input = 'How to Build APIs & Workflows!';
    const expected = 'how-to-build-apis-workflows';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should handle leading and trailing spaces', () => {
    // Arrange
    const input = '  Climate Data Analysis  ';
    const expected = 'climate-data-analysis';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  // Edge cases
  test('should handle empty string by returning empty string', () => {
    // Arrange
    const input = '';
    const expected = '';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should handle string with only spaces', () => {
    // Arrange
    const input = '    ';
    const expected = '';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should handle unicode characters correctly', () => {
    // Arrange
    const input = 'কম্পাসন Engineering';
    const expected = 'কমপসন-engineering';
    
    // Act
    const result = slugify(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  // Error cases
  test('should throw error when input is null', () => {
    // Arrange
    const input = null as any;
    
    // Act & Assert
    expect(() => slugify(input)).toThrow();
  });

  test('should throw error when input is undefined', () => {
    // Arrange
    const input = undefined as any;
    
    // Act & Assert
    expect(() => slugify(input)).toThrow();
  });
});

describe('formatDuration', () => {
  // Happy path - format seconds to human-readable duration
  test('should format 9000 seconds as "2h 30m"', () => {
    // Arrange
    const input = 9000; // 2.5 hours
    const expected = '2h 30m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should format 3600 seconds as "1h 0m"', () => {
    // Arrange
    const input = 3600; // Exact 1 hour
    const expected = '1h 0m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should format 420 seconds as "0h 7m"', () => {
    // Arrange
    const input = 420; // 7 minutes
    const expected = '0h 7m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should format 28800 seconds as "8h 0m"', () => {
    // Arrange
    const input = 28800; // 8 hours
    const expected = '8h 0m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  // Edge cases
  test('should format 0 seconds as "0h 0m"', () => {
    // Arrange
    const input = 0;
    const expected = '0h 0m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should format 59 seconds as "0h 0m" (rounds down)', () => {
    // Arrange
    const input = 59;
    const expected = '0h 0m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should format 60 seconds as "0h 1m"', () => {
    // Arrange
    const input = 60;
    const expected = '0h 1m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should format 3661 seconds as "1h 1m" (rounds minutes)', () => {
    // Arrange
    const input = 3661; // 1 hour, 1 minute, 1 second
    const expected = '1h 1m';
    
    // Act
    const result = formatDuration(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  // Error cases
  test('should throw error for negative seconds', () => {
    // Arrange
    const input = -100;
    
    // Act & Assert
    expect(() => formatDuration(input)).toThrow('Duration must be non-negative');
  });

  test('should throw error for non-integer seconds', () => {
    // Arrange
    const input = 120.5;
    
    // Act & Assert
    expect(() => formatDuration(input)).toThrow('Duration must be an integer');
  });

  test('should throw error when input is null', () => {
    // Arrange
    const input = null as any;
    
    // Act & Assert
    expect(() => formatDuration(input)).toThrow();
  });
});

describe('calculateProgress', () => {
  // Happy path - calculate percentage completion
  test('should return 50 when 5 of 10 lessons completed', () => {
    // Arrange
    const completed = 5;
    const total = 10;
    const expected = 50;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should return 100 when all lessons completed', () => {
    // Arrange
    const completed = 12;
    const total = 12;
    const expected = 100;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should return 0 when no lessons completed', () => {
    // Arrange
    const completed = 0;
    const total = 10;
    const expected = 0;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should return 33 when 1 of 3 lessons completed (rounds down)', () => {
    // Arrange
    const completed = 1;
    const total = 3;
    const expected = 33;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should return 67 when 2 of 3 lessons completed (rounds up)', () => {
    // Arrange
    const completed = 2;
    const total = 3;
    const expected = 67;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  // Edge cases
  test('should handle single lesson (1/1) as 100%', () => {
    // Arrange
    const completed = 1;
    const total = 1;
    const expected = 100;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  test('should return 0 when total is 0 (edge case: no lessons)', () => {
    // Arrange
    const completed = 0;
    const total = 0;
    const expected = 0;
    
    // Act
    const result = calculateProgress(completed, total);
    
    // Assert
    expect(result).toBe(expected);
  });

  // Error cases
  test('should throw error when completed > total', () => {
    // Arrange
    const completed = 12;
    const total = 10;
    
    // Act & Assert
    expect(() => calculateProgress(completed, total)).toThrow('Completed cannot exceed total');
  });

  test('should throw error when completed is negative', () => {
    // Arrange
    const completed = -5;
    const total = 10;
    
    // Act & Assert
    expect(() => calculateProgress(completed, total)).toThrow('Values must be non-negative');
  });

  test('should throw error when total is negative', () => {
    // Arrange
    const completed = 5;
    const total = -10;
    
    // Act & Assert
    expect(() => calculateProgress(completed, total)).toThrow('Values must be non-negative');
  });

  test('should throw error when inputs are not integers', () => {
    // Arrange
    const completed = 5.5;
    const total = 10.2;
    
    // Act & Assert
    expect(() => calculateProgress(completed, total)).toThrow('Values must be integers');
  });
});
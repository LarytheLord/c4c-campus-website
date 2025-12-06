/**
 * ProgressBar Component - TDD Implementation
 * Reference: TEST_PLAN.md Section 2.2
 * Displays course/lesson progress with percentage and count
 */

import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ completed, total, label = 'Course Progress' }: ProgressBarProps) {
  // Clamp completed to [0, total] to handle edge cases
  const clampedCompleted = Math.max(0, Math.min(completed, total));

  // Calculate percentage (0-100), handle division by zero
  const percentage = total > 0 ? Math.round((clampedCompleted / total) * 100) : 0;

  // Clamp percentage to 0-100 range
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="progress-bar-container">
      <div
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="progress-bar"
      >
        <div
          role="presentation"
          className="progress-fill"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      <div className="progress-text" aria-label={`${clampedPercentage}% complete, ${Math.round(clampedCompleted)} of ${total} lessons`}>
        <span>{clampedPercentage}%</span>
        <span data-testid="count-display"> {Math.round(clampedCompleted)} of {total}</span>
      </div>

      {/* Screen reader announcement - separate from visual display */}
      <div className="sr-only" role="status" aria-atomic="true" data-testid="sr-text">
        <span>{clampedPercentage}% complete, </span>
        <span>{Math.round(clampedCompleted)} of {total} lessons</span>
      </div>
    </div>
  );
}
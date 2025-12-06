/**
 * LessonNav Component - TDD Implementation
 * Reference: TEST_PLAN.md Section 2.2
 * Provides prev/next navigation between lessons
 */

import React from 'react';
import type { Lesson } from '@/types';

interface LessonNavProps {
  currentLesson: Lesson;
  allLessons: Lesson[];
  onNavigate: (lesson: Lesson) => void;
}

export default function LessonNav({ currentLesson, allLessons, onNavigate }: LessonNavProps) {
  // Sort lessons by order_index to ensure correct sequence
  const sortedLessons = [...allLessons].sort((a, b) => a.order_index - b.order_index);

  // Find current lesson index in sorted array
  const currentIndex = sortedLessons.findIndex((lesson) => lesson.id === currentLesson.id);

  // Determine if prev/next buttons should be disabled
  const isFirst = currentIndex === 0 || currentIndex === -1;
  const isLast = currentIndex === sortedLessons.length - 1 || currentIndex === -1;

  // Get previous and next lessons
  const prevLesson = !isFirst ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = !isLast ? sortedLessons[currentIndex + 1] : null;

  const handlePrev = () => {
    if (prevLesson) {
      onNavigate(prevLesson);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      onNavigate(nextLesson);
    }
  };

  return (
    <div className="lesson-nav">
      <button
        type="button"
        onClick={handlePrev}
        disabled={isFirst}
        aria-label="Previous lesson"
        className="lesson-nav-button"
      >
        Previous
      </button>

      <button
        type="button"
        onClick={handleNext}
        disabled={isLast}
        aria-label="Next lesson"
        className="lesson-nav-button"
      >
        Next
      </button>
    </div>
  );
}
/**
 * CourseCard Component - TDD Implementation
 * Reference: TEST_PLAN.md Section 2.2
 * Displays course information card with optional progress
 */

import React from 'react';
import type { Course } from '@/types';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: Course;
  progress?: number;
  enrolled?: boolean;
  teacherView?: boolean;
  onNavigate?: (path: string) => void;
}

export default function CourseCard({
  course,
  progress,
  enrolled = false,
  teacherView = false,
  onNavigate
}: CourseCardProps) {
  // Don't render unpublished courses in student view
  if (!course.is_published && !teacherView) {
    return null;
  }

  // Clamp progress to 0-100 range
  const clampedProgress = progress !== undefined ? Math.max(0, Math.min(100, progress)) : undefined;

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(`/courses/${course.slug}`);
    }
  };

  // Determine status text
  let statusText = '';
  if (enrolled) {
    if (clampedProgress === 0) {
      statusText = 'Not Started';
    } else if (clampedProgress === 100) {
      statusText = 'Completed';
    }
  }

  // Get thumbnail
  const thumbnailSrc = course.thumbnail_url;

  return (
    <article
      className="course-card"
      onClick={handleClick}
      role="article"
    >
      {!course.is_published && teacherView && (
        <span className="draft-badge">Draft</span>
      )}

      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={course.title}
          role="img"
        />
      )}

      <h3>{course.title}</h3>

      {course.description && (
        <p>{course.description}</p>
      )}

      <div className="course-meta">
        <span className="track">{course.track}</span>
        <span className="difficulty">{course.difficulty}</span>
        {course.default_duration_weeks && (
          <span className="hours">{course.default_duration_weeks} weeks</span>
        )}
      </div>

      {clampedProgress !== undefined && enrolled && (
        <div className="course-progress">
          <ProgressBar
            completed={clampedProgress}
            total={100}
            label={`Progress for ${course.title}`}
          />
          {statusText && <span className="status-text">{statusText}</span>}
        </div>
      )}
    </article>
  );
}
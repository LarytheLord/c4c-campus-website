-- Migration: Add teacher/admin read access to lesson_progress
-- Purpose: Allow teachers to view student progress for cohorts they manage
--          Allow admins to view all student progress for analytics
-- This fixes the "Avg. Progress 0%" bug on the teacher cohort details page
-- and the admin analytics page

-- Add SELECT policy for teachers to read student progress in their cohorts
CREATE POLICY "Teachers can view student progress in their cohorts"
ON lesson_progress
FOR SELECT
USING (
  -- Check if the current user is an approved teacher
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.user_id = (SELECT auth.uid())
    AND applications.status = 'approved'
    AND applications.role = 'teacher'
  )
  AND (
    -- Option 1: Progress is linked to a cohort the teacher created
    cohort_id IN (
      SELECT c.id FROM cohorts c
      JOIN courses co ON c.course_id = co.id
      WHERE co.created_by = (SELECT auth.uid())
    )
    OR
    -- Option 2: The lesson belongs to a course the teacher created
    lesson_id IN (
      SELECT l.id FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses co ON m.course_id = co.id
      WHERE co.created_by = (SELECT auth.uid())
    )
  )
);

-- Add SELECT policy for admins to read ALL student progress (for analytics)
CREATE POLICY "Admins can view all student progress"
ON lesson_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.user_id = (SELECT auth.uid())
    AND applications.status = 'approved'
    AND applications.role = 'admin'
  )
);

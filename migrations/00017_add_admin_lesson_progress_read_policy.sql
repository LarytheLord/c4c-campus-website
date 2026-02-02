-- Migration: Add admin read access to lesson_progress
-- Purpose: Allow admins to view ALL student progress for analytics
-- This fixes the "Avg. Completion 0 lessons" bug on the admin analytics page

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

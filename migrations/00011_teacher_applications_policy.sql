-- Migration: Allow teachers to view student applications in their cohorts
-- Date: 2026-01-27
-- Description: Fixes "Unknown" student names in teacher cohort management view
--              Teachers need to see student name/email for cohort roster management

-- ============================================================================
-- CREATE TEACHER POLICY FOR APPLICATIONS TABLE
-- ============================================================================

-- Allow teachers to view applications of students enrolled in their cohorts
-- This enables the teacher cohort management page to display student names/emails
CREATE POLICY "Teachers view student applications in own cohorts" 
ON applications 
FOR SELECT 
USING (
  -- The application's user_id must be a student enrolled in a cohort
  -- that belongs to a course created by the current teacher
  user_id IN (
    SELECT ce.user_id 
    FROM cohort_enrollments ce
    JOIN cohorts c ON ce.cohort_id = c.id
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = auth.uid()
  )
);

-- ============================================================================
-- PERFORMANCE: Add index for faster lookups
-- ============================================================================

-- Index on courses.created_by for faster teacher course lookups
CREATE INDEX IF NOT EXISTS idx_courses_created_by 
    ON courses(created_by);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that the policy was created
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY policyname;

-- Expected: Should now include "Teachers view student applications in own cohorts"

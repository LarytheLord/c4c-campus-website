-- Migration: Fix Lesson Discussions RLS for Enrollments vs Cohort Enrollments
-- Date: 2026-01-27
-- Description: Updates RLS policies to allow users in 'enrollments' table (legacy/hybrid)
--              to participate in discussions, matching the 'cohort_enrollments' logic.

-- ============================================================================
-- 1. Drop existing restrictive policies
-- ============================================================================

DROP POLICY IF EXISTS "Users view lesson discussions" ON lesson_discussions;
DROP POLICY IF EXISTS "Users create lesson discussions" ON lesson_discussions;

-- ============================================================================
-- 2. Create broadened policies
-- ============================================================================

-- Users can view discussions if they are in the cohort (via EITHER table)
CREATE POLICY "Users view lesson discussions" ON lesson_discussions FOR SELECT USING (
  -- 1. User is enrolled in the cohort (via cohort_enrollments)
  cohort_id IN (
    SELECT ce.cohort_id FROM cohort_enrollments ce
    WHERE ce.user_id = (select auth.uid()) AND ce.status IN ('active', 'completed')
  )
  OR
  -- 2. User is enrolled in the cohort (via enrollments - legacy/hybrid)
  cohort_id IN (
    SELECT e.cohort_id FROM enrollments e
    WHERE e.user_id = (select auth.uid()) AND e.status IN ('active', 'completed')
    AND e.cohort_id IS NOT NULL
  )
  OR
  -- 3. User is teacher/creator of the course
  lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE c.created_by = (select auth.uid())
  )
  OR 
  -- 4. Admin access
  is_admin((select auth.uid()))
);

-- Users can create discussions if they are in the cohort
CREATE POLICY "Users create lesson discussions" ON lesson_discussions FOR INSERT WITH CHECK (
  -- User must match auth.uid()
  user_id = (select auth.uid())
  AND
  (
    -- 1. Enrolled via cohort_enrollments
    EXISTS (
      SELECT 1 FROM cohort_enrollments ce
      WHERE ce.user_id = (select auth.uid())
      AND ce.cohort_id = cohort_id
      AND ce.status IN ('active', 'completed')
    )
    OR
    -- 2. Enrolled via enrollments (legacy/hybrid)
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = (select auth.uid())
      AND e.cohort_id = cohort_id
      AND e.status IN ('active', 'completed')
    )
    OR
    -- 3. Teacher/Admin override (implicit via other policies usually, but good to check access)
    -- Actually, for INSERT, we usually restrict to enrollment. Teachers use a different path?
    -- No, teachers insert as themselves. They might not be 'enrolled'.
    -- We need to check if they are the course creator.
    EXISTS (
        SELECT 1 FROM lessons l
        JOIN modules m ON l.module_id = m.id
        JOIN courses c ON m.course_id = c.id
        WHERE l.id = lesson_id
        AND (c.created_by = (select auth.uid()) OR is_admin((select auth.uid())))
    )
  )
);

-- ============================================================================
-- Verification
-- ============================================================================
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'lesson_discussions'
ORDER BY policyname;

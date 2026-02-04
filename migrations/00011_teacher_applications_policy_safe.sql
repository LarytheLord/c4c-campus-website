-- Migration: FIXED RLS policy for teachers to view student applications
-- Date: 2026-01-27  
-- Description: Fixes "Unknown" student names and "No user found" error
--
-- CRITICAL FIX: Previous migrations caused RLS recursion by querying
-- the `applications` table inside a policy ON the `applications` table.
-- This migration uses the existing `is_teacher()` SECURITY DEFINER function
-- which bypasses RLS and avoids the recursion.

-- ============================================================================
-- STEP 1: ROLLBACK - Drop ALL problematic policies
-- ============================================================================

DROP POLICY IF EXISTS "Teachers view student applications in own cohorts" ON applications;

-- ============================================================================
-- STEP 2: CREATE FIXED TEACHER POLICY (NO RECURSION)
-- ============================================================================

-- This policy uses the existing is_teacher() SECURITY DEFINER function
-- which safely checks if the current user is a teacher without RLS recursion.
--
-- The policy allows teachers to view STUDENT applications where the student
-- is enrolled in a cohort that belongs to a course created by the teacher.

CREATE POLICY "Teachers view student applications in own cohorts" 
ON applications 
FOR SELECT 
USING (
  -- Use SECURITY DEFINER function to check teacher status (avoids RLS recursion)
  is_teacher((select auth.uid()))
  AND
  -- Only allow viewing student applications
  role = 'student'
  AND
  -- The student must be enrolled in a cohort of a course created by this teacher
  user_id IN (
    SELECT ce.user_id 
    FROM cohort_enrollments ce
    JOIN cohorts c ON ce.cohort_id = c.id
    JOIN courses co ON c.course_id = co.id
    WHERE co.created_by = (select auth.uid())
  )
);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Check that policies exist and are configured correctly
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY policyname;

-- Expected output should include:
-- 1. "Admins update applications" (UPDATE)
-- 2. "Admins view all applications" (SELECT)  
-- 3. "Teachers view student applications in own cohorts" (SELECT) <-- FIXED
-- 4. "Users create own applications" (INSERT)
-- 5. "Users update own applications" (UPDATE)
-- 6. "Users view own applications" (SELECT) <-- This allows teachers to see THEIR OWN app

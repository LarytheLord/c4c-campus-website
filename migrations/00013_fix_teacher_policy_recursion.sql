-- Migration: Fix Teacher Policy Recursion using SECURITY DEFINER
-- Date: 2026-01-27
-- Description: Fixes the infinite RLS recursion by using a SECURITY DEFINER function
--              This isolates the check from RLS policies on related tables

-- ============================================================================
-- 1. Create Helper Function (SECURITY DEFINER)
-- ============================================================================

-- This function runs with the privileges of the creator (bypassing RLS)
-- preventing the infinite recursion loop between:
-- applications -> cohort_enrollments -> cohorts -> cohort_enrollments ...
CREATE OR REPLACE FUNCTION public.is_student_in_teacher_cohort(student_id UUID, teacher_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM cohort_enrollments ce
    JOIN cohorts c ON ce.cohort_id = c.id
    JOIN courses co ON c.course_id = co.id
    WHERE ce.user_id = student_id 
      AND co.created_by = teacher_id
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_student_in_teacher_cohort TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_student_in_teacher_cohort TO service_role;

-- ============================================================================
-- 2. Allow Teachers to view their students (Using the function)
-- ============================================================================

-- Drop the previous recursive policy
DROP POLICY IF EXISTS "Teachers view student applications in own cohorts" ON applications;

-- Create the new non-recursive policy
CREATE POLICY "Teachers view student applications in own cohorts" 
ON applications 
FOR SELECT 
USING (
  -- 1. Caller must be a teacher (uses existing SECURITY DEFINER function)
  is_teacher((select auth.uid()))
  AND
  -- 2. Target must be a student
  role = 'student'
  AND
  -- 3. Student must be in teacher's cohort (uses NEW SECURITY DEFINER function)
  is_student_in_teacher_cohort(user_id, (select auth.uid()))
);

-- ============================================================================
-- Verification
-- ============================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY policyname;

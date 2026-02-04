-- Migration: Add admin delete/update access to courses
-- Purpose: Allow admins to delete/update any course (not just their own)
--          Allow teachers to delete/update courses they created
-- This fixes the issue where admins/teachers cannot delete courses

-- Add DELETE policy for admins to delete any course
CREATE POLICY "Admins can delete any course"
ON courses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.user_id = (SELECT auth.uid())
    AND applications.status = 'approved'
    AND applications.role = 'admin'
  )
);

-- Add UPDATE policy for admins to update any course
CREATE POLICY "Admins can update any course"
ON courses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.user_id = (SELECT auth.uid())
    AND applications.status = 'approved'
    AND applications.role = 'admin'
  )
);

-- Add DELETE policy for teachers to delete their own courses
CREATE POLICY "Teachers can delete their own courses"
ON courses
FOR DELETE
USING (
  created_by = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM applications
    WHERE applications.user_id = (SELECT auth.uid())
    AND applications.status = 'approved'
    AND applications.role IN ('teacher', 'admin')
  )
);

-- Add UPDATE policy for teachers to update their own courses
CREATE POLICY "Teachers can update their own courses"
ON courses
FOR UPDATE
USING (
  created_by = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM applications
    WHERE applications.user_id = (SELECT auth.uid())
    AND applications.status = 'approved'
    AND applications.role IN ('teacher', 'admin')
  )
);

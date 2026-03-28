-- Migration: Add UPDATE and DELETE policies for lesson_discussions
-- Date: 2026-01-30
-- Description: Adds missing RLS policies to allow users to update and delete their own comments.

-- ============================================================================
-- 1. Update Policy
-- ============================================================================

DROP POLICY IF EXISTS "Users update own lesson discussions" ON lesson_discussions;

CREATE POLICY "Users update own lesson discussions" ON lesson_discussions
FOR UPDATE USING (
  user_id = auth.uid() 
  OR 
  is_admin((select auth.uid()))
);

-- ============================================================================
-- 2. Delete Policy
-- ============================================================================

DROP POLICY IF EXISTS "Users delete own lesson discussions" ON lesson_discussions;

CREATE POLICY "Users delete own lesson discussions" ON lesson_discussions
FOR DELETE USING (
  user_id = auth.uid() 
  OR 
  is_admin((select auth.uid()))
);

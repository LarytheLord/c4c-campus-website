-- Migration: EMERGENCY ROLLBACK - Remove the teacher applications policy
-- Date: 2026-01-27
-- Description: Rolls back migration 00011 that may be causing issues
--              The new policy's subquery may be causing SELECT failures

-- ============================================================================
-- ROLLBACK: Drop the teacher applications policy
-- ============================================================================

-- Drop the policy that was causing issues
DROP POLICY IF EXISTS "Teachers view student applications in own cohorts" ON applications;

-- ============================================================================
-- VERIFICATION: Ensure the base policies still exist
-- ============================================================================

-- Check that the original policies are still in place
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY policyname;

-- Expected policies:
-- 1. "Admins update applications" (UPDATE)
-- 2. "Admins view all applications" (SELECT)
-- 3. "Users create own applications" (INSERT)
-- 4. "Users update own applications" (UPDATE)  
-- 5. "Users view own applications" (SELECT)

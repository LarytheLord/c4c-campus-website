-- Migration: Complete fix for cohorts RLS infinite recursion
-- Date: 2026-01-17
-- Description: Properly fixes RLS policies on cohorts table to prevent infinite recursion
--              and ensure teachers/admins can create/manage cohorts

-- ============================================================================
-- DROP ALL EXISTING COHORTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Cohorts are viewable by everyone" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be inserted by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be updated by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be deleted by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_insert_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_update_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_delete_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_all" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_authenticated" ON cohorts;
DROP POLICY IF EXISTS "cohorts_insert_teachers_admins" ON cohorts;
DROP POLICY IF EXISTS "cohorts_update_creator_admin" ON cohorts;
DROP POLICY IF EXISTS "cohorts_delete_creator_admin" ON cohorts;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE NON-RECURSIVE POLICIES
-- ============================================================================

-- SELECT: Authenticated users can view all cohorts
CREATE POLICY "cohorts_select_authenticated" ON cohorts
    FOR SELECT
    USING (auth.role() = 'authenticated');

COMMENT ON POLICY "cohorts_select_authenticated" ON cohorts IS 
    'Allows authenticated users to view all cohorts (security requirement)';

-- INSERT: Teachers and admins can create cohorts
-- IMPORTANT: Uses applications.status = 'approved' to avoid infinite loops
CREATE POLICY "cohorts_insert_teachers_admins" ON cohorts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.status = 'approved'
            AND applications.role IN ('teacher', 'admin')
        )
    );

COMMENT ON POLICY "cohorts_insert_teachers_admins" ON cohorts IS
    'Allows approved teachers and admins to create cohorts';

-- UPDATE: Creator or admins can update cohorts
CREATE POLICY "cohorts_update_creator_admin" ON cohorts
    FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.status = 'approved'
            AND applications.role = 'admin'
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.status = 'approved'
            AND applications.role = 'admin'
        )
    );

COMMENT ON POLICY "cohorts_update_creator_admin" ON cohorts IS
    'Allows cohort creator or admins to update cohorts';

-- DELETE: Creator or admins can delete cohorts
CREATE POLICY "cohorts_delete_creator_admin" ON cohorts
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.status = 'approved'
            AND applications.role = 'admin'
        )
    );

COMMENT ON POLICY "cohorts_delete_creator_admin" ON cohorts IS
    'Allows cohort creator or admins to delete cohorts';

-- ============================================================================
-- PERFORMANCE: Add composite index if not exists
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_applications_user_id_role_status 
    ON applications(user_id, role, status);

COMMENT ON INDEX idx_applications_user_id_role_status IS 
    'Optimizes RLS policy lookups for cohorts operations';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'cohorts'
ORDER BY policyname;

-- Expected output: 4 policies
-- cohorts_delete_creator_admin
-- cohorts_insert_teachers_admins
-- cohorts_select_authenticated
-- cohorts_update_creator_admin

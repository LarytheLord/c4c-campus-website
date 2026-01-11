-- Migration: Fix RLS policy security + performance improvements
-- Addresses PR review feedback for cohorts policies

-- ============================================================================
-- SECURITY FIX: Restrict cohorts access to authenticated users only
-- (Previously was public which exposed training schedules to anonymous users)
-- ============================================================================

-- First, drop all existing policies on cohorts to start fresh
DROP POLICY IF EXISTS "Cohorts are viewable by everyone" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be inserted by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be updated by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be deleted by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_insert_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_update_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_delete_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_all" ON cohorts;
DROP POLICY IF EXISTS "cohorts_insert_teachers_admins" ON cohorts;
DROP POLICY IF EXISTS "cohorts_update_creator_admin" ON cohorts;
DROP POLICY IF EXISTS "cohorts_delete_creator_admin" ON cohorts;

-- Enable RLS on cohorts table if not already enabled
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- SELECT: Only authenticated users can view cohorts (SECURITY FIX)
CREATE POLICY "cohorts_select_authenticated" ON cohorts
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- INSERT: Only teachers and admins can create cohorts
CREATE POLICY "cohorts_insert_teachers_admins" ON cohorts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.role IN ('teacher', 'admin')
        )
    );

-- UPDATE: Only the creator or admins can update cohorts
CREATE POLICY "cohorts_update_creator_admin" ON cohorts
    FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.role = 'admin'
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.role = 'admin'
        )
    );

-- DELETE: Only the creator or admins can delete cohorts
CREATE POLICY "cohorts_delete_creator_admin" ON cohorts
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications
            WHERE applications.user_id = auth.uid()
            AND applications.role = 'admin'
        )
    );

-- ============================================================================
-- PERFORMANCE: Add composite index for RLS policy lookups
-- ============================================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_id_role 
    ON applications(user_id, role);

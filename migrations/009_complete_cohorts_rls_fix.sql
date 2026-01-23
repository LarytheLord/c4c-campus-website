-- Migration: Complete fix for ALL cohorts/cohort_enrollments RLS policies
-- Date: 2026-01-18
-- Description: Fixes infinite recursion by eliminating circular policy dependencies
--              between cohorts and cohort_enrollments tables

-- ============================================================================
-- STEP 1: DROP ALL EXISTING COHORTS POLICIES (including schema.sql ones)
-- ============================================================================

-- Drop all cohorts policies from schema.sql
DROP POLICY IF EXISTS "View enrolled cohorts" ON cohorts;
DROP POLICY IF EXISTS "View upcoming cohorts" ON cohorts;
DROP POLICY IF EXISTS "Teachers manage own cohorts" ON cohorts;

-- Drop all cohorts policies from migration 004
DROP POLICY IF EXISTS "Cohorts are viewable by everyone" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be inserted by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be updated by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "Cohorts can be deleted by teachers and admins" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_insert_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_update_policy" ON cohorts;
DROP POLICY IF EXISTS "cohorts_delete_policy" ON cohorts;

-- Drop all cohorts policies from migration 006
DROP POLICY IF EXISTS "cohorts_select_all" ON cohorts;
DROP POLICY IF EXISTS "cohorts_select_authenticated" ON cohorts;

-- Drop all cohorts policies from migration 007
DROP POLICY IF EXISTS "cohorts_insert_teachers_admins" ON cohorts;
DROP POLICY IF EXISTS "cohorts_update_creator_admin" ON cohorts;
DROP POLICY IF EXISTS "cohorts_delete_creator_admin" ON cohorts;

-- ============================================================================
-- STEP 2: DROP ALL COHORT_ENROLLMENTS POLICIES THAT CAUSE RECURSION
-- ============================================================================

DROP POLICY IF EXISTS "Users view own cohort enrollments" ON cohort_enrollments;
DROP POLICY IF EXISTS "Users create own cohort enrollments" ON cohort_enrollments;
DROP POLICY IF EXISTS "Users update own cohort enrollments" ON cohort_enrollments;
DROP POLICY IF EXISTS "Teachers view cohort students" ON cohort_enrollments;
DROP POLICY IF EXISTS "Teachers enroll students in own cohorts" ON cohort_enrollments;
DROP POLICY IF EXISTS "Teachers update cohort enrollments" ON cohort_enrollments;
DROP POLICY IF EXISTS "Teachers delete cohort enrollments" ON cohort_enrollments;

-- Also drop the new policy names in case migration was partially run before
DROP POLICY IF EXISTS "enrollments_select_own" ON cohort_enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON cohort_enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON cohort_enrollments;
DROP POLICY IF EXISTS "enrollments_select_teachers" ON cohort_enrollments;
DROP POLICY IF EXISTS "enrollments_insert_teachers" ON cohort_enrollments;
DROP POLICY IF EXISTS "enrollments_update_teachers" ON cohort_enrollments;
DROP POLICY IF EXISTS "enrollments_delete_teachers" ON cohort_enrollments;

-- ============================================================================
-- STEP 3: ENABLE RLS
-- ============================================================================

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: CREATE NON-RECURSIVE COHORTS POLICIES
-- Key: Only query applications and courses tables, NEVER cohort_enrollments
-- ============================================================================

-- SELECT: Authenticated users can view all cohorts
-- This is simple and doesn't cause recursion
CREATE POLICY "cohorts_select_authenticated" ON cohorts
    FOR SELECT TO authenticated
    USING (true);

-- INSERT: Approved teachers and admins can create cohorts
-- Queries ONLY the applications table - no recursion
CREATE POLICY "cohorts_insert_teachers_admins" ON cohorts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role IN ('teacher', 'admin')
        )
    );

-- UPDATE: Creator or admins can update
-- Queries applications for admin check, uses created_by for creator check
CREATE POLICY "cohorts_update_creator_admin" ON cohorts
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    );

-- DELETE: Creator or admins can delete
CREATE POLICY "cohorts_delete_creator_admin" ON cohorts
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    );

-- ============================================================================
-- STEP 5: CREATE NON-RECURSIVE COHORT_ENROLLMENTS POLICIES
-- Key: NEVER query cohorts table, use cohorts.created_by directly via JOIN to courses
-- ============================================================================

-- Users can view their own enrollments
CREATE POLICY "enrollments_select_own" ON cohort_enrollments
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Users can create their own enrollments
CREATE POLICY "enrollments_insert_own" ON cohort_enrollments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollments
CREATE POLICY "enrollments_update_own" ON cohort_enrollments
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Teachers/admins can view all enrollments for their courses
-- Uses a direct join path: cohort_enrollments -> cohorts (via cohort_id) -> courses
-- The key is we access cohorts.course_id and then check courses.created_by
CREATE POLICY "enrollments_select_teachers" ON cohort_enrollments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = (SELECT course_id FROM cohorts WHERE id = cohort_enrollments.cohort_id)
            AND c.created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    );

-- Teachers/admins can insert enrollments for their courses
CREATE POLICY "enrollments_insert_teachers" ON cohort_enrollments
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = (SELECT course_id FROM cohorts WHERE id = cohort_enrollments.cohort_id)
            AND c.created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    );

-- Teachers/admins can update enrollments for their courses
CREATE POLICY "enrollments_update_teachers" ON cohort_enrollments
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = (SELECT course_id FROM cohorts WHERE id = cohort_enrollments.cohort_id)
            AND c.created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    );

-- Teachers/admins can delete enrollments for their courses
CREATE POLICY "enrollments_delete_teachers" ON cohort_enrollments
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = (SELECT course_id FROM cohorts WHERE id = cohort_enrollments.cohort_id)
            AND c.created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM applications a
            WHERE a.user_id = auth.uid()
            AND a.status = 'approved'
            AND a.role = 'admin'
        )
    );

-- ============================================================================
-- STEP 6: CREATE INDEX FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_applications_user_role_status 
    ON applications(user_id, role, status);

CREATE INDEX IF NOT EXISTS idx_cohorts_course_id
    ON cohorts(course_id);

CREATE INDEX IF NOT EXISTS idx_cohorts_created_by
    ON cohorts(created_by);

-- ============================================================================
-- VERIFICATION: Check policies were created correctly
-- ============================================================================

-- This should show 4 cohorts policies and 7 cohort_enrollments policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('cohorts', 'cohort_enrollments')
ORDER BY tablename, policyname;

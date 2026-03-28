-- Migration: Add protected_class and career_goals columns to applications table
-- Date: 2025-12-17
-- Description: Adds two new required fields for both bootcamp and accelerator applications

-- ============================================================================
-- UP: Add new columns
-- ============================================================================

-- Add protected_class column for diversity tracking
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS protected_class TEXT;

-- Add career_goals column for understanding applicant motivations
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS career_goals TEXT;

-- Add comments for documentation
COMMENT ON COLUMN applications.protected_class IS 'Protected class identification (e.g., SC, OBC, EWS, DNT, Transgender, UK Equality Act 2010, etc.)';
COMMENT ON COLUMN applications.career_goals IS 'Applicant career path goals and what they want to get out of the program';

-- ============================================================================
-- VERIFICATION: Check that columns were added successfully
-- ============================================================================

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'applications' 
  AND column_name IN ('protected_class', 'career_goals');

-- Expected output:
-- column_name      | data_type | is_nullable
-- -----------------+-----------+-------------
-- protected_class  | text      | YES
-- career_goals     | text      | YES

-- ============================================================================
-- ROLLBACK: Remove columns (if needed)
-- ============================================================================

-- Uncomment the following lines to rollback this migration:
-- ALTER TABLE applications DROP COLUMN IF EXISTS protected_class;
-- ALTER TABLE applications DROP COLUMN IF EXISTS career_goals;

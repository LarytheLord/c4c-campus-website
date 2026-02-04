-- Admin policies for cohort_enrollments
-- Allows admins to view and manage all cohort enrollments

CREATE POLICY "Admins manage all cohort enrollments"
ON cohort_enrollments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Ensure RLS is enabled (should be already, but safe to re-run)
ALTER TABLE cohort_enrollments ENABLE ROW LEVEL SECURITY;

-- Migration to modify test_results table to allow students to retake tests
-- This allows students to submit the same test multiple times until they pass (score > 12)
-- Old records will be replaced with new ones instead of creating multiple records

-- First, we need to drop the existing unique constraint
ALTER TABLE test_results DROP INDEX unique_test_submission;

-- Then, we add a new unique constraint on etudiant_id and test_id combination
-- This will allow us to use ON DUPLICATE KEY UPDATE
ALTER TABLE test_results ADD UNIQUE KEY unique_student_test (etudiant_id, test_id);
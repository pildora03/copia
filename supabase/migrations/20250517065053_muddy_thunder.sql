/*
  # Update foreign key constraint for cascade delete

  1. Changes
    - Modify the foreign key constraint on attendance_records table to CASCADE on delete
    - This allows automatic deletion of attendance records when a student is deleted

  2. Implementation
    - Drop existing foreign key constraint
    - Create new constraint with ON DELETE CASCADE
*/

-- Drop existing foreign key constraint
ALTER TABLE attendance_records
DROP CONSTRAINT attendance_records_student_id_fkey;

-- Add new constraint with CASCADE delete
ALTER TABLE attendance_records
ADD CONSTRAINT attendance_records_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES students(id)
ON DELETE CASCADE;
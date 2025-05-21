/*
  # Create tables and policies for attendance system

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `student_id` (text, unique, not null)
      - `created_at` (timestamptz, default now())
    - `attendance_records`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students.id)
      - `check_in_time` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all students
      - Insert new students
      - Read all attendance records
      - Insert new attendance records
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  check_in_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies for students table
CREATE POLICY "Enable read access for all users" ON students
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON students
  FOR INSERT WITH CHECK (true);

-- Policies for attendance_records table
CREATE POLICY "Enable read access for all users" ON attendance_records
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON attendance_records
  FOR INSERT WITH CHECK (true);
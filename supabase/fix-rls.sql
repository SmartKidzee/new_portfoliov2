-- FIX: Allow anon users to insert blogs (for import script)
-- Run this in Supabase SQL Editor

-- Drop existing insert policy
DROP POLICY IF EXISTS "Allow authenticated insert on blogs" ON blogs;

-- Create new policy allowing anon insert
CREATE POLICY "Allow anon insert on blogs"
  ON blogs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also allow updates
DROP POLICY IF EXISTS "Allow authenticated update on blogs" ON blogs;

CREATE POLICY "Allow anon update on blogs"
  ON blogs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'blogs';

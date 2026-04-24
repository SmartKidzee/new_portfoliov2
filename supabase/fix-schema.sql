-- FIX: Normalize the isAchievement column on existing blogs tables
-- Run this in Supabase SQL Editor

-- Rename legacy lowercase column and create the quoted camelCase column if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blogs' AND column_name = 'isachievement'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blogs' AND column_name = 'isAchievement'
  ) THEN
    ALTER TABLE blogs RENAME COLUMN isachievement TO "isAchievement";
    RAISE NOTICE 'Renamed legacy isachievement column to isAchievement';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blogs' AND column_name = 'isAchievement'
  ) THEN
    ALTER TABLE blogs ADD COLUMN "isAchievement" BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added isAchievement column to blogs table';
  ELSE
    RAISE NOTICE 'isAchievement column already exists';
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blogs' 
ORDER BY ordinal_position;

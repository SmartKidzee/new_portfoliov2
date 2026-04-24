-- Complete Supabase Setup for Portfolio Blog
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. BLOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  src TEXT, -- Thumbnail image URL
  "isAchievement" BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  route TEXT NOT NULL,
  video TEXT -- Video URL if applicable
);

-- Enable RLS on blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Everyone can read blogs
CREATE POLICY "Allow public read access on blogs"
  ON blogs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can create/update (optional, for admin panel later)
CREATE POLICY "Allow authenticated insert on blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 2. BLOG LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id TEXT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Browser session ID for non-logged users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, session_id)
);

-- Enable RLS on likes
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- Everyone can read likes
CREATE POLICY "Allow public read access on blog_likes"
  ON blog_likes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Everyone can insert likes (with session check in application)
CREATE POLICY "Allow public insert on blog_likes"
  ON blog_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Everyone can delete their own likes (with session check in application)
CREATE POLICY "Allow public delete on blog_likes"
  ON blog_likes FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================
-- 3. FUNCTIONS FOR LIKE OPERATIONS
-- ============================================

-- Function to get like count for a blog
CREATE OR REPLACE FUNCTION get_blog_likes_count(blog_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM blog_likes WHERE blog_id = blog_id_param);
END;
$$ LANGUAGE plpgsql;

-- Function to check if session has liked a blog
CREATE OR REPLACE FUNCTION has_session_liked(blog_id_param TEXT, session_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blog_likes 
    WHERE blog_id = blog_id_param AND session_id = session_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_session_id ON blog_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);

-- ============================================
-- 5. SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

/*
INSERT INTO blogs (id, category, title, content, created_at, src, tags, route) VALUES
('1', 'Technology', 'Getting Started with Next.js 15', 'Next.js 15 brings many exciting features...', NOW(), 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', ARRAY['nextjs', 'react', 'webdev'], '/blogs/1'),
('2', 'Tutorial', 'Building with Tailwind CSS', 'Tailwind CSS is a utility-first CSS framework...', NOW() - INTERVAL '1 day', 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80', ARRAY['css', 'tailwind', 'design'], '/blogs/2');
*/

-- ============================================
-- 6. REALTIME SUBSCRIPTION SETUP (Optional)
-- ============================================
-- Enable realtime for likes to sync across tabs/devices
BEGIN;
  -- Add table to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE blog_likes;
  ALTER PUBLICATION supabase_realtime ADD TABLE blogs;
COMMIT;

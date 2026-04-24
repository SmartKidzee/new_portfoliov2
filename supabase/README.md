# Supabase Setup Guide

This project now uses Supabase as the live source of truth for blog data. The like functionality still uses the public Supabase tables from the browser.

## Setup Steps

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Create Database Tables**

   If you want to migrate blog data to Supabase later, run this SQL in the Supabase SQL Editor:

   ```sql
   -- Blogs table
   CREATE TABLE blogs (
     id TEXT PRIMARY KEY,
     category TEXT NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     src TEXT,
     "isAchievement" BOOLEAN DEFAULT FALSE,
     tags TEXT[] DEFAULT '{}',
     route TEXT NOT NULL,
     video TEXT
   );

   -- Enable RLS
   ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

   -- Policies for blogs (public read)
   CREATE POLICY "Allow public read access on blogs"
     ON blogs FOR SELECT
     TO anon, authenticated
     USING (true);
   ```

4. **Import Existing Blogs** (one-time migration)

   You can import the existing blog data from `content-data/blogs.json` into Supabase.
   For bulk import, run `node supabase/import-blogs.js`.
   For manual rich-post inserts with multiline tables and image grids, use `supabase/rich-blog-example.sql`.

## Architecture

- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS
- **Blog Data**: Live Supabase reads for the homepage, blog index, and blog detail pages
- **Like System**: Public Supabase reads/writes keyed by a local browser session id
- **Rendering**: Dynamic Next.js routes so newly added blogs can appear without a JSON sync

## Features

- **Individual Blog Pages**: `/blogs/[id]` - Each blog has its own page with full content
- **Thumbnails**: Blog list shows thumbnails with fallback gradient
- **Like System**: Stunning animated like button with particle effects
- **Responsive Design**: Mobile-first responsive layout
- **Share Buttons**: Social sharing (Twitter/X, LinkedIn, Facebook)
- **Read Time**: Estimated reading time calculation
- **Markdown Parsing**: Blog content is parsed from markdown-like format

## Like System

The like button uses localStorage for persistence:
- Likes are stored per browser session
- Users can only like once per blog post
- Like counts persist across page reloads
- Animated with particle explosion effects

## Fallback Behavior

If Supabase is not configured:
1. Blog pages will not have live post data to render.
2. Like interactions will stay disabled because the public client cannot connect.

## File Structure

`supabase/`
Contains the SQL setup/fix files, the import helper, and the shared Supabase client utilities.

## Build & Deploy

```bash
npm run build
```

This creates a Next.js production build in `dist/`.
Deploy it to a platform that supports Next.js server rendering so the live Supabase blog fetches can happen on request.

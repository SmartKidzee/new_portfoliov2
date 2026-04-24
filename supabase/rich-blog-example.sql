-- Rich blog insert example for Supabase SQL Editor
-- Replace your-project, file paths, and blog values with your real ones.

INSERT INTO blogs (
  id,
  category,
  title,
  content,
  created_at,
  updated_at,
  src,
  "isAchievement",
  tags,
  route,
  video
)
VALUES (
  '10',
  'Tech',
  'Responsive Rich Blog Example',
  $blog_10$
**Responsive tables and image grids**

This format is now supported directly by the blog renderer.

<BlogTable
  headers={["Aspect", "Traditional Coding", "Vibe Coding"]}
  rows={[
    {
      "Aspect": "Skill Requirement",
      "Traditional Coding": "High (programming languages, syntax)",
      "Vibe Coding": "Low (natural language prompts)"
    },
    {
      "Aspect": "Development Speed",
      "Traditional Coding": "Slower, manual process",
      "Vibe Coding": "Faster, AI-assisted"
    }
  ]}
/>

**Gallery**

<div class="blog-image-grid">
  <img src="https://your-project.supabase.co/storage/v1/object/public/blog-images/post-10/shot-1.webp" alt="Shot 1" />
  <img src="https://your-project.supabase.co/storage/v1/object/public/blog-images/post-10/shot-2.webp" alt="Shot 2" />
  <img src="https://your-project.supabase.co/storage/v1/object/public/blog-images/post-10/shot-3.webp" alt="Shot 3" />
</div>
  $blog_10$,
  '2026-04-22',
  '2026-04-22',
  'https://your-project.supabase.co/storage/v1/object/public/blog-thumbnails/post-10-thumb.webp',
  FALSE,
  ARRAY['AI', 'Tables', 'Supabase'],
  '/blogs/10',
  NULL
);

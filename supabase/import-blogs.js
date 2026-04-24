// Script to import blogs from JSON to Supabase
// Run with: node supabase/import-blogs.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importBlogs() {
  try {
    const blogsPath = path.join(__dirname, "..", "content-data", "blogs.json");
    const blogsData = JSON.parse(fs.readFileSync(blogsPath, "utf8"));
    const posts = blogsData.content.posts;

    console.log(`Found ${posts.length} blogs to import.\n`);

    for (const post of posts) {
      const blogData = {
        id: post.id,
        category: post.category,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
        src: post.src || null,
        isAchievement: post.isAchievement || false,
        tags: post.tags || [],
        route: post.route,
        video: post.video || null,
      };

      const { error } = await supabase.from("blogs").upsert(blogData, { onConflict: "id" });

      if (error) {
        console.error(`Failed to import "${post.title}":`, error.message);
      } else {
        console.log(`Imported: "${post.title}"`);
      }
    }

    console.log("\nImport complete.");
    console.log("Next steps:");
    console.log("1. Run: npm run build");
    console.log("2. Test likes on individual blog posts");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

importBlogs();

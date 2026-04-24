import type { MetadataRoute } from "next";

import { getAllBlogs } from "@/lib/blogs";

const BASE_URL = "https://www.shreyas.cloud";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* ── Static pages ── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-04-22"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date("2026-04-22"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  /* ── Dynamic blog posts ── */
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const posts = await getAllBlogs();
    blogPages = posts.map((post) => ({
      url: `${BASE_URL}/blogs/${post.id}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Supabase unavailable — skip dynamic blog entries
  }

  return [...staticPages, ...blogPages];
}

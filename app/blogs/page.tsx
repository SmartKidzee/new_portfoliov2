import type { Metadata } from "next";

import { BlogsPageClient } from "@/components/blogs-page-client";
import { getAllBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getAllBlogs();
  const count = posts.length;

  return {
    title: "Blog — AI, Web Engineering & Build Logs",
    description: `${count} posts on AI systems, full-stack engineering, and building products in public. Project notes, experiments, and lessons from shipping real software.`,
    alternates: {
      canonical: "/blogs",
    },
    openGraph: {
      title: "Blog — AI, Web Engineering & Build Logs",
      description: `${count} posts on AI systems, full-stack engineering, and building products in public.`,
      url: "/blogs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Blog — AI, Web Engineering & Build Logs",
      description: `${count} posts on AI systems, full-stack engineering, and building in public.`,
    },
  };
}

export default async function BlogsPage() {
  const posts = await getAllBlogs();

  return <BlogsPageClient posts={posts} />;
}

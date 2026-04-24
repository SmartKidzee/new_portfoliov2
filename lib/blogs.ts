import { createClient } from "@supabase/supabase-js";

import type { BlogPost } from "@/supabase/client";

type SupabaseBlogRow = {
  id: string | number;
  category?: string | null;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  src?: string | null;
  isAchievement?: boolean | null;
  isachievement?: boolean | null;
  tags?: string[] | null;
  route?: string | null;
  video?: string | null;
};

function safeMediaSource(src?: string | null) {
  return src && (/^https?:\/\//.test(src) || src.startsWith("/")) ? src : null;
}

function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeBlogPost(row: SupabaseBlogRow): BlogPost {
  const id = String(row.id);
  const createdAt = row.created_at ?? new Date(0).toISOString();

  return {
    id,
    category: row.category?.trim() || "Uncategorized",
    title: row.title?.trim() || "Untitled post",
    content: row.content ?? "",
    created_at: createdAt,
    updated_at: row.updated_at ?? createdAt,
    src: safeMediaSource(row.src),
    isAchievement: row.isAchievement ?? row.isachievement ?? false,
    tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
    route: row.route?.trim() || `/blogs/${id}`,
    video: row.video ?? null,
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const client = getServerSupabaseClient();

  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client.from("blogs").select("*").order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => normalizeBlogPost(row as SupabaseBlogRow));
  } catch {
    return [];
  }
}

export async function getLatestBlogs(limit = 4): Promise<BlogPost[]> {
  const client = getServerSupabaseClient();

  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row) => normalizeBlogPost(row as SupabaseBlogRow));
  } catch {
    return [];
  }
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const client = getServerSupabaseClient();

  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client.from("blogs").select("*").eq("id", id).maybeSingle();

    if (error || !data) {
      return null;
    }

    return normalizeBlogPost(data as SupabaseBlogRow);
  } catch {
    return null;
  }
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export interface BlogPost {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  src?: string | null;
  isAchievement?: boolean;
  tags: string[];
  route: string;
  video?: string | null;
}

export interface BlogLike {
  id: string;
  blog_id: string;
  user_id?: string | null;
  session_id: string;
  created_at: string;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabase) {
    return _supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase = getSupabaseClient();

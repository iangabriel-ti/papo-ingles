"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authEnabled, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowser() {
  if (!authEnabled) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}

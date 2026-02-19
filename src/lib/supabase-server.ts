import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getRequiredEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase client configured with service role auth.
 * Never import this file from client components.
 */
export function getSupabaseServer(): SupabaseClient {
  if (cachedClient) return cachedClient;

  cachedClient = createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );

  return cachedClient;
}

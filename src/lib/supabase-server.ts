import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function sanitizeEnv(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function normalizeSupabaseUrl(value: string): string {
  const sanitized = sanitizeEnv(value);
  if (!sanitized) return "";
  const dashboardMatch = sanitized.match(
    /^(?:https?:\/\/)?supabase\.com\/dashboard\/project\/([a-z0-9-]+)/i,
  );
  if (dashboardMatch?.[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  const withProtocol = /^https?:\/\//i.test(sanitized) ? sanitized : `https://${sanitized}`;
  return withProtocol.replace(/\/+$/, "");
}

function getSupabaseUrl(): string {
  const rawValue = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const value = normalizeSupabaseUrl(rawValue);
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or legacy SUPABASE_URL is not configured.");
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Supabase URL must use http or https.");
    }
    if (parsed.hostname === "supabase.com") {
      throw new Error(
        "Supabase URL must be your project API URL (https://<project-ref>.supabase.co), not a dashboard URL.",
      );
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or legacy SUPABASE_URL must be a valid HTTP or HTTPS URL.");
  }
  return value;
}

function getSupabaseServerKey(): string {
  const value = sanitizeEnv(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  if (!value) {
    throw new Error("SUPABASE_SECRET_KEY or legacy SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return value;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase client configured with Supabase secret key auth.
 * Never import this file from client components.
 */
export function getSupabaseServer(): SupabaseClient {
  if (cachedClient) return cachedClient;

  cachedClient = createClient(
    getSupabaseUrl(),
    getSupabaseServerKey(),
    {
      auth: { persistSession: false },
    },
  );

  return cachedClient;
}

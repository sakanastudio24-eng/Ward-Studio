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

function getRequiredEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const rawValue = process.env[name] || "";
  const value = name === "SUPABASE_URL" ? normalizeSupabaseUrl(rawValue) : sanitizeEnv(rawValue);
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  if (name === "SUPABASE_URL") {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error(`${name} must use http or https.`);
      }
      if (parsed.hostname === "supabase.com") {
        throw new Error(
          `${name} must be your project API URL (https://<project-ref>.supabase.co), not a dashboard URL.`,
        );
      }
    } catch {
      throw new Error(`${name} must be a valid HTTP or HTTPS URL.`);
    }
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

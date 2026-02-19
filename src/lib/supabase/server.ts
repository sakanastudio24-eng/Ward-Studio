const ANALYTICS_TABLE = "analytics_events";

function getRequiredEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getSupabaseServerClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL").replace(/\/$/, "");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    async insertAnalyticsEvent(row: Record<string, unknown>) {
      const response = await fetch(`${supabaseUrl}/rest/v1/${ANALYTICS_TABLE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(row),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || response.statusText || "Supabase insert failed.");
      }
    },
  };
}

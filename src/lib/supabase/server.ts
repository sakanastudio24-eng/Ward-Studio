const ANALYTICS_TABLE = "analytics_events";
const ORDERS_TABLE = "orders";
const ONBOARDING_TABLE = "onboarding_submissions";
const EVENTS_TABLE = "events_general";

/**
 * Reads required runtime environment values for server-to-supabase requests.
 */
function getRequiredEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

/**
 * Creates a minimal REST client around Supabase's PostgREST endpoints.
 * All helpers below use service-role auth and are safe for server-only routes.
 */
export function getSupabaseServerClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL").replace(/\/$/, "");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  /**
   * Shared request primitive with consistent auth headers and error handling.
   */
  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || response.statusText || "Supabase request failed.");
    }

    if (response.status === 204) return null as T;
    return (await response.json()) as T;
  }

  return {
    /**
     * Persists front-end analytics events in the analytics table.
     */
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

    /**
     * Creates a new order row and returns the inserted record.
     */
    async insertOrder(row: Record<string, unknown>) {
      return request<Record<string, unknown>[]>(
        `${ORDERS_TABLE}?select=*`,
        {
          method: "POST",
          headers: {
            Prefer: "return=representation",
          },
          body: JSON.stringify(row),
        },
      );
    },

    /**
     * Finds a single order by the internal order id.
     */
    async findOrderByOrderId(orderId: string) {
      const data = await request<Record<string, unknown>[]>(
        `${ORDERS_TABLE}?order_id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`,
        { method: "GET" },
      );
      return data[0] || null;
    },

    /**
     * Finds a single order by checkout session id.
     */
    async findOrderBySessionId(sessionId: string) {
      const data = await request<Record<string, unknown>[]>(
        `${ORDERS_TABLE}?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`,
        { method: "GET" },
      );
      return data[0] || null;
    },

    /**
     * Applies partial updates to an order using internal order id lookup.
     */
    async updateOrderByOrderId(orderId: string, patch: Record<string, unknown>) {
      return request<Record<string, unknown>[]>(
        `${ORDERS_TABLE}?order_id=eq.${encodeURIComponent(orderId)}&select=*`,
        {
          method: "PATCH",
          headers: {
            Prefer: "return=representation",
          },
          body: JSON.stringify(patch),
        },
      );
    },

    /**
     * Applies partial updates to an order using checkout session id lookup.
     */
    async updateOrderBySessionId(sessionId: string, patch: Record<string, unknown>) {
      return request<Record<string, unknown>[]>(
        `${ORDERS_TABLE}?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=*`,
        {
          method: "PATCH",
          headers: {
            Prefer: "return=representation",
          },
          body: JSON.stringify(patch),
        },
      );
    },

    /**
     * Stores post-purchase onboarding submissions.
     */
    async insertOnboardingSubmission(row: Record<string, unknown>) {
      return request<Record<string, unknown>[]>(
        `${ONBOARDING_TABLE}?select=*`,
        {
          method: "POST",
          headers: {
            Prefer: "return=representation",
          },
          body: JSON.stringify(row),
        },
      );
    },

    /**
     * Persists general backend events for auditing and debugging.
     */
    async insertGeneralEvent(row: Record<string, unknown>) {
      return request<Record<string, unknown>[]>(
        `${EVENTS_TABLE}?select=*`,
        {
          method: "POST",
          headers: {
            Prefer: "return=representation",
          },
          body: JSON.stringify(row),
        },
      );
    },
  };
}

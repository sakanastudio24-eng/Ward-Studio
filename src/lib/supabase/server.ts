import "server-only";
import { getSupabaseServer } from "../supabase-server";

const ANALYTICS_TABLE = "analytics_events";
const ORDERS_TABLE = "orders";
const ONBOARDING_TABLE = "onboarding_submissions";
const EVENTS_TABLE = "events_general";

function fail(message: string, details?: unknown): never {
  if (details instanceof Error) {
    throw new Error(`${message}: ${details.message}`);
  }
  throw new Error(message);
}

/**
 * Shared server helper for Supabase table operations.
 * Uses the service-role `supabaseServer` client.
 */
export function getSupabaseServerClient() {
  const supabaseServer = getSupabaseServer();

  return {
    /**
     * Persists front-end analytics events in the analytics table.
     */
    async insertAnalyticsEvent(row: Record<string, unknown>) {
      const { error } = await supabaseServer.from(ANALYTICS_TABLE).insert(row);
      if (error) fail("Supabase insert analytics failed", error);
    },

    /**
     * Creates a new order row and returns inserted records.
     */
    async insertOrder(row: Record<string, unknown>) {
      const { data, error } = await supabaseServer.from(ORDERS_TABLE).insert(row).select("*");
      if (error) fail("Supabase insert order failed", error);
      return data ?? [];
    },

    /**
     * Finds a single order by the internal order id.
     */
    async findOrderByOrderId(orderId: string) {
      const { data, error } = await supabaseServer
        .from(ORDERS_TABLE)
        .select("*")
        .eq("order_id", orderId)
        .limit(1);
      if (error) fail("Supabase find order by order_id failed", error);
      return data?.[0] ?? null;
    },

    /**
     * Finds a single order by the internal UUID primary key.
     */
    async findOrderByUuid(orderUuid: string) {
      const { data, error } = await supabaseServer
        .from(ORDERS_TABLE)
        .select("*")
        .eq("id", orderUuid)
        .limit(1);
      if (error) fail("Supabase find order by id failed", error);
      return data?.[0] ?? null;
    },

    /**
     * Finds a single order by stripe session id.
     */
    async findOrderBySessionId(sessionId: string) {
      const { data, error } = await supabaseServer
        .from(ORDERS_TABLE)
        .select("*")
        .eq("stripe_session_id", sessionId)
        .limit(1);
      if (error) fail("Supabase find order by stripe_session_id failed", error);
      return data?.[0] ?? null;
    },

    /**
     * Applies partial updates to an order using internal order id lookup.
     */
    async updateOrderByOrderId(orderId: string, patch: Record<string, unknown>) {
      const { data, error } = await supabaseServer
        .from(ORDERS_TABLE)
        .update(patch)
        .eq("order_id", orderId)
        .select("*");
      if (error) fail("Supabase update order by order_id failed", error);
      return data ?? [];
    },

    /**
     * Applies partial updates to an order using UUID primary key lookup.
     */
    async updateOrderByUuid(orderUuid: string, patch: Record<string, unknown>) {
      const { data, error } = await supabaseServer
        .from(ORDERS_TABLE)
        .update(patch)
        .eq("id", orderUuid)
        .select("*");
      if (error) fail("Supabase update order by id failed", error);
      return data ?? [];
    },

    /**
     * Applies partial updates to an order using stripe session id lookup.
     */
    async updateOrderBySessionId(sessionId: string, patch: Record<string, unknown>) {
      const { data, error } = await supabaseServer
        .from(ORDERS_TABLE)
        .update(patch)
        .eq("stripe_session_id", sessionId)
        .select("*");
      if (error) fail("Supabase update order by stripe_session_id failed", error);
      return data ?? [];
    },

    /**
     * Stores post-purchase onboarding submissions.
     */
    async insertOnboardingSubmission(row: Record<string, unknown>) {
      const { data, error } = await supabaseServer.from(ONBOARDING_TABLE).insert(row).select("*");
      if (error) fail("Supabase insert onboarding submission failed", error);
      return data ?? [];
    },

    /**
     * Persists general backend events for auditing and debugging.
     */
    async insertGeneralEvent(row: Record<string, unknown>) {
      const { data, error } = await supabaseServer.from(EVENTS_TABLE).insert(row).select("*");
      if (error) fail("Supabase insert general event failed", error);
      return data ?? [];
    },
  };
}

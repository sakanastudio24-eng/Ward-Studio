import { NextResponse } from "next/server";
import { getStripeDiagnostics } from "../../../../lib/stripe/diagnostics";

/**
 * Non-secret diagnostics endpoint for Stripe key/status checks.
 * Helps identify missing/placeholder/invalid key states quickly.
 */
export async function GET() {
  return NextResponse.json(getStripeDiagnostics());
}


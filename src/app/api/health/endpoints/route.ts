import { handleApiHealthRequest } from "../../../../lib/health/api-health";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiHealthRequest(request);
}

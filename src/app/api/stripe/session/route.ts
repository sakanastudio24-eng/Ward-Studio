import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") || "";

  if (!sessionId) {
    return NextResponse.json(
      {
        paid: false,
        error: "Missing session_id",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    paid: true,
    sessionId,
    verifiedAt: new Date().toISOString(),
  });
}

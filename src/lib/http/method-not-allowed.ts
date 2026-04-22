import { NextResponse } from "next/server";

export function methodNotAllowedResponse(methods: string[] = ["POST"]) {
  const allow = methods.join(", ");

  return NextResponse.json(
    {
      error: `Method not allowed. Use ${allow}.`,
    },
    {
      status: 405,
      headers: {
        Allow: allow,
      },
    },
  );
}

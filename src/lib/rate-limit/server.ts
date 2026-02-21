import "server-only";
import { NextResponse } from "next/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, RateLimitBucket>();

function cleanupExpired(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim();
  if (first) return first;
  const realIp = request.headers.get("x-real-ip") || "";
  return realIp.trim() || "unknown";
}

/**
 * Applies a basic in-memory rate limit keyed by route prefix + requester IP.
 */
export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
): { limited: boolean; retryAfterSeconds: number; key: string } {
  const now = Date.now();
  cleanupExpired(now);

  const ip = getIpFromRequest(request);
  const key = `${options.keyPrefix}:${ip}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      limited: false,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      key,
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > options.limit) {
    return {
      limited: true,
      retryAfterSeconds,
      key,
    };
  }

  return {
    limited: false,
    retryAfterSeconds,
    key,
  };
}

/**
 * Standard 429 response payload with retry guidance.
 */
export function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: "Rate limit exceeded. Please retry shortly.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

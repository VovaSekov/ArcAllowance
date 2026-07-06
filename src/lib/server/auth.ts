import "server-only";

import { RateLimitError, assertRateLimit, getClientIp } from "@/lib/server/rate-limit";

type WriteAccessOptions = {
  action: string;
  limit?: number;
  windowMs?: number;
  requireToken?: boolean;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Admin token is required for this write action.");
  }
}

function configuredAdminToken(): string {
  return process.env.ARC_ADMIN_TOKEN?.trim() ?? "";
}

export function assertWriteAccess(
  request: Request,
  { action, limit = 30, windowMs = 60_000, requireToken = false }: WriteAccessOptions
): void {
  const ip = getClientIp(request);
  assertRateLimit({ key: `${action}:${ip}`, limit, windowMs });

  const token = configuredAdminToken();
  if (requireToken && !token) {
    throw new UnauthorizedError();
  }
  if (!token) {
    return;
  }

  const supplied = request.headers.get("x-arc-admin-token")?.trim() ?? "";
  if (supplied !== token) {
    throw new UnauthorizedError();
  }
}

export function responseStatusForError(error: unknown): number {
  if (error instanceof UnauthorizedError) {
    return 401;
  }
  if (error instanceof RateLimitError) {
    return 429;
  }
  return 400;
}

export function responseHeadersForError(error: unknown): HeadersInit | undefined {
  if (error instanceof RateLimitError) {
    return { "Retry-After": String(error.retryAfterSeconds) };
  }
  return undefined;
}

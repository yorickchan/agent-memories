import crypto from "node:crypto";

/**
 * JSON-RPC error code returned for any unauthenticated request (D-23).
 * Lives outside the JSON-RPC spec's reserved range (-32700..-32000) so it
 * cannot collide with spec-defined codes.
 */
export const AUTH_ERROR_CODE = -32001 as const;

/**
 * Thrown by request handlers when the bearer token check fails. The MCP
 * SDK's request-dispatch path reads `error.code` (a safe integer) and
 * `error.message` and emits the matching JSON-RPC error response, so a
 * thrown `UnauthorizedError` becomes a `{"error":{"code":-32001,...}}`
 * frame on the wire.
 */
export class UnauthorizedError extends Error {
  readonly code = AUTH_ERROR_CODE;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const BEARER_RE = /^Bearer\s+(\S+)$/i;

/**
 * Validate an `Authorization: Bearer <token>` value against the configured
 * expected token using a constant-time comparison (D-22).
 *
 * Contract:
 *   1. Falsy / missing header         → false.
 *   2. Header does not match `Bearer <token>` (case-insensitive scheme) → false.
 *   3. Length mismatch between the candidate and expected token buffers
 *      → run a fixed-time discard of the comparison result (so the failure
 *        path still spends the same time as a successful compare), then
 *        return false. NEVER leak the length via an early short-circuit
 *        that skips the timingSafeEqual call.
 *   4. Equal lengths → `crypto.timingSafeEqual(a, b)`.
 *
 * @param headerValue  Raw `Authorization` header value (or undefined).
 * @param expectedToken  The server's `auth_token` (already validated ≥ 32 chars at boot).
 */
export function verifyBearer(
  headerValue: string | undefined,
  expectedToken: string,
): boolean {
  if (!headerValue) return false;
  const match = BEARER_RE.exec(headerValue);
  if (match === null) return false;
  const candidate = match[1] ?? "";
  const a = Buffer.from(candidate);
  const b = Buffer.from(expectedToken);
  if (a.length !== b.length) {
    // Fixed-time discard: spend the same time as a real compare, return false.
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}
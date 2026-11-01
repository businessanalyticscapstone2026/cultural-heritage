import {
  PORTAL_ALLOWED_HEADERS,
  PORTAL_ALLOWED_ORIGINS_ENV,
  PORTAL_EXPOSED_HEADERS,
  PORTAL_PREFLIGHT_MAX_AGE_SECONDS,
} from "../constants"

/**
 * CORS for the Taal portal API. Explicit allowlist, exact origin match, no
 * wildcard, no credentials (the API is cookie-free; POST uses a Bearer token).
 */

/**
 * Parse a comma-separated allowlist. Entries must be bare origins
 * ("https://portal.example.gov.ph"); wildcards, paths and malformed values are
 * dropped so a misconfiguration can only make CORS stricter.
 */
export function parseAllowedOrigins(raw: string | undefined): ReadonlySet<string> {
  const origins = new Set<string>()
  for (const entry of (raw ?? "").split(",")) {
    const candidate = entry.trim()
    if (!candidate || candidate.includes("*")) continue
    try {
      const url = new URL(candidate)
      if ((url.protocol === "https:" || url.protocol === "http:") && url.origin === candidate) {
        origins.add(candidate)
      }
    } catch {
      // not a URL: ignored on purpose (see doc comment)
    }
  }
  return origins
}

export function getAllowedOrigins(): ReadonlySet<string> {
  return parseAllowedOrigins(process.env[PORTAL_ALLOWED_ORIGINS_ENV])
}

export type OriginCheck =
  /** No Origin header: not a browser cross-origin request (server-to-server, curl). */
  | { kind: "none" }
  | { kind: "allowed"; origin: string }
  | { kind: "denied"; origin: string }

export function checkOrigin(origin: string | null, allowed: ReadonlySet<string>): OriginCheck {
  if (origin == null || origin === "") return { kind: "none" }
  return allowed.has(origin) ? { kind: "allowed", origin } : { kind: "denied", origin }
}

/**
 * Headers for an actual (non-preflight) response. Vary: Origin is always set
 * so a shared CDN never serves one origin's CORS headers to another.
 */
export function corsHeaders(check: OriginCheck): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" }
  if (check.kind === "allowed") {
    headers["Access-Control-Allow-Origin"] = check.origin
    headers["Access-Control-Expose-Headers"] = PORTAL_EXPOSED_HEADERS.join(", ")
  }
  return headers
}

/** Headers for a successful preflight from an allowed origin. */
export function preflightHeaders(
  check: Extract<OriginCheck, { kind: "allowed" }>,
  methods: readonly string[]
): Record<string, string> {
  return {
    ...corsHeaders(check),
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": PORTAL_ALLOWED_HEADERS.join(", "),
    "Access-Control-Max-Age": String(PORTAL_PREFLIGHT_MAX_AGE_SECONDS),
  }
}

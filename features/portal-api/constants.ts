/**
 * CHT-136 Taal municipal portal API. Defaults chosen for this ticket; see
 * docs/integrations/taal-portal.md before changing any of them.
 */

/** Municipality served by /api/v1/taal/*. Resolved to an id at runtime by name. */
export const PORTAL_MUNICIPALITY_NAME = "Taal"

export const PORTAL_PAGE_SIZE_DEFAULT = 20
/** Hard cap: larger page_size values are clamped, never honoured. */
export const PORTAL_PAGE_SIZE_MAX = 50
/** Highest page number accepted, so offsets stay bounded. */
export const PORTAL_PAGE_MAX = 10_000

/** Maximum POST body. A full review (1000-char comment, 6 media refs) is ~3 KB. */
export const PORTAL_MAX_BODY_BYTES = 32 * 1024

/** CDN cache for public GET responses. */
export const PORTAL_CDN_MAX_AGE_SECONDS = 60
export const PORTAL_CDN_STALE_SECONDS = 300

/** Retry-After sent with 503 responses. */
export const PORTAL_RETRY_AFTER_SECONDS = 30
export const PORTAL_MAINTENANCE_RETRY_AFTER_SECONDS = 300

/** Browsers may cache a successful preflight for this long. */
export const PORTAL_PREFLIGHT_MAX_AGE_SECONDS = 600

/** Env var holding the comma-separated CORS origin allowlist (exact match). */
export const PORTAL_ALLOWED_ORIGINS_ENV = "TAAL_PORTAL_ALLOWED_ORIGINS"

export const PORTAL_ALLOWED_HEADERS = ["Authorization", "Content-Type"] as const
export const PORTAL_EXPOSED_HEADERS = ["ETag", "Retry-After"] as const

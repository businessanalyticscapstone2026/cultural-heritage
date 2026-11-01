import {
  PORTAL_CDN_MAX_AGE_SECONDS,
  PORTAL_CDN_STALE_SECONDS,
} from "../constants"
import { PortalApiError } from "./portal-errors"

/**
 * Response/request plumbing for the portal API: envelopes compatible with
 * lib/api-client.ts ({ data, meta } / { error, code }), ETag + 304, CDN cache
 * headers, and a size-bounded JSON body reader.
 */

export const PUBLIC_CACHE_CONTROL = `public, max-age=0, s-maxage=${PORTAL_CDN_MAX_AGE_SECONDS}, stale-while-revalidate=${PORTAL_CDN_STALE_SECONDS}`
export const NO_STORE = "no-store"

type HeaderMap = Record<string, string>

export function jsonResponse(status: number, body: unknown, headers: HeaderMap = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  })
}

export function errorResponse(err: PortalApiError, headers: HeaderMap = {}): Response {
  const extra: HeaderMap = { "Cache-Control": NO_STORE, ...headers }
  if (err.retryAfterSeconds != null) extra["Retry-After"] = String(err.retryAfterSeconds)
  return jsonResponse(err.status, err.toBody(), extra)
}

export async function computeEtag(payload: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload))
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
  return `"${hex.slice(0, 32)}"`
}

/** RFC 9110 weak comparison for If-None-Match (handles lists, W/ and "*"). */
export function etagMatches(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false
  const strip = (tag: string) => tag.trim().replace(/^W\//, "")
  return ifNoneMatch
    .split(",")
    .map((t) => t.trim())
    .some((t) => t === "*" || strip(t) === strip(etag))
}

/**
 * 200 with ETag + CDN cache headers, or 304 when the client already has this
 * exact payload. Only for public, non-user-specific data.
 */
export async function cacheableJsonResponse(
  request: Request,
  body: unknown,
  headers: HeaderMap = {}
): Promise<Response> {
  const payload = JSON.stringify(body)
  const etag = await computeEtag(payload)
  const cacheHeaders: HeaderMap = { ...headers, ETag: etag, "Cache-Control": PUBLIC_CACHE_CONTROL }

  if (etagMatches(request.headers.get("if-none-match"), etag)) {
    return new Response(null, { status: 304, headers: cacheHeaders })
  }
  return new Response(payload, {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cacheHeaders },
  })
}

function payloadTooLarge(maxBytes: number): PortalApiError {
  return new PortalApiError(
    413,
    "payload_too_large",
    `Request body must be ${maxBytes} bytes or less.`
  )
}

/** Read the body as text, aborting as soon as it exceeds `maxBytes`. */
export async function readBodyText(request: Request, maxBytes: number): Promise<string> {
  const declared = Number(request.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > maxBytes) throw payloadTooLarge(maxBytes)
  if (!request.body) return ""

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maxBytes) {
      await reader.cancel()
      throw payloadTooLarge(maxBytes)
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

/** application/json body, size-bounded, parsed. Schema validation is the caller's job. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? ""
  if (!/^application\/json\b/i.test(contentType.trim())) {
    throw new PortalApiError(415, "unsupported_media_type", "Content-Type must be application/json.")
  }

  const text = await readBodyText(request, maxBytes)
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new PortalApiError(400, "invalid_json", "Request body is not valid JSON.")
  }
}

import type { z } from "zod"
import { PORTAL_MAX_BODY_BYTES } from "../constants"
import {
  heritageSitesQuerySchema,
  reviewsQuerySchema,
  searchParamsToObject,
} from "../schemas/portal-query"
import type { PortalListResponse, PortalPageMeta } from "../types"
import { authenticatePortalRequest } from "./auth"
import { checkOrigin, corsHeaders, getAllowedOrigins, preflightHeaders, type OriginCheck } from "./cors"
import { cacheableJsonResponse, errorResponse, jsonResponse, NO_STORE, readJsonBody } from "./http"
import { assertWritesAllowed } from "./maintenance"
import { PortalApiError, toPortalApiError } from "./portal-errors"
import { submitPortalReview } from "./review-submit"
import { getTaalHeritageSitesPage, getTaalReviewsPage, type PortalPage } from "./taal-data"

/**
 * Request handling for /api/v1/taal/*. The route files in app/api only
 * delegate here, so all behaviour (CORS, auth, validation, caching, errors)
 * lives in this feature module and is unit-testable.
 */

export const HERITAGE_SITES_METHODS = ["GET", "OPTIONS"] as const
export const REVIEWS_METHODS = ["GET", "POST", "OPTIONS"] as const

function logPortalError(err: PortalApiError, original: unknown): void {
  if (err.status >= 500) {
    console.error(`[portal-api] ${err.status} ${err.code}:`, err.detail ?? original)
  }
}

async function withErrorHandling(
  cors: Record<string, string>,
  run: () => Promise<Response>
): Promise<Response> {
  try {
    return await run()
  } catch (original) {
    const err = toPortalApiError(original)
    logPortalError(err, original)
    return errorResponse(err, cors)
  }
}

function originDenied(check: OriginCheck): Response {
  return errorResponse(
    new PortalApiError(403, "origin_not_allowed", "This origin is not allowed to call the API."),
    corsHeaders(check)
  )
}

export function parseQuery<T>(schema: z.ZodType<T>, url: URL): T {
  const parsed = schema.safeParse(searchParamsToObject(url.searchParams))
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ") || "Invalid query parameters."
    throw new PortalApiError(400, "bad_request", message)
  }
  return parsed.data
}

export function buildPageMeta(
  query: { page: number; page_size: number; updated_since?: string },
  total: number
): PortalPageMeta {
  const totalPages = Math.ceil(total / query.page_size)
  return {
    page: query.page,
    pageSize: query.page_size,
    total,
    totalPages,
    hasMore: query.page < totalPages,
    updatedSince: query.updated_since ?? null,
  }
}

function listBody<T>(page: PortalPage<T>, meta: PortalPageMeta): PortalListResponse<T> {
  return { data: page.items, meta }
}

/** OPTIONS: CORS preflight. Without an Origin header it is a plain OPTIONS. */
export function handlePreflight(request: Request, methods: readonly string[]): Response {
  const check = checkOrigin(request.headers.get("origin"), getAllowedOrigins())
  if (check.kind === "denied") return originDenied(check)
  if (check.kind === "none") {
    return new Response(null, { status: 204, headers: { Allow: methods.join(", "), Vary: "Origin" } })
  }
  return new Response(null, { status: 204, headers: preflightHeaders(check, methods) })
}

/**
 * GETs serve public data: a disallowed origin still gets the response (the
 * same data is on the public site), only without CORS headers, so browsers
 * on that origin cannot read it.
 */
export async function handleHeritageSitesGet(request: Request): Promise<Response> {
  const cors = corsHeaders(checkOrigin(request.headers.get("origin"), getAllowedOrigins()))
  return withErrorHandling(cors, async () => {
    const query = parseQuery(heritageSitesQuerySchema, new URL(request.url))
    const page = await getTaalHeritageSitesPage(query)
    return cacheableJsonResponse(request, listBody(page, buildPageMeta(query, page.total)), cors)
  })
}

export async function handleReviewsGet(request: Request): Promise<Response> {
  const cors = corsHeaders(checkOrigin(request.headers.get("origin"), getAllowedOrigins()))
  return withErrorHandling(cors, async () => {
    const query = parseQuery(reviewsQuerySchema, new URL(request.url))
    const page = await getTaalReviewsPage(query)
    return cacheableJsonResponse(request, listBody(page, buildPageMeta(query, page.total)), cors)
  })
}

/**
 * POST: create (201) or update (200) the caller's review. Order: origin,
 * auth, maintenance, body. A browser request from a non-allowlisted origin is
 * refused outright.
 */
export async function handleReviewsPost(request: Request): Promise<Response> {
  const check = checkOrigin(request.headers.get("origin"), getAllowedOrigins())
  if (check.kind === "denied") return originDenied(check)
  const cors = corsHeaders(check)

  return withErrorHandling(cors, async () => {
    const auth = await authenticatePortalRequest(request.headers.get("authorization"))
    await assertWritesAllowed(auth.supabase)
    const body = await readJsonBody(request, PORTAL_MAX_BODY_BYTES)
    const result = await submitPortalReview(auth, body)
    return jsonResponse(result.created ? 201 : 200, { data: result.review }, {
      ...cors,
      "Cache-Control": NO_STORE,
    })
  })
}

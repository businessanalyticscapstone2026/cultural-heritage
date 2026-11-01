import { z } from "zod"
import {
  PORTAL_PAGE_MAX,
  PORTAL_PAGE_SIZE_DEFAULT,
  PORTAL_PAGE_SIZE_MAX,
} from "../constants"

/**
 * Query-string validation for the Taal portal GET endpoints. Unknown
 * parameters are rejected so a typo (e.g. "siteid") fails loudly instead of
 * silently returning unfiltered data.
 */

const pageSchema = z.coerce
  .number({ error: "page must be a number" })
  .int("page must be a whole number")
  .min(1, "page starts at 1")
  .max(PORTAL_PAGE_MAX, `page must be ${PORTAL_PAGE_MAX} or less`)
  .default(1)

/** Values above the hard cap are clamped rather than rejected. */
const pageSizeSchema = z.coerce
  .number({ error: "page_size must be a number" })
  .int("page_size must be a whole number")
  .min(1, "page_size must be at least 1")
  .default(PORTAL_PAGE_SIZE_DEFAULT)
  .transform((size) => Math.min(size, PORTAL_PAGE_SIZE_MAX))

/** ISO 8601 timestamp with a timezone (Z or ±hh:mm), normalised to UTC. */
const updatedSinceSchema = z.iso
  .datetime({ offset: true, error: "updated_since must be an ISO 8601 timestamp with timezone" })
  .transform((value) => new Date(value).toISOString())
  .optional()

const sortSchema = z
  .enum(["updated_desc", "updated_asc"], { error: "sort must be updated_desc or updated_asc" })
  .default("updated_desc")

export const heritageSitesQuerySchema = z.strictObject({
  page: pageSchema,
  page_size: pageSizeSchema,
  updated_since: updatedSinceSchema,
  sort: sortSchema,
})

export const reviewsQuerySchema = z.strictObject({
  page: pageSchema,
  page_size: pageSizeSchema,
  updated_since: updatedSinceSchema,
  sort: sortSchema,
  site_id: z.uuid("site_id must be a UUID").optional(),
})

export type HeritageSitesQuery = z.infer<typeof heritageSitesQuerySchema>
export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>

/** First value of each query parameter as a plain object, ready for Zod. */
export function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of params) {
    if (!(key in out)) out[key] = value
  }
  return out
}

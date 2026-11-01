import { revalidateTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache-tags"

/**
 * Invalidate every cache derived from reviews. Call after ANY review write
 * (create, update, delete, report/flag) on either platform: the main site's
 * Server Actions and the Taal portal API both go through here, so the two
 * stay in sync.
 *
 * - review-insights: DSS dashboards tolerate stale-while-revalidate ("max").
 * - portal tags expire immediately so the portal's next GET (after the CDN
 *   s-maxage window) reflects the write. Review writes also change
 *   heritage_sites.average_rating / review_count, hence the sites tag.
 */
export function revalidateReviewCaches(): void {
  revalidateTag(CACHE_TAGS.reviewInsights, "max")
  revalidateTag(CACHE_TAGS.portalReviews, { expire: 0 })
  revalidateTag(CACHE_TAGS.portalHeritageSites, { expire: 0 })
}

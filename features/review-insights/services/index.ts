import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import { createTokenClient, resolveAccessToken } from "@/utils/supabase/cached"
import { REVIEW_INSIGHTS_CONFIG } from "../config"
import { buildReviewInsights } from "../utils/build-insights"
import type { MunicipalityReviewInsights, ReviewSignal, SiteReviewInput } from "../types"

/**
 * Server-side aggregation for review insights (derive-on-read, cached).
 * Reads only published reviews and never selects reviewer identity columns.
 */

interface InsightReviewRow {
  site_id: string
  rating: number
  comment: string | null
  created_at: string
  criteria: { criterion_key: string; score: number }[] | null
  tags: { tag_key: string }[] | null
  media: { id: string }[] | null
}

const INSIGHT_REVIEW_COLUMNS = `
  site_id, rating, comment, created_at,
  criteria:review_criteria_ratings(criterion_key, score),
  tags:review_tags(tag_key),
  media:review_media(id)
`

function toSignal(row: InsightReviewRow): ReviewSignal {
  return {
    rating: row.rating,
    criteria: Object.fromEntries((row.criteria ?? []).map((c) => [c.criterion_key, Number(c.score)])),
    tagKeys: (row.tags ?? []).map((t) => t.tag_key),
    hasMedia: (row.media ?? []).length > 0,
    commentLength: row.comment?.trim().length ?? 0,
    createdAt: row.created_at,
  }
}

/** PostgREST caps responses (default 1000 rows), so page through the window. */
const PAGE_SIZE = 1000

/**
 * All published reviews in the window (every municipality): the global
 * population is the Bayesian prior; the municipality's subset is scored.
 */
async function fetchPublishedReviewsSince(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<InsightReviewRow[]> {
  const rows: InsightReviewRow[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("reviews")
      .select(INSIGHT_REVIEW_COLUMNS)
      .eq("status", "published")
      .gte("created_at", sinceIso)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw new Error(`Review insights: failed to load reviews: ${error.message}`)
    const page = (data ?? []) as unknown as InsightReviewRow[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) return rows
  }
}

async function fetchMunicipalityReviewInsights(
  supabase: SupabaseClient,
  municipalityId: string,
  now: Date
): Promise<MunicipalityReviewInsights> {
  const since = new Date(
    now.getTime() - REVIEW_INSIGHTS_CONFIG.satisfactionWindowDays * 24 * 60 * 60 * 1000
  ).toISOString()

  const [sitesRes, rows] = await Promise.all([
    supabase
      .from("heritage_sites")
      .select("id, site_name, municipality_id")
      .eq("municipality_id", municipalityId)
      .eq("publication_status", "published"),
    fetchPublishedReviewsSince(supabase, since),
  ])

  if (sitesRes.error) throw new Error(`Review insights: failed to load sites: ${sitesRes.error.message}`)

  const bySite = new Map<string, ReviewSignal[]>()
  const all: ReviewSignal[] = []
  for (const row of rows) {
    const signal = toSignal(row)
    all.push(signal)
    const list = bySite.get(row.site_id)
    if (list) list.push(signal)
    else bySite.set(row.site_id, [signal])
  }

  const sites: SiteReviewInput[] = (sitesRes.data ?? []).map((s) => ({
    siteId: s.id as string,
    siteName: s.site_name as string,
    municipalityId: (s.municipality_id as string | null) ?? null,
    reviews: bySite.get(s.id as string) ?? [],
  }))

  return buildReviewInsights(sites, all, now)
}

const getCachedMunicipalityReviewInsights = unstable_cache(
  async (accessToken: string, municipalityId: string): Promise<MunicipalityReviewInsights> =>
    fetchMunicipalityReviewInsights(createTokenClient(accessToken), municipalityId, new Date()),
  ["review-insights-municipality"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.reviewInsights] }
)

/**
 * Review insights (satisfaction, engagement, alerts) for one municipality's
 * published sites. The caller is responsible for authorizing `municipalityId`
 * (see lib/mto-scope.ts).
 */
export async function getMunicipalityReviewInsights(
  municipalityId: string
): Promise<MunicipalityReviewInsights> {
  const accessToken = await resolveAccessToken()
  return getCachedMunicipalityReviewInsights(accessToken, municipalityId)
}

import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createTokenClient } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"

export interface InventoryCoverageRow {
  municipalityId: string
  name: string
  /** Sites encoded in heritage_sites (live). */
  encoded: number
  /** Documented inventory count (municipalities.documented_site_count); null = unknown. */
  documented: number | null
  /** encoded / documented as 0-100, capped at 100; null when documented is unknown or 0. */
  percent: number | null
  /** True when more sites are encoded than documented: the documented count needs review. */
  needsReview: boolean
}

export interface InventoryCoverage {
  rows: InventoryCoverageRow[]
  totalEncoded: number
  totalDocumented: number
  percent: number | null
  needsReview: boolean
}

function coveragePercent(encoded: number, documented: number | null): number | null {
  if (documented == null || documented <= 0) return null
  return Math.min(100, Math.round((encoded / documented) * 1000) / 10)
}

export function computeInventoryCoverage(
  municipalities: { id: string; name: string; documented_site_count: number | null }[],
  siteMunicipalityIds: (string | null)[],
): InventoryCoverage {
  const encodedBy = new Map<string, number>()
  for (const id of siteMunicipalityIds) {
    if (id) encodedBy.set(id, (encodedBy.get(id) ?? 0) + 1)
  }

  const rows = municipalities.map((m) => {
    const encoded = encodedBy.get(m.id) ?? 0
    const documented = m.documented_site_count
    return {
      municipalityId: m.id,
      name: m.name,
      encoded,
      documented,
      percent: coveragePercent(encoded, documented),
      needsReview: documented != null && encoded > documented,
    }
  })

  const totalEncoded = rows.reduce((sum, r) => sum + r.encoded, 0)
  const totalDocumented = rows.reduce((sum, r) => sum + (r.documented ?? 0), 0)

  return {
    rows,
    totalEncoded,
    totalDocumented,
    percent: coveragePercent(totalEncoded, totalDocumented),
    needsReview: rows.some((r) => r.needsReview),
  }
}

async function fetchInventoryCoverage(client: SupabaseClient): Promise<InventoryCoverage> {
  const [munRes, sitesRes] = await Promise.all([
    client
      .from("municipalities")
      .select("id, name, documented_site_count")
      .eq("status", "active")
      .order("name", { ascending: true }),
    client.from("heritage_sites").select("municipality_id"),
  ])

  if (munRes.error) throw new Error(`Failed to fetch municipalities: ${munRes.error.message}`)
  if (sitesRes.error) throw new Error(`Failed to fetch heritage_sites: ${sitesRes.error.message}`)

  return computeInventoryCoverage(
    munRes.data ?? [],
    (sitesRes.data ?? []).map((s) => s.municipality_id as string | null),
  )
}

const getCachedInventoryCoverage = unstable_cache(
  async (accessToken: string) => fetchInventoryCoverage(createTokenClient(accessToken)),
  ["inventory-coverage"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.heritageSites, CACHE_TAGS.municipalities, CACHE_TAGS.dashboardSites],
  },
)

/**
 * Encoded vs documented heritage sites per municipality.
 * The encoded count follows RLS of the caller: pass the staff access token on
 * dashboards (counts drafts too); "" on public pages (published + public only).
 * Returns null (and logs) when the query fails so pages can show an error state.
 */
export async function getInventoryCoverage(accessToken = ""): Promise<InventoryCoverage | null> {
  try {
    return await getCachedInventoryCoverage(accessToken)
  } catch (error) {
    console.error("[inventory-coverage]", error)
    return null
  }
}

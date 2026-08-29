import { supabase } from "@/lib/supabase";

/**
 * Mirrors features/home/services/home-page.ts (cultural-heritage-master) so
 * both apps agree on what "trending" means. Keep window/threshold/limit in
 * sync with that file if it changes.
 */
const TRENDING_LIMIT = 3;
const TRENDING_WINDOW_DAYS = 30;
const TRENDING_ENGAGEMENT_THRESHOLD = 5;

export type TrendingSite = {
  id: string;
  name: string;
  municipality: string | null;
  category: string | null;
  rating: number | null;
  imageUrl: string | null;
  metricValue: number;
  metricLabel: string;
};

type MediaRow = { file_url: string; is_primary: boolean; media_type: string };

type SiteRow = {
  id: string;
  site_name: string;
  average_rating: number | null;
  review_count: number | null;
  municipality: { name: string } | { name: string }[] | null;
  category: { name: string } | { name: string }[] | null;
  media?: MediaRow[] | null;
};

const SITE_SELECT = `
  id, site_name, average_rating, review_count,
  municipality:municipalities(name),
  category:heritage_categories(name),
  media:heritage_site_media(file_url, is_primary, media_type)
`;

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function pickPrimaryImage(media: MediaRow[] | null | undefined): string | null {
  if (!media?.length) return null;
  const images = media.filter((m) => m.media_type === "image");
  if (images.length === 0) return null;
  return (images.find((m) => m.is_primary) ?? images[0]).file_url;
}

function mapSiteRow(row: SiteRow, metricValue: number, metricLabel: string): TrendingSite {
  return {
    id: row.id,
    name: row.site_name,
    municipality: unwrapOne(row.municipality)?.name ?? null,
    category: unwrapOne(row.category)?.name ?? null,
    rating: row.average_rating,
    imageUrl: pickPrimaryImage(row.media),
    metricValue,
    metricLabel,
  };
}

function countBySiteId(rows: { site_id: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) map.set(row.site_id, (map.get(row.site_id) ?? 0) + 1);
  return map;
}

async function getMostReviewedSites(): Promise<TrendingSite[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("review_count", { ascending: false })
    .order("average_rating", { ascending: false })
    .limit(TRENDING_LIMIT);

  if (error) throw new Error(`Most reviewed: ${error.message}`);

  return (data ?? []).map((row) => {
    const r = row as unknown as SiteRow;
    return mapSiteRow(r, r.review_count ?? 0, "reviews");
  });
}

async function hydrateSitesByIds(
  ranked: { siteId: string; metricValue: number; metricLabel: string }[],
): Promise<TrendingSite[]> {
  if (ranked.length === 0) return [];

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .in("id", ranked.map((r) => r.siteId))
    .eq("publication_status", "published")
    .eq("visibility", "public");

  if (error) throw new Error(`Trending hydrate: ${error.message}`);

  const byId = new Map((data ?? []).map((row) => [(row as unknown as SiteRow).id, row as unknown as SiteRow]));

  const hydrated: TrendingSite[] = [];
  for (const r of ranked) {
    const row = byId.get(r.siteId);
    if (!row) continue;
    hydrated.push(mapSiteRow(row, r.metricValue, r.metricLabel));
  }
  return hydrated;
}

/**
 * Ranks sites by recent tourist_visits + recommendation click-through, falling
 * back to most-reviewed when engagement is too sparse to rank meaningfully.
 */
export async function getTrendingSites(): Promise<TrendingSite[]> {
  const since = new Date();
  since.setDate(since.getDate() - TRENDING_WINDOW_DAYS);
  const sinceIso = since.toISOString();

  const [visitsRes, clicksRes] = await Promise.all([
    supabase.from("tourist_visits").select("site_id").gte("created_at", sinceIso),
    supabase
      .from("recommendations")
      .select("site_id")
      .eq("was_clicked", true)
      .gte("clicked_at", sinceIso),
  ]);

  let clickRows = clicksRes.data ?? [];
  if (clicksRes.error) {
    const fallback = await supabase
      .from("recommendations")
      .select("site_id")
      .eq("was_clicked", true)
      .gte("generated_at", sinceIso);
    clickRows = fallback.data ?? [];
  }

  const visitRows = visitsRes.error ? [] : (visitsRes.data ?? []);
  const visitCounts = countBySiteId(visitRows as { site_id: string }[]);
  const clickCounts = countBySiteId(clickRows as { site_id: string }[]);

  const totalEngagement = visitRows.length + clickRows.length;
  if (totalEngagement < TRENDING_ENGAGEMENT_THRESHOLD) {
    return getMostReviewedSites();
  }

  const combined = new Map<string, number>();
  for (const [id, n] of visitCounts) combined.set(id, (combined.get(id) ?? 0) + n);
  for (const [id, n] of clickCounts) combined.set(id, (combined.get(id) ?? 0) + n);

  const metricLabel =
    visitRows.length > 0 && clickRows.length > 0
      ? "engagement (30d)"
      : visitRows.length > 0
        ? "visits (30d)"
        : "recommendation clicks (30d)";

  const ranked = [...combined.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TRENDING_LIMIT)
    .map(([siteId, metricValue]) => ({ siteId, metricValue, metricLabel }));

  const sites = await hydrateSitesByIds(ranked);
  return sites.length > 0 ? sites : getMostReviewedSites();
}

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getHeritageSiteById, isBookmarked } from "@/features/heritage/services"
import { getNearbySites } from "@/features/heritage/services/nearby"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { DEFAULT_AGE_GROUP } from "@/lib/constants"
import HeritageDetailClient from "@/features/heritage/components/heritage-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ score?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const site = await getHeritageSiteById(id)

  if (!site) return { title: "Site Not Found — Batangas Heritage" }

  return {
    title: `${site.siteName} — Batangas Heritage`,
    description:
      site.shortDescription ??
      `Explore ${site.siteName} in ${site.municipalityName ?? "Batangas"}.`,
    openGraph: {
      title: site.siteName,
      description: site.shortDescription ?? "",
      images: (() => {
        const primary = site.media.find((m) => m.mediaType === "image" && m.isPrimary)
        const first = site.media.find((m) => m.mediaType === "image")
        const img = primary ?? first
        return img?.fileUrl ? [{ url: img.fileUrl }] : []
      })(),
    },
  }
}

export default async function HeritageDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { score } = await searchParams

  const site = await getHeritageSiteById(id)
  if (!site) notFound()

  const matchScore = score ? Number(score) : undefined

  // Record visit in tourist_visits for site analytics
  try {
    const today = new Date().toISOString().slice(0, 10)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    let ageGroup: string = DEFAULT_AGE_GROUP
    if (user) {
      const { data: profile } = await supabase
        .from("tourist_profiles")
        .select("age_group")
        .eq("id", user.id)
        .maybeSingle()
      ageGroup = profile?.age_group ?? DEFAULT_AGE_GROUP
    }

    await supabase.from("tourist_visits").insert({
      site_id: id,
      visit_date: today,
      visitor_origin: "domestic",
      visitor_type: "domestic",
      source: "direct_search",
      tourist_id: user?.id ?? null,
      age_group: ageGroup,
    })
  } catch {
    // Non-blocking
  }

  let bookmarked = false
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      bookmarked = await isBookmarked(user.id, id)
    }
  } catch {
    // Not logged in or error — default to false
  }

  let nearbySites: Awaited<ReturnType<typeof getNearbySites>> = []
  try {
    nearbySites = await getNearbySites(id, 5)
  } catch {
    // site_distances may not have data for this site
  }

  return <HeritageDetailClient site={site} matchScore={matchScore} initialIsBookmarked={bookmarked} nearbySites={nearbySites} />
}

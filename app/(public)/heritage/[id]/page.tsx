import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getHeritageSiteById, isBookmarked } from "@/features/heritage/services"
import { getNearbySites } from "@/features/heritage/services/nearby"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
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

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { getMunicipalityImage } from "@/utils/images"

interface FeaturedMunicipality {
  id: string
  name: string
  imageUrl: string | null
  siteCount: number
}

interface HeritageMapSite {
  id: string
  name: string
  categoryName: string | null
  latitude: number
  longitude: number
}

interface HomeStats {
  heritageSiteCount: number
  municipalityCount: number
  visitorCount: number
  positiveReviewPercent: number
}

interface TopSite {
  id: string
  siteName: string
  categoryName: string | null
  yearEstablished: string | null
  imageUrl: string | null
  municipalityName: string | null
}

export async function getHeroFeaturedSite() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      short_description,
      municipality:municipalities(name)
    `)
    .eq("is_featured", true)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const munArr = data.municipality as { name: string }[] | null
  const mun = Array.isArray(munArr) ? munArr[0] : munArr
  const heroImage = mun?.name ? await getMunicipalityImage(mun.name) : null

  return {
    id: data.id as string,
    siteName: data.site_name as string,
    shortDescription: (data.short_description ?? null) as string | null,
    heroImage,
  }
}

export async function getFeaturedMunicipalities(): Promise<FeaturedMunicipality[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .select(`
      id,
      name,
      heritage_sites!inner(
        id
      )
    `)
    .eq("status", "active")
    .eq("heritage_sites.publication_status", "published")
    .eq("heritage_sites.visibility", "public")
    .order("name", { ascending: true })

  if (error) throw error

  const mapped = (data ?? []).map((row) => {
    const sites = Array.isArray(row.heritage_sites)
      ? row.heritage_sites
      : [row.heritage_sites].filter(Boolean)

    return {
      id: row.id as string,
      name: row.name as string,
      imageUrl: null as string | null,
      siteCount: sites.length,
    }
  })

  const withImages = await Promise.all(
    mapped.map(async (m) => ({
      ...m,
      imageUrl: await getMunicipalityImage(m.name),
    }))
  )

  return withImages
    .sort((a, b) => b.siteCount - a.siteCount)
    .slice(0, 3)
}

export async function getMapCategories() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("id, name, icon, color")
    .eq("status", "active")
    .order("display_order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    icon: (row.icon ?? null) as string | null,
    color: (row.color ?? null) as string | null,
  }))
}

export async function getMapSites(): Promise<HeritageMapSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      latitude,
      longitude,
      category:heritage_categories(name)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(50)

  if (error) throw error

  return (data ?? []).map((row) => {
    const catArr = row.category as { name: string }[] | null
    const cat = Array.isArray(catArr) ? catArr[0] : catArr
    return {
      id: row.id as string,
      name: row.site_name as string,
      categoryName: cat?.name ?? null,
      latitude: row.latitude as number,
      longitude: row.longitude as number,
    }
  })
}

export async function getHomeStats(): Promise<HomeStats> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [sitesRes, muniRes, visitsRes, reviewsRes] = await Promise.all([
    supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("publication_status", "published")
      .eq("visibility", "public"),
    supabase
      .from("municipalities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("tourist_visits")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("reviews")
      .select("rating")
      .eq("status", "published"),
  ])

  if (sitesRes.error) throw sitesRes.error
  if (muniRes.error) throw muniRes.error
  if (visitsRes.error) throw visitsRes.error
  if (reviewsRes.error) throw reviewsRes.error

  const ratings = (reviewsRes.data ?? []) as { rating: number }[]
  const totalReviews = ratings.length
  const positiveReviews = ratings.filter((r) => r.rating >= 4).length
  const positiveReviewPercent =
    totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0

  return {
    heritageSiteCount: sitesRes.count ?? 0,
    municipalityCount: muniRes.count ?? 0,
    visitorCount: visitsRes.count ?? 0,
    positiveReviewPercent,
  }
}

export async function getTopVisitedSites(limit = 4): Promise<TopSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      year_established,
      category:heritage_categories(name),
      municipality:municipalities(name),
      visits:tourist_visits(count)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")

  if (error) throw error

  const sorted = (data ?? [])
    .map((row) => {
      const catArr = row.category as { name: string }[] | null
      const cat = Array.isArray(catArr) ? catArr[0] : catArr
      const munArr = row.municipality as { name: string }[] | null
      const mun = Array.isArray(munArr) ? munArr[0] : munArr

      const visitsArr = row.visits as { count: number }[] | null
      const visitCount = Array.isArray(visitsArr) ? (visitsArr[0]?.count ?? 0) : 0

      return {
        id: row.id as string,
        siteName: row.site_name as string,
        categoryName: cat?.name ?? null,
        yearEstablished: (row.year_established ?? null) as string | null,
        imageUrl: null as string | null,
        municipalityName: mun?.name ?? null,
        visitCount,
      }
    })
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, limit)

  const withImages = await Promise.all(
    sorted.map(async (s) => ({
      ...s,
      imageUrl: s.municipalityName ? await getMunicipalityImage(s.municipalityName) : null,
    }))
  )

  return withImages.map(({ visitCount: _, ...rest }) => rest)
}

export async function getHomePageData() {
  const [featuredSite, featuredMunicipalities, categories, mapSites, stats, topSites] =
    await Promise.all([
      getHeroFeaturedSite(),
      getFeaturedMunicipalities(),
      getMapCategories(),
      getMapSites(),
      getHomeStats(),
      getTopVisitedSites(),
    ])

  return {
    featuredSite,
    featuredMunicipalities,
    categories,
    mapSites,
    stats,
    topSites,
  }
}

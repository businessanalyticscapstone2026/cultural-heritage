"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function getHomePageDataAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [sitesRes, categoriesRes, featuredRes] = await Promise.all([
    supabase
      .from("heritage_sites")
      .select(`
        id, site_name, short_description, year_established, average_rating, review_count,
        municipality:municipalities(name),
        category:heritage_categories(name)
      `)
      .eq("publication_status", "published")
      .eq("visibility", "public")
      .order("average_rating", { ascending: false })
      .limit(8),
    supabase
      .from("heritage_categories")
      .select("id, name, description, icon, color")
      .eq("status", "active")
      .order("display_order"),
    supabase
      .from("heritage_sites")
      .select(`
        id, site_name, short_description, year_established, average_rating, review_count,
        municipality:municipalities(name),
        category:heritage_categories(name)
      `)
      .eq("is_featured", true)
      .eq("publication_status", "published")
      .limit(4),
  ])

  return {
    sites: (sitesRes.data ?? []).map((s) => {
      const mun = Array.isArray(s.municipality) ? s.municipality[0] : s.municipality
      const cat = Array.isArray(s.category) ? s.category[0] : s.category
      return {
        id: s.id,
        siteName: s.site_name,
        shortDescription: s.short_description,
        yearEstablished: s.year_established,
        averageRating: s.average_rating,
        reviewCount: s.review_count,
        municipalityName: mun?.name ?? null,
        categoryName: cat?.name ?? null,
      }
    }),
    categories: (categoriesRes.data ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      description: (c.description ?? null) as string | null,
      icon: (c.icon ?? null) as string | null,
      color: (c.color ?? null) as string | null,
    })),
    featuredSites: (featuredRes.data ?? []).map((s) => {
      const mun = Array.isArray(s.municipality) ? s.municipality[0] : s.municipality
      const cat = Array.isArray(s.category) ? s.category[0] : s.category
      return {
        id: s.id,
        siteName: s.site_name,
        shortDescription: s.short_description,
        yearEstablished: s.year_established,
        averageRating: s.average_rating,
        reviewCount: s.review_count,
        municipalityName: mun?.name ?? null,
        categoryName: cat?.name ?? null,
      }
    }),
  }
}

export async function getUserProfileAction(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("tourist_profiles")
    .select("first_name, onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle()

  return {
    firstName: data?.first_name ?? null,
    onboarded: data?.onboarding_completed_at != null,
  }
}

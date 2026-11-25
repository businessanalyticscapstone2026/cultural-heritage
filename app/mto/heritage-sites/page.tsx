import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { getMtoSiteKpiCounts, getMtoSites, getActiveCategories } from "@/features/heritage/services/mto-sites"
import MtoHeritageListClient from "@/features/heritage/components/mto-heritage-list-client"

export default async function HeritageSitesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user?.id ?? "")
    .maybeSingle()

  const municipalityId = profile?.municipality_id ?? ""

  if (!municipalityId) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p>No municipality assigned to your profile. Contact the PTCAO administrator.</p>
      </div>
    )
  }

  const [sites, kpiCounts, categories] = await Promise.all([
    getMtoSites(municipalityId),
    getMtoSiteKpiCounts(municipalityId),
    getActiveCategories(),
  ])

  return (
    <MtoHeritageListClient
      initialSites={sites}
      kpiCounts={kpiCounts}
      categories={categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
    />
  )
}

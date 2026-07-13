import { getHeritageSitesByMunicipality, getAllCategories } from "@/features/heritage/services"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { MtoHeritageClient } from "@/features/heritage/components"

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

  const [sites, categories] = await Promise.all([
    municipalityId ? getHeritageSitesByMunicipality(municipalityId) : Promise.resolve([]),
    getAllCategories(),
  ])

  return (
    <MtoHeritageClient
      initialSites={sites}
      categories={categories}
      municipalityId={municipalityId}
    />
  )
}

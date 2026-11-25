import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { getActiveCategories, getBarangays } from "@/features/heritage/services/mto-sites"
import MtoHeritageFormClient from "@/features/heritage/components/mto-heritage-form-client"

export default async function NewHeritageSitePage() {
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

  const { data: municipality } = await supabase
    .from("municipalities")
    .select("name")
    .eq("id", municipalityId)
    .maybeSingle()

  const [categories, barangays] = await Promise.all([
    getActiveCategories(),
    municipalityId ? getBarangays(municipalityId) : Promise.resolve([]),
  ])

  return (
    <MtoHeritageFormClient
      categories={categories}
      municipalityId={municipalityId}
      municipalityName={municipality?.name ?? ""}
      barangays={barangays}
    />
  )
}

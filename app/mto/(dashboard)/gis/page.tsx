import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getMtoMapSites, getHeritageCategories, buildSiteGeoJSON } from "@/features/gis/services"
import MTOGISPanel from "@/features/gis/components/mto-gis-panel"
import { MUNICIPALITY_COORDINATES } from "@/lib/constants"

async function getMtoMunicipality() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("id, municipality_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) {
    throw new Error("MTO staff must be assigned to a municipality")
  }

  return profile.municipality_id
}

export default async function MTOGISPage() {
  const municipalityId = await getMtoMunicipality()

  const [sites, categories] = await Promise.all([
    getMtoMapSites(municipalityId),
    getHeritageCategories(),
  ])

  const geoJSON = buildSiteGeoJSON(sites)

  const municipalityName = (
    await (async () => {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      const { data } = await supabase
        .from("municipalities")
        .select("name")
        .eq("id", municipalityId)
        .maybeSingle()
      return data?.name as string | null
    })()
  )
  const rawCenter = municipalityName && municipalityName in MUNICIPALITY_COORDINATES
    ? MUNICIPALITY_COORDINATES[municipalityName as keyof typeof MUNICIPALITY_COORDINATES]
    : null
  const municipalityCenter = rawCenter
    ? { lat: rawCenter.lat, lng: rawCenter.long }
    : { lat: 13.92, lng: 120.78 }

  const activeCategories = categories
    .filter((c) => c.status === "active")
    .map((c) => ({ id: c.id, name: c.name, color: c.color }))

  return (
    <MTOGISPanel
      initialSites={sites}
      initialGeoJSON={geoJSON}
      categories={activeCategories}
      municipalityCenter={municipalityCenter}
    />
  )
}

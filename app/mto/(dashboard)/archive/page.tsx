import { getArchivedSitesByMunicipality } from "@/features/heritage/services"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { MtoArchiveClient } from "@/features/heritage/components"

export default async function ArchivePage() {
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

  const sites = municipalityId
    ? await getArchivedSitesByMunicipality(municipalityId)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Archive</h1>
        <p className="text-sm text-muted-foreground">
          View and restore archived heritage site records
        </p>
      </div>

      <MtoArchiveClient
        initialSites={sites}
        municipalityId={municipalityId}
      />
    </div>
  )
}

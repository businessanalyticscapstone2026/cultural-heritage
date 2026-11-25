import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseReportFilters } from "@/features/mto-reports"
import { getGeneratedReports } from "@/features/mto-reports/services"
import ReportsClient from "@/features/mto-reports/components/reports-client"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const filters = parseReportFilters(params)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

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

  const [{ data: categories }, { data: municipality }, history] = await Promise.all([
    supabase
      .from("heritage_categories")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("municipalities")
      .select("name")
      .eq("id", municipalityId)
      .maybeSingle(),
    getGeneratedReports().catch(() => []),
  ])

  const municipalityName = municipality?.name ?? "Your Municipality"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reports Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate tourism, heritage, and visitor reports for {municipalityName}
        </p>
      </div>

      <ReportsClient
        categories={(categories ?? []).map((c) => ({
          id: c.id as string,
          name: c.name as string,
        }))}
        municipalityName={municipalityName}
        initialHistory={history}
        initialFilters={filters}
      />
    </div>
  )
}

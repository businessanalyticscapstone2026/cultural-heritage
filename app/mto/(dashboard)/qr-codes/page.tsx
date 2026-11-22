import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import {
  getMtoQrCodes,
  getMtoQrKpiCounts,
  getMtoRecentScanLogs,
} from "@/features/qr-code/services/qr-management"
import QRCodeListClient from "@/features/qr-code/components/qr-code-list-client"

export default async function QRCodesPage() {
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

  const [qrCodes, kpiCounts, recentScans] = await Promise.all([
    getMtoQrCodes(municipalityId),
    getMtoQrKpiCounts(municipalityId),
    getMtoRecentScanLogs(municipalityId, 20),
  ])

  return (
    <QRCodeListClient
      initialQrCodes={qrCodes}
      kpiCounts={kpiCounts}
      initialScans={recentScans}
    />
  )
}

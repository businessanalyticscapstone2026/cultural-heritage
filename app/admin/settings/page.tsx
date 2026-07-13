import { getSettingsData } from "@/features/settings/services"
import SystemSettingsPanel from "@/features/settings/components/system-settings-panel"

export default async function SettingsPage() {
  const data = await getSettingsData()

  return <SystemSettingsPanel data={data} />
}

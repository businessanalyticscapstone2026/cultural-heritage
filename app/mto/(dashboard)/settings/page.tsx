import { getOwnAccountSettings } from "@/features/users/services"
import { MtoAccountSettingsForm } from "@/features/users/components/mto-account-settings-form"
import { MtoOfficeCard } from "@/features/users/components/mto-office-card"
import { MtoDisplayPrefsPanel } from "@/features/settings/components/mto-display-prefs-panel"

export default async function SettingsPage() {
  const settings = await getOwnAccountSettings()

  if (!settings) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your staff account is not linked to a municipality yet. Please contact your PTCAO
          administrator to complete your account setup.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure system preferences and account settings.
        </p>
      </div>

      <MtoAccountSettingsForm profile={settings.profile} />

      <MtoOfficeCard municipality={settings.municipality} />

      <MtoDisplayPrefsPanel />
    </div>
  )
}

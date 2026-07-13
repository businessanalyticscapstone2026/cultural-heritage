import { getBackupsList } from "@/features/heritage/services"
import { AdminGovernanceClient } from "@/features/heritage/components"

export default async function DataGovernancePage() {
  const backups = await getBackupsList()

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Data Governance</h1>
        <p className="mt-1 text-sm opacity-80">
          Heritage data backup and recovery management
        </p>
      </div>

      <AdminGovernanceClient initialBackups={backups} />
    </div>
  )
}

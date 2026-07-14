import { getBackupsList } from "@/features/heritage/services"
import { getMunicipalities } from "@/features/users/services"
import { getGovernanceQueue } from "@/features/governance/services"
import { AdminGovernanceClient } from "@/features/heritage/components"

export default async function DataGovernancePage() {
  const [backups, municipalities, reviews] = await Promise.all([
    getBackupsList(),
    getMunicipalities(),
    getGovernanceQueue(),
  ])

  const municipalityList = municipalities.map((m) => ({ id: m.id, name: m.name }))

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Data Governance</h1>
        <p className="mt-1 text-sm opacity-80">
          Review submissions, approve heritage data, and manage backups
        </p>
      </div>

      <AdminGovernanceClient
        initialBackups={backups}
        initialReviews={reviews}
        municipalities={municipalityList}
      />
    </div>
  )
}

import { MtoUsersClient } from "@/features/users/components"
import { getCurrentMtoContext, getMtoStaffProfiles, getAssignableMtoRoles } from "@/features/users/services"

export default async function UsersPage() {
  const context = await getCurrentMtoContext()

  if (!context) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Your staff account is not linked to a municipality yet. Please contact your PTCAO
          administrator to complete your account setup.
        </p>
      </div>
    )
  }

  const [staff, roles] = await Promise.all([
    getMtoStaffProfiles(context.municipality_id),
    getAssignableMtoRoles(),
  ])

  return (
    <MtoUsersClient
      initialStaff={staff}
      roles={roles}
      municipality={{
        id: context.municipality_id,
        name: context.municipality_name ?? "your municipality",
      }}
    />
  )
}

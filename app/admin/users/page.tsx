import { UsersClient } from "@/features/users/components"
import { getStaffProfiles, getRoles } from "@/features/users/services"
import { getMunicipalities } from "@/features/municipalities/services"

export default async function UsersPage() {
  const [staff, roles, municipalities] = await Promise.all([
    getStaffProfiles(),
    getRoles(),
    getMunicipalities(),
  ])

  return (
    <UsersClient
      initialStaff={staff}
      roles={roles}
      municipalities={municipalities}
    />
  )
}

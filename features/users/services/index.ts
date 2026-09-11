import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  StaffProfileWithRelations,
  Role,
  Permission,
  RolePermission,
  PermissionMatrixCell,
} from "../types"
import type { Municipality } from "@/features/municipalities/types"

export async function getStaffProfiles(): Promise<StaffProfileWithRelations[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      role:role_id (id, name),
      municipality:municipality_id (id, name),
      creator:created_by (id, first_name, last_name)
    `)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch staff_profiles: ${error.message}`)

  return (data ?? []) as unknown as StaffProfileWithRelations[]
}

export async function getStaffProfileById(
  id: string
): Promise<StaffProfileWithRelations | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      role:role_id (id, name),
      municipality:municipality_id (id, name),
      creator:created_by (id, first_name, last_name)
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch staff_profile: ${error.message}`)

  return data as unknown as StaffProfileWithRelations | null
}

export async function getRoles(): Promise<Role[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch roles: ${error.message}`)

  return data ?? []
}

export async function getRoleById(id: string): Promise<Role | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch role: ${error.message}`)

  return data
}

export async function getPermissions(): Promise<Permission[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("module", { ascending: true })
    .order("action", { ascending: true })

  if (error) throw new Error(`Failed to fetch permissions: ${error.message}`)

  return data ?? []
}

export async function getRolePermissions(
  roleId: string
): Promise<RolePermission[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .eq("role_id", roleId)

  if (error) throw new Error(`Failed to fetch role_permissions: ${error.message}`)

  return data ?? []
}

export async function getPermissionMatrix(
  roleId: string
): Promise<PermissionMatrixCell[]> {
  const [permissions, rolePerms] = await Promise.all([
    getPermissions(),
    roleId ? getRolePermissions(roleId) : Promise.resolve([] as RolePermission[]),
  ])

  const grantedMap = new Map(
    rolePerms
      .filter((rp) => rp.granted)
      .map((rp) => [rp.permission_id, true])
  )

  return permissions.map((p) => ({
    module: p.module,
    action: p.action,
    permission_id: p.id,
    granted: grantedMap.has(p.id),
  }))
}

export async function getMunicipalities(): Promise<Municipality[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch municipalities: ${error.message}`)

  return data ?? []
}

export type MtoContext = {
  id: string
  municipality_id: string
  municipality_name: string | null
}

/** Resolve the current staff member's municipality — scopes all MTO user management. */
export async function getCurrentMtoContext(): Promise<MtoContext | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from("staff_profiles")
    .select("id, municipality_id, municipality:municipality_id (name)")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !profile) return null

  const row = profile as unknown as {
    id: string
    municipality_id: string | null
    municipality: { name: string } | { name: string }[] | null
  }
  if (!row.municipality_id) return null

  const municipality = Array.isArray(row.municipality) ? row.municipality[0] : row.municipality

  return {
    id: row.id,
    municipality_id: row.municipality_id,
    municipality_name: municipality?.name ?? null,
  }
}

/** Staff profiles scoped to one municipality — feeds the MTO Users page. */
export async function getMtoStaffProfiles(
  municipalityId: string
): Promise<StaffProfileWithRelations[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      role:role_id (id, name),
      municipality:municipality_id (id, name),
      creator:created_by (id, first_name, last_name)
    `)
    .eq("municipality_id", municipalityId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch staff_profiles: ${error.message}`)

  return (data ?? []) as unknown as StaffProfileWithRelations[]
}

const MTO_ASSIGNABLE_ROLE_NAMES = ["MTO Staff"]

/** Roles an MTO manager may assign — MTO-scoped roles only, never admin roles. */
export async function getAssignableMtoRoles(): Promise<Role[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .in("name", MTO_ASSIGNABLE_ROLE_NAMES)
    .eq("status", "active")
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch assignable roles: ${error.message}`)

  return data ?? []
}

export type OwnAccountSettings = {
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    username: string | null
    account_status: "active" | "inactive"
    last_login: string | null
    role: { id: string; name: string } | null
  }
  municipality: {
    id: string
    name: string
    province: string
    status: string
    default_map_center: { lat: number; long: number } | null
  } | null
}

/** Own staff profile + office municipality for the MTO Settings page. */
export async function getOwnAccountSettings(): Promise<OwnAccountSettings | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select(
      "id, first_name, last_name, username, account_status, last_login, municipality_id, role:role_id (id, name)"
    )
    .eq("id", user.id)
    .maybeSingle()

  const row = profile as unknown as {
    id: string
    first_name: string | null
    last_name: string | null
    username: string | null
    account_status: "active" | "inactive"
    last_login: string | null
    municipality_id: string | null
    role: { id: string; name: string } | { id: string; name: string }[] | null
  } | null

  if (!row) return null

  let municipality: OwnAccountSettings["municipality"] = null
  if (row.municipality_id) {
    const { data: muni } = await supabase
      .from("municipalities")
      .select("id, name, province, status, default_map_center")
      .eq("id", row.municipality_id)
      .maybeSingle()

    const m = muni as unknown as {
      id: string
      name: string
      province: string
      status: string
      default_map_center: { lat: number; long: number } | null
    } | null
    if (m) {
      municipality = {
        id: m.id,
        name: m.name,
        province: m.province,
        status: m.status,
        default_map_center: m.default_map_center,
      }
    }
  }

  const role = Array.isArray(row.role) ? (row.role[0] ?? null) : row.role

  return {
    profile: {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      username: row.username,
      account_status: row.account_status,
      last_login: row.last_login,
      role,
    },
    municipality,
  }
}

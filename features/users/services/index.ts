import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  StaffProfileWithRelations,
  Role,
  Permission,
  RolePermission,
  Municipality,
  PermissionMatrixCell,
} from "../types"

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

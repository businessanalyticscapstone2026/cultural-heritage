import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export class PermissionError extends Error {
  constructor(
    public module: string,
    public action: string
  ) {
    super(`Permission denied: ${module}:${action}`)
    this.name = "PermissionError"
  }
}

export async function getCurrentUserRoleId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("staff_profiles")
    .select("role_id")
    .eq("id", user.id)
    .maybeSingle()

  return data?.role_id ?? null
}

export async function checkPermission(
  roleId: string,
  module: string,
  action: string
): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: perm } = await supabase
    .from("permissions")
    .select("id")
    .eq("module", module)
    .eq("action", action)
    .maybeSingle()

  if (!perm) return false

  const { data, error } = await supabase
    .from("role_permissions")
    .select("granted")
    .eq("role_id", roleId)
    .eq("permission_id", perm.id)
    .maybeSingle()

  if (error) {
    console.error(`Permission check error: ${error.message}`)
    return false
  }

  return data?.granted === true
}

async function isBootstrapMode(): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { count, error } = await supabase
    .from("permissions")
    .select("*", { count: "exact", head: true })

  if (error) return false
  return (count ?? 0) === 0
}

export async function checkCurrentUserPermission(
  module: string,
  action: string
): Promise<boolean> {
  if (await isBootstrapMode()) return true

  const roleId = await getCurrentUserRoleId()
  if (!roleId) return false
  return checkPermission(roleId, module, action)
}

export async function requirePermission(
  module: string,
  action: string
): Promise<void> {
  const allowed = await checkCurrentUserPermission(module, action)
  if (!allowed) {
    throw new PermissionError(module, action)
  }
}

export async function getUserPermissions(
  roleId: string
): Promise<{ module: string; action: string }[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("role_permissions")
    .select(`
      granted,
      permission:permission_id (module, action)
    `)
    .eq("role_id", roleId)
    .eq("granted", true)

  if (error) {
    console.error(`Failed to fetch user permissions: ${error.message}`)
    return []
  }

  return (data ?? [])
    .filter((rp) => rp.permission)
    .map((rp) => {
      const p = rp.permission as unknown as { module: string; action: string }
      return { module: p.module, action: p.action }
    })
}

export async function getPermissionMap(
  roleId: string
): Promise<Map<string, Set<string>>> {
  const perms = await getUserPermissions(roleId)
  const map = new Map<string, Set<string>>()

  for (const { module, action } of perms) {
    const actions = map.get(module) ?? new Set()
    actions.add(action)
    map.set(module, actions)
  }

  return map
}

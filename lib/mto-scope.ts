import type { createClient } from "@/utils/supabase/server"

type SupabaseServerClient = ReturnType<typeof createClient>

export type ActorScope = {
  userId: string
  isMto: boolean
  municipalityId: string | null
}

type RoleJoin = { name: string } | { name: string }[] | null

function unwrapRole(role: RoleJoin): { name: string } | null {
  if (!role) return null
  return Array.isArray(role) ? (role[0] ?? null) : role
}

/**
 * Resolve the caller's role + municipality for MTO scoping.
 * PTCAO actors return isMto=false and bypass municipality scoping.
 */
export async function getActorScope(
  supabase: SupabaseServerClient,
  userId: string
): Promise<ActorScope> {
  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id, role:role_id (name)")
    .eq("id", userId)
    .maybeSingle()

  const row = profile as unknown as {
    municipality_id: string | null
    role: RoleJoin
  } | null

  return {
    userId,
    isMto: unwrapRole(row?.role ?? null)?.name === "MTO Staff",
    municipalityId: row?.municipality_id ?? null,
  }
}

/**
 * Municipality of a staff target.
 * Returns undefined when the target does not exist.
 */
export async function getTargetMunicipalityId(
  supabase: SupabaseServerClient,
  targetId: string
): Promise<string | null | undefined> {
  const { data } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", targetId)
    .maybeSingle()

  if (!data) return undefined
  return (data as { municipality_id: string | null }).municipality_id
}

/** Name of a role by id. Returns undefined when the role does not exist. */
export async function getRoleNameById(
  supabase: SupabaseServerClient,
  roleId: string
): Promise<string | undefined> {
  const { data } = await supabase
    .from("roles")
    .select("name")
    .eq("id", roleId)
    .maybeSingle()

  return (data as { name: string } | null)?.name
}

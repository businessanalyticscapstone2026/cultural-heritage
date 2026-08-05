import type { LoginCredentials } from "../types"
import { createClient } from "@/utils/supabase/client"

export type UserRole = "ptcao_admin" | "mto" | "tourist"

export interface RoleResolveResult {
  role: UserRole | null
  roleName: string | null
  profile: Record<string, unknown> | null
  status: "active" | "inactive" | "suspended" | null
}

export function mapRoleNameToUserRole(roleName: string | undefined): UserRole | null {
  if (!roleName) return null
  if (roleName === "MTO Staff") return "mto"
  // The seeded PTCAO role is "PTCAO Admin"; "PTCAO Administrator" is kept for
  // compatibility with older setups.
  if (roleName === "PTCAO Administrator" || roleName === "PTCAO Admin") return "ptcao_admin"
  return null
}

export async function signIn(credentials: LoginCredentials) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) throw error

  return data
}

export async function resolveUserRole(userId: string): Promise<RoleResolveResult> {
  const supabase = createClient()

  const { data: staffProfile, error: staffError } = await supabase
    .from("staff_profiles")
    .select("*, roles(name)")
    .eq("id", userId)
    .maybeSingle()

  if (!staffError && staffProfile) {
    const roleName = mapRoleNameToUserRole(staffProfile.roles?.name)
    return {
      role: roleName,
      roleName: (staffProfile.roles?.name as string) ?? null,
      profile: staffProfile,
      status: staffProfile.account_status ?? null,
    }
  }

  const { data: touristProfile, error: touristError } = await supabase
    .from("tourist_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (!touristError && touristProfile) {
    return {
      role: "tourist",
      roleName: null,
      profile: touristProfile,
      status: touristProfile.account_status ?? "active",
    }
  }

  return { role: null, roleName: null, profile: null, status: null }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = createClient()
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch {
    return null
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  })
  if (error) throw error
}

import type { SupabaseClient } from "@supabase/supabase-js"

export type ResolvedRole = "mto_staff" | "admin_staff" | "tourist"

export interface ResolvedPostLoginRoute {
  role: ResolvedRole
  defaultRoute: string
}

const ROLE_PATH_PREFIXES: Record<ResolvedRole, string[]> = {
  mto_staff: ["/mto"],
  admin_staff: ["/admin"],
  tourist: ["/home", "/onboarding"],
}

/**
 * Resolves where a signed-in user should land, using the same
 * staff_profiles / tourist_profiles lookups used at sign-in time.
 * Returns null when no profile exists for the account.
 */
export async function resolvePostLoginRoute(
  supabase: SupabaseClient,
  userId: string,
): Promise<ResolvedPostLoginRoute | null> {
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("*, roles(name)")
    .eq("id", userId)
    .maybeSingle()

  if (staffProfile) {
    const roleName = staffProfile.roles?.name
    if (roleName === "MTO Staff") {
      return { role: "mto_staff", defaultRoute: "/mto/dashboard" }
    }
    return { role: "admin_staff", defaultRoute: "/admin/dashboard" }
  }

  const { data: touristProfile } = await supabase
    .from("tourist_profiles")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle()

  if (touristProfile) {
    return {
      role: "tourist",
      defaultRoute: touristProfile.onboarding_completed_at ? "/home" : "/onboarding",
    }
  }

  return null
}

/** Guards a `?redirect=` target against open redirects and role scope. */
export function isPathAuthorizedForRole(path: string, role: ResolvedRole): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false

  return ROLE_PATH_PREFIXES[role].some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

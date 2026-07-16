"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { mapRoleNameToUserRole } from "../services"

export async function resolveLoginRoleAction(userId: string): Promise<{
  role: "ptcao_admin" | "mto" | "tourist" | "none"
  onboardingCompleted: boolean
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("*, roles(name)")
    .eq("id", userId)
    .maybeSingle()

  if (staffProfile) {
    const roleName = mapRoleNameToUserRole(staffProfile.roles?.name)
    return {
      role: roleName ?? "none",
      onboardingCompleted: true,
    }
  }

  const { data: touristProfile } = await supabase
    .from("tourist_profiles")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle()

  if (touristProfile) {
    return {
      role: "tourist",
      onboardingCompleted: touristProfile.onboarding_completed_at != null,
    }
  }

  return { role: "none", onboardingCompleted: false }
}

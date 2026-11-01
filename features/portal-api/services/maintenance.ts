import type { SupabaseClient } from "@supabase/supabase-js"
import { PORTAL_MAINTENANCE_RETRY_AFTER_SECONDS } from "../constants"
import { dependencyUnavailable, PortalApiError } from "./portal-errors"

/**
 * Portal writes honour the same switch as the main site
 * (system_settings.global_settings.maintenanceMode, see proxy.ts). proxy.ts
 * exempts /api, so the check lives here. Reads stay available.
 */
export async function isMaintenanceMode(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "global_settings")
    .maybeSingle()

  if (error) throw dependencyUnavailable(error.message)
  const value = data?.value as Record<string, unknown> | null | undefined
  return value?.maintenanceMode === true
}

export async function assertWritesAllowed(supabase: SupabaseClient): Promise<void> {
  if (await isMaintenanceMode(supabase)) {
    throw new PortalApiError(
      503,
      "maintenance",
      "The heritage platform is under maintenance. Reviews cannot be submitted right now.",
      { retryAfterSeconds: PORTAL_MAINTENANCE_RETRY_AFTER_SECONDS }
    )
  }
}

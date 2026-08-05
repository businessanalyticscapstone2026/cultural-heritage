"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { logAuditEvent } from "@/features/audit/services"
import { z } from "zod"
import type { GlobalSettings, RecommendationWeights, RoutingConfig } from "./types"

const globalSettingsSchema = z.object({
  defaultLanguage: z.enum(["en", "fil", "tl"]),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  timeZone: z.string().min(1),
  itemsPerPage: z.number().int().min(5).max(100),
  sessionTimeout: z.number().int().min(5).max(480),
  defaultDashboard: z.enum(["admin", "mto"]),
  maintenanceMode: z.boolean(),
  allowUserRegistration: z.boolean(),
})

const recommendationWeightsSchema = z.object({
  categoryMatch: z.number().min(0).max(1),
  historicalSignificance: z.number().min(0).max(1),
  accessibility: z.number().min(0).max(1),
  distance: z.number().min(0).max(1),
  popularity: z.number().min(0).max(1),
})

const routingConfigSchema = z.object({
  maxStops: z.number().int().min(1).max(50),
  maxTravelTimeMinutes: z.number().int().min(15).max(1440),
  preferShortestDistance: z.boolean(),
})

const integrationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "error"]).optional(),
  api_key_masked: z.string().nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

const integrationCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "inactive", "error"]).optional(),
  api_key_masked: z.string().nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

async function getCurrentSetting(supabase: ReturnType<typeof createClient>, key: string) {
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()
  return (data?.value as Record<string, unknown>) ?? {}
}

export async function updateGlobalSettings(settings: GlobalSettings) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const parsed = globalSettingsSchema.safeParse(settings)
  if (!parsed.success) {
    throw new Error(`Invalid global settings: ${parsed.error.issues.map((i) => i.message).join(", ")}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key: "global_settings",
        value: parsed.data,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

  if (error) throw new Error(`Failed to update global settings: ${error.message}`)

  try {
    await logAuditEvent({ category: "settings", action: "global_settings_updated" })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function updateRecommendationWeights(weights: RecommendationWeights) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const parsed = recommendationWeightsSchema.safeParse(weights)
  if (!parsed.success) {
    throw new Error(`Invalid recommendation weights: ${parsed.error.issues.map((i) => i.message).join(", ")}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key: "recommendation_weights",
        value: parsed.data,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

  if (error) throw new Error(`Failed to update recommendation weights: ${error.message}`)

  try {
    await logAuditEvent({ category: "settings", action: "recommendation_weights_updated" })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function updateRoutingConfig(config: RoutingConfig) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const parsed = routingConfigSchema.safeParse(config)
  if (!parsed.success) {
    throw new Error(`Invalid routing config: ${parsed.error.issues.map((i) => i.message).join(", ")}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key: "routing_config",
        value: parsed.data,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

  if (error) throw new Error(`Failed to update routing config: ${error.message}`)

  try {
    await logAuditEvent({ category: "settings", action: "routing_config_updated" })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function updateMaintenanceMode(enabled: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const current = await getCurrentSetting(supabase, "global_settings")
  current.maintenanceMode = enabled

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key: "global_settings",
        value: current,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

  if (error) throw new Error(`Failed to update maintenance mode: ${error.message}`)

  try {
    await logAuditEvent({ category: "settings", action: "maintenance_mode_changed", detail: { enabled } })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function updateAllowUserRegistration(enabled: boolean) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const current = await getCurrentSetting(supabase, "global_settings")
  current.allowUserRegistration = enabled

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key: "global_settings",
        value: current,
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

  if (error) throw new Error(`Failed to update allow user registration: ${error.message}`)

  try {
    await logAuditEvent({ category: "settings", action: "user_registration_changed", detail: { enabled } })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function updateIntegrationAction(
  id: string,
  data: {
    name?: string
    category?: string
    status?: "active" | "inactive" | "error"
    api_key_masked?: string | null
    config?: Record<string, unknown>
  },
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const parsed = integrationUpdateSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid integration data: ${parsed.error.issues.map((i) => i.message).join(", ")}`)
  }

  const { error } = await supabase
    .from("integrations")
    .update(parsed.data)
    .eq("id", id)

  if (error) throw new Error(`Failed to update integration: ${error.message}`)

  try {
    await logAuditEvent({
      category: "settings",
      action: "integration_updated",
      targetType: "integration",
      targetId: id,
    })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function createIntegrationAction(data: {
  name: string
  category: string
  status?: "active" | "inactive" | "error"
  api_key_masked?: string | null
  config?: Record<string, unknown>
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const parsed = integrationCreateSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid integration data: ${parsed.error.issues.map((i) => i.message).join(", ")}`)
  }

  const { error } = await supabase
    .from("integrations")
    .insert({
      name: parsed.data.name,
      category: parsed.data.category,
      status: parsed.data.status ?? "inactive",
      api_key_masked: parsed.data.api_key_masked ?? null,
      config: parsed.data.config ?? null,
    })

  if (error) throw new Error(`Failed to create integration: ${error.message}`)

  try {
    await logAuditEvent({
      category: "settings",
      action: "integration_created",
      targetType: "integration",
      detail: { name: parsed.data.name },
    })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function deleteIntegrationAction(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete integration: ${error.message}`)

  try {
    await logAuditEvent({
      category: "settings",
      action: "integration_deleted",
      targetType: "integration",
      targetId: id,
    })
  } catch {}

  revalidatePath("/admin/settings")
}

export async function testIntegrationConnectionAction(id: string) {
  const { testIntegrationConnection } = await import("./services")
  return testIntegrationConnection(id)
}

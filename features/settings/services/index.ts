import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  GlobalSettings,
  RecommendationWeights,
  RoutingConfig,
  IntegrationRecord,
  SettingsData,
  LanguageOption,
  DateFormatOption,
  DashboardOption,
} from "../types"

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  defaultLanguage: "en",
  dateFormat: "MM/DD/YYYY",
  timeZone: "Asia/Manila",
  itemsPerPage: 10,
  sessionTimeout: 30,
  defaultDashboard: "admin",
  maintenanceMode: false,
  allowUserRegistration: true,
}

const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  categoryMatch: 0.3,
  historicalSignificance: 0.25,
  accessibility: 0.2,
  distance: 0.15,
  popularity: 0.1,
}

const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  maxStops: 10,
  maxTravelTimeMinutes: 480,
  preferShortestDistance: true,
}

const VALID_LANGUAGES: readonly string[] = ["en", "fil", "tl"]
const VALID_DATE_FORMATS: readonly string[] = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]
const VALID_DASHBOARDS: readonly string[] = ["admin", "mto"]

function parseGlobalSettings(value: Record<string, unknown> | null): GlobalSettings {
  if (!value) return DEFAULT_GLOBAL_SETTINGS
  return {
    defaultLanguage: VALID_LANGUAGES.includes(value.defaultLanguage as string)
      ? (value.defaultLanguage as LanguageOption)
      : DEFAULT_GLOBAL_SETTINGS.defaultLanguage,
    dateFormat: VALID_DATE_FORMATS.includes(value.dateFormat as string)
      ? (value.dateFormat as DateFormatOption)
      : DEFAULT_GLOBAL_SETTINGS.dateFormat,
    timeZone: (typeof value.timeZone === "string" && value.timeZone) || DEFAULT_GLOBAL_SETTINGS.timeZone,
    itemsPerPage: (typeof value.itemsPerPage === "number" && value.itemsPerPage > 0) ? value.itemsPerPage : DEFAULT_GLOBAL_SETTINGS.itemsPerPage,
    sessionTimeout: (typeof value.sessionTimeout === "number" && value.sessionTimeout > 0) ? value.sessionTimeout : DEFAULT_GLOBAL_SETTINGS.sessionTimeout,
    defaultDashboard: VALID_DASHBOARDS.includes(value.defaultDashboard as string)
      ? (value.defaultDashboard as DashboardOption)
      : DEFAULT_GLOBAL_SETTINGS.defaultDashboard,
    maintenanceMode: value.maintenanceMode === true,
    allowUserRegistration: value.allowUserRegistration !== false,
  }
}

function parseRecommendationWeights(value: Record<string, unknown> | null): RecommendationWeights {
  if (!value) return DEFAULT_RECOMMENDATION_WEIGHTS
  return {
    categoryMatch: (typeof value.categoryMatch === "number") ? value.categoryMatch : DEFAULT_RECOMMENDATION_WEIGHTS.categoryMatch,
    historicalSignificance: (typeof value.historicalSignificance === "number") ? value.historicalSignificance : DEFAULT_RECOMMENDATION_WEIGHTS.historicalSignificance,
    accessibility: (typeof value.accessibility === "number") ? value.accessibility : DEFAULT_RECOMMENDATION_WEIGHTS.accessibility,
    distance: (typeof value.distance === "number") ? value.distance : DEFAULT_RECOMMENDATION_WEIGHTS.distance,
    popularity: (typeof value.popularity === "number") ? value.popularity : DEFAULT_RECOMMENDATION_WEIGHTS.popularity,
  }
}

function parseRoutingConfig(value: Record<string, unknown> | null): RoutingConfig {
  if (!value) return DEFAULT_ROUTING_CONFIG
  return {
    maxStops: (typeof value.maxStops === "number" && value.maxStops > 0) ? value.maxStops : DEFAULT_ROUTING_CONFIG.maxStops,
    maxTravelTimeMinutes: (typeof value.maxTravelTimeMinutes === "number" && value.maxTravelTimeMinutes > 0) ? value.maxTravelTimeMinutes : DEFAULT_ROUTING_CONFIG.maxTravelTimeMinutes,
    preferShortestDistance: value.preferShortestDistance !== false,
  }
}

export async function getSettingsData(): Promise<SettingsData> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [settingsResult, integrationsResult] = await Promise.all([
    supabase.from("system_settings").select("key, value"),
    supabase.from("integrations").select("id, name, category, status, api_key_masked, last_sync, config, created_at").order("created_at", { ascending: true }),
  ])

  if (settingsResult.error) throw new Error(`Failed to fetch system_settings: ${settingsResult.error.message}`)
  if (integrationsResult.error) throw new Error(`Failed to fetch integrations: ${integrationsResult.error.message}`)

  const settingsMap = new Map<string, Record<string, unknown>>()
  for (const row of settingsResult.data ?? []) {
    settingsMap.set(row.key, (row.value as Record<string, unknown>) ?? {})
  }

  return {
    globalSettings: parseGlobalSettings(settingsMap.get("global_settings") ?? null),
    thresholdSettings: {
      recommendationWeights: parseRecommendationWeights(settingsMap.get("recommendation_weights") ?? null),
      routingConfig: parseRoutingConfig(settingsMap.get("routing_config") ?? null),
    },
    integrations: (integrationsResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status as IntegrationRecord["status"],
      apiKeyMasked: row.api_key_masked,
      lastSync: row.last_sync,
      config: row.config as Record<string, unknown> | null,
      createdAt: row.created_at,
    })),
  }
}

export async function getGlobalSettingsPublic(): Promise<GlobalSettings> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "global_settings")
    .maybeSingle()

  return parseGlobalSettings((data?.value as Record<string, unknown>) ?? null)
}

export async function upsertSystemSetting(
  key: string,
  value: Record<string, unknown>,
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      { key, value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )

  if (error) throw new Error(`Failed to upsert system setting '${key}': ${error.message}`)
}

export async function updateIntegration(
  id: string,
  data: {
    name?: string
    category?: string
    status?: "active" | "inactive" | "error"
    api_key_masked?: string | null
    config?: Record<string, unknown>
  },
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("integrations")
    .update({ ...data })
    .eq("id", id)

  if (error) throw new Error(`Failed to update integration ${id}: ${error.message}`)
}

export async function createIntegration(data: {
  name: string
  category: string
  status?: "active" | "inactive" | "error"
  api_key_masked?: string | null
  config?: Record<string, unknown>
}): Promise<string> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: inserted, error } = await supabase
    .from("integrations")
    .insert({
      name: data.name,
      category: data.category,
      status: data.status ?? "inactive",
      api_key_masked: data.api_key_masked ?? null,
      config: data.config ?? null,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create integration: ${error.message}`)
  return inserted.id
}

export async function deleteIntegration(id: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete integration ${id}: ${error.message}`)
}

export async function testIntegrationConnection(
  integrationId: string,
): Promise<{ success: boolean; message: string }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("integrations")
    .select("name, status, config")
    .eq("id", integrationId)
    .single()

  if (error) throw new Error(`Failed to fetch integration: ${error.message}`)
  if (!data) return { success: false, message: "Integration not found." }

  if (data.status === "inactive") {
    return { success: false, message: "Integration is inactive. Activate it before testing." }
  }

  // TODO: Implement actual outbound connectivity tests per service type.
  // For now, return a stubbed response indicating the integration is reachable.
  const integrationName = data.name ?? "Unknown"

  return {
    success: true,
    message: `${integrationName} connection test passed (stubbed). Implement real connectivity check for this service.`,
  }
}

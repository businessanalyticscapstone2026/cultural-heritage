export type LanguageOption = "en" | "fil" | "tl"
export type DateFormatOption = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
export type DashboardOption = "admin" | "mto"

export interface GlobalSettings {
  defaultLanguage: LanguageOption
  dateFormat: DateFormatOption
  timeZone: string
  itemsPerPage: number
  sessionTimeout: number
  defaultDashboard: DashboardOption
  maintenanceMode: boolean
  allowUserRegistration: boolean
}

export interface RecommendationWeights {
  categoryMatch: number
  historicalSignificance: number
  accessibility: number
  distance: number
  popularity: number
}

export interface RoutingConfig {
  maxStops: number
  maxTravelTimeMinutes: number
  preferShortestDistance: boolean
}

export interface ThresholdSettings {
  recommendationWeights: RecommendationWeights
  routingConfig: RoutingConfig
}

export interface IntegrationRecord {
  id: string
  name: string
  category: string | null
  status: "active" | "inactive" | "error"
  apiKeyMasked: string | null
  lastSync: string | null
  config: Record<string, unknown> | null
  createdAt: string
}

export interface SettingsData {
  globalSettings: GlobalSettings
  thresholdSettings: ThresholdSettings
  integrations: IntegrationRecord[]
}

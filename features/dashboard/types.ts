export type KpiMetric = {
  value: number
  previous: number
}

export type KpiData = {
  heritageSites: KpiMetric
  activeMunicipalities: KpiMetric
  registeredUsers: KpiMetric
  visitsThisMonth: KpiMetric
}

export type CategoryBreakdown = {
  id: string
  name: string
  color: string
  count: number
}

export type RecentHeritageSite = {
  id: string
  siteName: string
  municipalityName: string
  categoryName: string
  createdAt: string
}

export type VisitOverview = {
  date: string
  count: number
}

export type HeritageSiteMapMarker = {
  id: string
  siteName: string
  latitude: number
  longitude: number
  categoryName: string
  categoryColor: string
}

export type RecommendationPerformance = {
  totalRecommendations: number
  clickThroughRate: number
  routePlansCreated: number
  userSatisfaction: {
    average: number
    percent: number
    reviewCount: number
  }
}

export type SystemHealth = {
  lastBackupAt: string | null
  lastBackupStatus: string | null
  lastBackupType: string | null
  systemVersion: string | null
}

export type DashboardData = {
  kpis: KpiData
  categoryBreakdown: CategoryBreakdown[]
  recentSites: RecentHeritageSite[]
  visitOverview: VisitOverview[]
  mapMarkers: HeritageSiteMapMarker[]
  recommendationPerformance: RecommendationPerformance
  systemHealth: SystemHealth
}

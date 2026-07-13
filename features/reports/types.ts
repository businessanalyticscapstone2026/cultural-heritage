export interface ReportFilters {
  startDate: string
  endDate: string
  municipalityId?: string
  categoryId?: string
}

export interface UnderPromotedSite {
  siteId: string
  siteName: string
  municipalityName: string
  categoryName: string
  recommendationCount: number
  visitCount: number
}

export interface MunicipalityPerformance {
  municipalityId: string
  municipalityName: string
  totalVisitors: number
  localCount: number
  domesticCount: number
  internationalCount: number
  dailyVisits: { date: string; count: number }[]
}

export interface CategoryDemand {
  categoryId: string
  categoryName: string
  recommendationCount: number
  visitCount: number
}

export interface ResourceAllocation {
  municipalityId: string
  municipalityName: string
  visitorVolume: number
  routeCount: number
  routeStopCount: number
  compositeScore: number
}

export interface ReportData {
  underPromotedSites: UnderPromotedSite[]
  municipalityPerformance: MunicipalityPerformance[]
  categoryDemand: CategoryDemand[]
  resourceAllocation: ResourceAllocation[]
}

export interface FilterOption {
  id: string
  name: string
}

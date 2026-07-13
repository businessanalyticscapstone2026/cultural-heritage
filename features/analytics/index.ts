export type {
  ProvinceMetric,
  VisitorTrendPoint,
  TrendGranularity,
  MunicipalityVisit,
  AgeGroupBreakdown,
  VisitorTypeBreakdown,
  CategoryVisit,
  TopVisitedSite,
  RecommendationFunnel,
  AnalyticsFilters,
} from "./types"

export {
  parseFiltersFromSearchParams,
  computeChange,
  MUNICIPALITY_COLORS,
} from "./utils"

export interface DashboardStat {
  label: string
  value: number
  changePercent: number | null
  changeDirection: "up" | "down" | "stable"
  icon: string
  description: string
}

export interface MonthlyVisitsPoint {
  month: string
  currentYear: number
  priorYear: number
}

export interface CategoryBreakdownPoint {
  name: string
  value: number
  color: string
}

export interface RecentSite {
  id: string
  siteName: string
  categoryName: string | null
  barangay: string | null
  thumbnailUrl: string | null
  status: "draft" | "published" | "archived"
  createdAt: string
}

export type ActivityType = "visit" | "qr_scan" | "bookmark" | "review"

export interface TouristActivity {
  id: string
  type: ActivityType
  description: string
  timestamp: string
  siteName: string
}

export interface VisitorStats {
  local: number
  domestic: number
  international: number
  priorYearTotal: number
}

export interface RecentScan {
  id: string
  siteName: string
  scannedAt: string
  deviceType: string | null
}

export interface TopAttraction {
  siteId: string
  siteName: string
  visits: number
  percentage: number
}

export interface ScanDeviceBreakdownPoint {
  device: string
  count: number
  color: string
}

export interface CategoryDistributionPoint {
  name: string
  count: number
  percentage: number
  color: string
}

export type InsightTone = "positive" | "negative" | "neutral" | "info"

export interface DashboardInsight {
  id: string
  label: string
  value: string
  detail: string
  tone: InsightTone
  icon: string
}

export interface DashboardData {
  stats: DashboardStat[]
  visitsOverview: MonthlyVisitsPoint[]
  visitsByCategory: CategoryBreakdownPoint[]
  recentSites: RecentSite[]
  recentActivity: TouristActivity[]
  visitorStats: VisitorStats
  recentScans: RecentScan[]
  todayScanCount: number
  topAttractions: TopAttraction[]
  scanDeviceBreakdown: ScanDeviceBreakdownPoint[]
  categoryDistribution: CategoryDistributionPoint[]
  insights: DashboardInsight[]
}

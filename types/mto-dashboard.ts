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

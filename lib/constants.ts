export const APP_NAME = "Batangas Heritage"
export const APP_DESCRIPTION = "Cultural Heritage Decision Support System for the First District of Batangas"

export const ROLES = {
  PTCAO_ADMIN: "ptcao_admin" as const,
  MTO: "mto" as const,
  TOURIST: "tourist" as const,
}

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    MUNICIPALITIES: "/admin/municipalities",
    USERS: "/admin/users",
    HERITAGE: "/admin/heritage-repository",
    GIS: "/admin/gis-admin",
    ANALYTICS: "/admin/analytics",
    DECISION_SUPPORT: "/admin/decision-support",
    DATA_GOVERNANCE: "/admin/data-governance",
    SETTINGS: "/admin/settings",
    AUDIT_TRAIL: "/admin/audit-trail",
  },
  MTO: {
    DASHBOARD: "/mto/dashboard",
    SITES: "/mto/heritage-sites",
    CATEGORIES: "/mto/categories",
    HISTORICAL_INFO: "/mto/historical-info",
    ARCHIVE: "/mto/archive",
    MEDIA: "/mto/media",
    GIS: "/mto/gis",
    ACTIVITIES: "/mto/activities",
    VISITOR_STATS: "/mto/visitor-stats",
    TOURIST_MONITORING: "/mto/tourist-monitoring",
    ANALYTICS: "/mto/analytics",
    REPORTS: "/mto/reports",
    QR_CODES: "/mto/qr-codes",
    USERS: "/mto/users",
    SETTINGS: "/mto/settings",
  },
  TOURIST: {
    HOME: "/home",
    EXPLORE: "/explore",
    MAP: "/map",
    NEARBY: "/nearby",
    SCAN: "/scan",
    RECOMMENDATIONS: "/recommendations",
    ROUTES: "/routes",
    BOOKMARKS: "/saved",
    FEEDBACK: "/feedback",
    PROFILE: "/profile",
  },
} as const

export const FIRST_DISTRICT_MUNICIPALITIES = [
  "Nasugbu",
  "Lian",
  "Tuy",
  "Balayan",
  "Calaca",
  "Lemery",
  "Taal",
  "Calatagan",
] as const

export const MUNICIPALITY_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const

export const MUNICIPALITY_COORDINATES: Record<string, { lat: number; long: number }> = {
  Nasugbu: { lat: 14.0677, long: 120.6278 },
  Lian: { lat: 14.0067, long: 120.6417 },
  Tuy: { lat: 14.0167, long: 120.6833 },
  Balayan: { lat: 13.9372, long: 120.6914 },
  Calaca: { lat: 13.96, long: 120.61 },
  Lemery: { lat: 13.8833, long: 120.5667 },
  Taal: { lat: 13.8833, long: 120.9239 },
  Calatagan: { lat: 13.8322, long: 120.6328 },
}

export const WALKING_SPEED_KMH = 5
export const DRIVING_SPEED_KMH = 30

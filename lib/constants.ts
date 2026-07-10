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
    MEDIA: "/mto/media",
    GIS: "/mto/gis",
    MONITORING: "/mto/tourist-monitoring",
    REPORTS: "/mto/reports",
    QR_CODES: "/mto/qr-codes",
  },
  TOURIST: {
    HOME: "/explore",
    MAP: "/map",
    RECOMMENDATIONS: "/recommendations",
    ROUTES: "/routes",
    BOOKMARKS: "/bookmarks",
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

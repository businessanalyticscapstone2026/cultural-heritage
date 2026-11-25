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

export const TRAVEL_STYLES = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "group", label: "Tour Group" },
] as const

export const GROUP_TYPES = [
  { value: "walking", label: "Walking" },
  { value: "driving", label: "Driving" },
  { value: "mixed", label: "Mixed" },
] as const

export const AGE_GROUPS = [
  { value: "18-24", label: "18 – 24" },
  { value: "25-34", label: "25 – 34" },
  { value: "35-54", label: "35 – 54" },
  { value: "55+", label: "55+" },
] as const

export const DEFAULT_AGE_GROUP = "18-24"

export const ACCESSIBILITY_NEEDS = [
  { value: "wheelchair", label: "Wheelchair Accessible" },
  { value: "visual", label: "Visual Assistance" },
  { value: "hearing", label: "Hearing Assistance" },
  { value: "mobility", label: "Mobility Support" },
  { value: "cognitive", label: "Cognitive Support" },
] as const

export const SITE_CONTACT = {
  address: "Provincial Capitol Compound, Kumintang Ibaba, Batangas City, Batangas",
  phone: "+63 43 000 0000",
  email: "ptcao.batangas@example.com",
  website: "https://batangas.gov.ph",
  officeHours: "Monday – Friday · 8:00 AM – 5:00 PM",
  socials: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
  ],
} as const

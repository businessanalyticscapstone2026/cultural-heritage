import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  LoginAttempt,
  LoginOutcome,
  AuditLog,
  AuditCategory,
  SecurityEvent,
  AuditLogWithUser,
  LoginAttemptWithUser,
  SecurityEventWithUser,
  AuditStats,
  AuditFilters,
} from "@/types/audit"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

export async function logLoginAttempt(params: {
  email: string
  outcome: LoginOutcome
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("login_attempts").insert({
    user_id: params.userId ?? null,
    email_attempted: params.email,
    outcome: params.outcome,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  })

  if (error) console.error("Failed to log login attempt:", error.message)
}

export async function checkLoginRateLimit(email: string): Promise<{
  locked: boolean
  remainingAttempts: number
  lockedUntil?: string
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Count failed attempts in the last 15 minutes
  const windowStart = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()

  const { count } = await supabase
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email_attempted", email)
    .eq("outcome", "failed_password")
    .gte("created_at", windowStart)

  const failedCount = count ?? 0

  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    const { data: lastFailure } = await supabase
      .from("login_attempts")
      .select("created_at")
      .eq("email_attempted", email)
      .eq("outcome", "failed_password")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const lockedUntil = lastFailure
      ? new Date(new Date(lastFailure.created_at).getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()
      : new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()

    if (new Date(lockedUntil) > new Date()) {
      return { locked: true, remainingAttempts: 0, lockedUntil }
    }
  }

  return { locked: false, remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedCount) }
}

export async function updateLastLogin(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (staffProfile) {
    const { error } = await supabase
      .from("staff_profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId)

    if (error) console.error("Failed to update staff last_login:", error.message)
    return
  }

  const { error } = await supabase
    .from("tourist_profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", userId)

  if (error) console.error("Failed to update tourist last_login:", error.message)
}

export async function logAuditEvent(params: {
  category: AuditCategory
  action: string
  targetType?: string
  targetId?: string
  detail?: Record<string, unknown>
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let userId = params.userId
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  }

  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    category: params.category,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    detail: params.detail ? JSON.stringify(params.detail) : null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  })

  if (error) console.error("Failed to log audit event:", error.message)
}

export async function logSecurityEvent(params: {
  eventType: string
  detail?: string
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let userId = params.userId
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  }

  const { error } = await supabase.from("security_events").insert({
    user_id: userId,
    event_type: params.eventType,
    detail: params.detail ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  })

  if (error) console.error("Failed to log security event:", error.message)
}

async function fetchStaffUserMap(
  supabase: ReturnType<typeof createClient>,
  userIds: string[]
): Promise<Map<string, { name: string }>> {
  const userMap = new Map<string, { name: string }>()
  if (userIds.length === 0) return userMap

  const { data: profiles, error } = await supabase
    .from("staff_profiles")
    .select("id, first_name, last_name, username")
    .in("id", userIds)

  if (error) {
    console.error("Failed to hydrate staff profiles for audit trail:", error.message)
    return userMap
  }

  for (const p of profiles ?? []) {
    const nameParts = [p.first_name, p.last_name].filter(Boolean)
    const name = nameParts.length > 0 ? nameParts.join(" ") : p.username || "Staff User"
    userMap.set(p.id, { name })
  }

  return userMap
}

export async function getAuditLogs(filters?: AuditFilters): Promise<AuditLogWithUser[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }
  if (filters?.userId) {
    query = query.eq("user_id", filters.userId)
  }
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate)
  }
  if (filters?.search) {
    query = query.or(`action.ilike.%${filters.search}%,target_type.ilike.%${filters.search}%,target_id.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    if (error.message?.includes("does not exist")) return []
    throw new Error(`Failed to fetch audit logs: ${error.message}`)
  }

  const rawLogs = data ?? []
  const userIds = Array.from(new Set(rawLogs.map((r) => r.user_id).filter((id): id is string => Boolean(id))))
  const userMap = await fetchStaffUserMap(supabase, userIds)

  return rawLogs.map((row) => {
    const user = row.user_id ? userMap.get(row.user_id) : undefined
    return {
      id: row.id as string,
      userId: (row.user_id as string) ?? null,
      category: row.category as AuditLogWithUser["category"],
      action: row.action as string,
      targetType: (row.target_type as string) ?? null,
      targetId: (row.target_id as string) ?? null,
      detail: row.detail ? (typeof row.detail === "string" ? JSON.parse(row.detail) : row.detail) as Record<string, unknown> : null,
      ipAddress: (row.ip_address as string) ?? null,
      userAgent: (row.user_agent as string) ?? null,
      createdAt: row.created_at as string,
      userName: user?.name ?? null,
      userEmail: null,
    }
  })
}

export async function getLoginAttempts(filters?: {
  userId?: string | null
  startDate?: string | null
  endDate?: string | null
  outcome?: LoginOutcome | null
}): Promise<LoginAttemptWithUser[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from("login_attempts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId)
  }
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate)
  }
  if (filters?.outcome) {
    query = query.eq("outcome", filters.outcome)
  }

  const { data, error } = await query

  if (error) {
    if (error.message?.includes("does not exist")) return []
    throw new Error(`Failed to fetch login attempts: ${error.message}`)
  }

  const rawAttempts = data ?? []
  const userIds = Array.from(new Set(rawAttempts.map((r) => r.user_id).filter((id): id is string => Boolean(id))))
  const userMap = await fetchStaffUserMap(supabase, userIds)

  return rawAttempts.map((row) => {
    const user = row.user_id ? userMap.get(row.user_id) : undefined
    return {
      id: row.id as string,
      userId: (row.user_id as string) ?? null,
      emailAttempted: row.email_attempted as string,
      outcome: row.outcome as LoginAttemptWithUser["outcome"],
      ipAddress: (row.ip_address as string) ?? null,
      userAgent: (row.user_agent as string) ?? null,
      createdAt: row.created_at as string,
      userName: user?.name ?? null,
    }
  })
}

export async function getSecurityEvents(filters?: {
  userId?: string | null
  startDate?: string | null
  endDate?: string | null
  eventType?: string | null
}): Promise<SecurityEventWithUser[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from("security_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId)
  }
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate)
  }
  if (filters?.eventType) {
    query = query.eq("event_type", filters.eventType)
  }

  const { data, error } = await query

  if (error) {
    if (error.message?.includes("does not exist")) return []
    throw new Error(`Failed to fetch security events: ${error.message}`)
  }

  const rawEvents = data ?? []
  const userIds = Array.from(new Set(rawEvents.map((r) => r.user_id).filter((id): id is string => Boolean(id))))
  const userMap = await fetchStaffUserMap(supabase, userIds)

  return rawEvents.map((row) => {
    const user = row.user_id ? userMap.get(row.user_id) : undefined
    return {
      id: row.id as string,
      userId: (row.user_id as string) ?? null,
      eventType: row.event_type as string,
      detail: (row.detail as string) ?? null,
      ipAddress: (row.ip_address as string) ?? null,
      userAgent: (row.user_agent as string) ?? null,
      createdAt: row.created_at as string,
      userName: user?.name ?? null,
      userEmail: null,
    }
  })
}

export async function getAuditStats(): Promise<AuditStats> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [logsRes, loginsRes, failedRes, eventsRes, recentRes] = await Promise.all([
    supabase.from("audit_logs").select("id", { count: "exact", head: true }),
    supabase.from("login_attempts").select("id", { count: "exact", head: true }).eq("outcome", "success"),
    supabase.from("login_attempts").select("id", { count: "exact", head: true }).neq("outcome", "success"),
    supabase.from("security_events").select("id", { count: "exact", head: true }),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", twentyFourHoursAgo),
  ])

  return {
    totalLogs: logsRes.count ?? 0,
    totalLogins: loginsRes.count ?? 0,
    failedLogins: failedRes.count ?? 0,
    totalSecurityEvents: eventsRes.count ?? 0,
    recentActivity: recentRes.count ?? 0,
  }
}

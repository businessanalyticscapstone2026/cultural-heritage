"use server"

import {
  logLoginAttempt,
  checkLoginRateLimit,
  updateLastLogin,
  logAuditEvent,
  logSecurityEvent,
  getAuditLogs,
  getLoginAttempts,
  getSecurityEvents,
  getAuditStats,
} from "../services"
import type { AuditCategory, AuditFilters, LoginOutcome } from "@/types/audit"

export async function logLoginAttemptAction(params: {
  email: string
  outcome: LoginOutcome
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    return await logLoginAttempt(params)
  } catch (e) {
    console.error("logLoginAttemptAction failed:", e)
  }
}

export async function checkLoginRateLimitAction(email: string) {
  try {
    const result = await checkLoginRateLimit(email)
    return { allowed: !result.locked, ...result }
  } catch (e) {
    console.error("checkLoginRateLimitAction failed:", e)
    return { allowed: true, locked: false, remainingAttempts: 5 }
  }
}

export async function updateLastLoginAction(userId: string) {
  try {
    return await updateLastLogin(userId)
  } catch (e) {
    console.error("updateLastLoginAction failed:", e)
  }
}

export async function logAuditEventAction(params: {
  category: AuditCategory
  action: string
  targetType?: string
  targetId?: string
  detail?: Record<string, unknown>
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  return logAuditEvent(params)
}

export async function logSecurityEventAction(params: {
  eventType: string
  detail?: string
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  return logSecurityEvent(params)
}

export async function getAuditLogsAction(filters?: AuditFilters) {
  return getAuditLogs(filters)
}

export async function getLoginAttemptsAction(filters?: {
  userId?: string | null
  startDate?: string | null
  endDate?: string | null
  outcome?: LoginOutcome | null
}) {
  return getLoginAttempts(filters)
}

export async function getSecurityEventsAction(filters?: {
  userId?: string | null
  startDate?: string | null
  endDate?: string | null
  eventType?: string | null
}) {
  return getSecurityEvents(filters)
}

export async function getAuditStatsAction() {
  return getAuditStats()
}

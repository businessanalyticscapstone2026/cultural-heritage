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
  return logLoginAttempt(params)
}

export async function checkLoginRateLimitAction(email: string) {
  const result = await checkLoginRateLimit(email)
  return { allowed: !result.locked, ...result }
}

export async function updateLastLoginAction(userId: string) {
  return updateLastLogin(userId)
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

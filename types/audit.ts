export type LoginOutcome = "success" | "failed_password" | "failed_locked" | "failed_unknown_account"

export type AuditCategory = "heritage" | "governance" | "municipality" | "user_management" | "settings" | "media" | "system"

export interface LoginAttempt {
  id: string
  userId: string | null
  emailAttempted: string
  outcome: LoginOutcome
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string | null
  category: AuditCategory
  action: string
  targetType: string | null
  targetId: string | null
  detail: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface SecurityEvent {
  id: string
  userId: string | null
  eventType: string
  detail: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLogWithUser extends AuditLog {
  userName: string | null
  userEmail: string | null
}

export interface LoginAttemptWithUser extends LoginAttempt {
  userName: string | null
}

export interface SecurityEventWithUser extends SecurityEvent {
  userName: string | null
  userEmail: string | null
}

export interface AuditStats {
  totalLogs: number
  totalLogins: number
  failedLogins: number
  totalSecurityEvents: number
  recentActivity: number
}

export interface AuditFilters {
  category?: AuditCategory | null
  userId?: string | null
  startDate?: string | null
  endDate?: string | null
  search?: string | null
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { ScrollText, LogIn, ShieldAlert } from "lucide-react"
import { getAuditStatsAction, getAuditLogsAction, getLoginAttemptsAction, getSecurityEventsAction } from "../actions"
import AuditStatsOverview from "./audit-stats-overview"
import AuditLogsTable from "./audit-logs-table"
import LoginAttemptsTable from "./login-attempts-table"
import SecurityEventsTable from "./security-events-table"
import type { AuditStats, AuditLogWithUser, LoginAttemptWithUser, SecurityEventWithUser, AuditCategory, LoginOutcome } from "@/types/audit"

type TabKey = "audit_logs" | "login_attempts" | "security_events"

interface AuditTrailClientProps {
  initialStats: AuditStats
  initialLogs: AuditLogWithUser[]
  initialAttempts: LoginAttemptWithUser[]
  initialEvents: SecurityEventWithUser[]
}

export default function AuditTrailClient({
  initialStats,
  initialLogs,
  initialAttempts,
  initialEvents,
}: AuditTrailClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("audit_logs")
  const [stats, setStats] = useState<AuditStats>(initialStats)
  const [logs, setLogs] = useState<AuditLogWithUser[]>(initialLogs)
  const [attempts, setAttempts] = useState<LoginAttemptWithUser[]>(initialAttempts)
  const [events, setEvents] = useState<SecurityEventWithUser[]>(initialEvents)

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | "">("")
  const [outcomeFilter, setOutcomeFilter] = useState<LoginOutcome | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchTabData = useCallback(async () => {
    if (activeTab === "audit_logs") {
      const data = await getAuditLogsAction({
        category: categoryFilter || undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setLogs(data)
    } else if (activeTab === "login_attempts") {
      const data = await getLoginAttemptsAction({
        outcome: outcomeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setAttempts(data)
    } else {
      const data = await getSecurityEventsAction({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setEvents(data)
    }
  }, [activeTab, categoryFilter, outcomeFilter, search, startDate, endDate])

  useEffect(() => {
    fetchTabData()
  }, [fetchTabData])

  const handleRefreshStats = useCallback(async () => {
    const newStats = await getAuditStatsAction()
    setStats(newStats)
  }, [])

  return (
    <div className="space-y-6">
      <AuditStatsOverview stats={stats} />

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("audit_logs")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "audit_logs"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ScrollText className="size-4" />
          Audit Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("login_attempts")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "login_attempts"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LogIn className="size-4" />
          Login Attempts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security_events")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "security_events"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="size-4" />
          Security Events
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {activeTab === "audit_logs" && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AuditCategory | "")}
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All Categories</option>
              <option value="heritage">Heritage</option>
              <option value="governance">Governance</option>
              <option value="municipality">Municipality</option>
              <option value="user_management">User Management</option>
              <option value="settings">Settings</option>
              <option value="media">Media</option>
              <option value="system">System</option>
            </select>
          </div>
        )}

        {activeTab === "login_attempts" && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Outcome</label>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as LoginOutcome | "")}
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All Outcomes</option>
              <option value="success">Success</option>
              <option value="failed_password">Wrong Password</option>
              <option value="failed_locked">Locked Out</option>
              <option value="failed_unknown_account">Unknown Account</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {activeTab === "audit_logs" && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, targets..."
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleRefreshStats}
          className="h-9 rounded-lg border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
        >
          Refresh
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "audit_logs" && <AuditLogsTable logs={logs} />}
      {activeTab === "login_attempts" && <LoginAttemptsTable attempts={attempts} />}
      {activeTab === "security_events" && <SecurityEventsTable events={events} />}
    </div>
  )
}

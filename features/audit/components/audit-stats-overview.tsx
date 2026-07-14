"use client"

import { ShieldCheck, Users, AlertTriangle, Activity, Clock } from "lucide-react"
import type { AuditStats } from "@/types/audit"

interface AuditStatsOverviewProps {
  stats: AuditStats
}

const statCards = [
  {
    key: "totalLogs" as const,
    label: "Audit Logs",
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "totalLogins" as const,
    label: "Successful Logins",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "failedLogins" as const,
    label: "Failed Logins",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "totalSecurityEvents" as const,
    label: "Security Events",
    icon: Activity,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    key: "recentActivity" as const,
    label: "Last 24 Hours",
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

export default function AuditStatsOverview({ stats }: AuditStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground">{stats[card.key].toLocaleString()}</p>
              <p className="text-xs text-muted-foreground truncate">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

import { getAuditStats, getAuditLogs, getLoginAttempts, getSecurityEvents } from "@/features/audit/services"
import AuditTrailClient from "@/features/audit/components/audit-trail-client"

export default async function AuditTrailPage() {
  const [stats, logs, attempts, events] = await Promise.all([
    getAuditStats(),
    getAuditLogs(),
    getLoginAttempts(),
    getSecurityEvents(),
  ])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Audit Trail & Security</h1>
        <p className="mt-1 text-sm opacity-80">
          Monitor login activity, audit logs, and security events across the system
        </p>
      </div>

      <AuditTrailClient
        initialStats={stats}
        initialLogs={logs}
        initialAttempts={attempts}
        initialEvents={events}
      />
    </div>
  )
}

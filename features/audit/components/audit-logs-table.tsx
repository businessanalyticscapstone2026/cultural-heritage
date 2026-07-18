"use client"

import { ScrollText } from "lucide-react"
import type { AuditLogWithUser } from "@/types/audit"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

interface AuditLogsTableProps {
  logs: AuditLogWithUser[]
}

const categoryColors: Record<string, string> = {
  heritage: "bg-blue-100 text-blue-800",
  governance: "bg-purple-100 text-purple-800",
  municipality: "bg-green-100 text-green-800",
  user_management: "bg-orange-100 text-orange-800",
  settings: "bg-gray-100 text-gray-800",
  media: "bg-pink-100 text-pink-800",
  system: "bg-red-100 text-red-800",
}

export default function AuditLogsTable({ logs }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <ScrollText className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">No audit logs found</p>
        <p className="text-xs text-muted-foreground">Audit events will appear here once the migration is applied</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Target</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">{log.userName ?? "System"}</div>
                  <div className="text-xs text-muted-foreground">{log.userEmail ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[log.category] ?? "bg-gray-100 text-gray-800"}`}>
                    {log.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{log.action}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {log.targetType && (
                    <span>
                      {log.targetType}
                      {log.targetId && <span className="ml-1 font-mono text-[10px]">({log.targetId.slice(0, 8)}...)</span>}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                  {log.detail ? JSON.stringify(log.detail) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

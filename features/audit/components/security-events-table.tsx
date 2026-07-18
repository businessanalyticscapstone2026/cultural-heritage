"use client"

import { ShieldAlert } from "lucide-react"
import type { SecurityEventWithUser } from "@/types/audit"

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

interface SecurityEventsTableProps {
  events: SecurityEventWithUser[]
}

export default function SecurityEventsTable({ events }: SecurityEventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">No security events found</p>
        <p className="text-xs text-muted-foreground">Security events will appear here once the migration is applied</p>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Event Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Detail</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(event.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {event.eventType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{event.userName ?? "System"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[250px] truncate">{event.detail ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{event.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

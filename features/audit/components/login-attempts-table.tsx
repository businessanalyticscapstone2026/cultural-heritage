"use client"

import { LogIn } from "lucide-react"
import type { LoginAttemptWithUser, LoginOutcome } from "@/types/audit"

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

interface LoginAttemptsTableProps {
  attempts: LoginAttemptWithUser[]
}

const outcomeLabels: Record<LoginOutcome, string> = {
  success: "Success",
  failed_password: "Wrong Password",
  failed_locked: "Locked Out",
  failed_unknown_account: "Unknown Account",
}

const outcomeColors: Record<LoginOutcome, string> = {
  success: "bg-green-100 text-green-800",
  failed_password: "bg-red-100 text-red-800",
  failed_locked: "bg-orange-100 text-orange-800",
  failed_unknown_account: "bg-yellow-100 text-yellow-800",
}

export default function LoginAttemptsTable({ attempts }: LoginAttemptsTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <LogIn className="mx-auto size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No login attempts found</p>
        <p className="text-xs text-muted-foreground/60">Login activity will appear here once the migration is applied</p>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Outcome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(attempt.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground font-mono text-xs">{attempt.emailAttempted}</td>
                <td className="px-4 py-3 text-sm text-foreground">{attempt.userName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${outcomeColors[attempt.outcome]}`}>
                    {outcomeLabels[attempt.outcome]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{attempt.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

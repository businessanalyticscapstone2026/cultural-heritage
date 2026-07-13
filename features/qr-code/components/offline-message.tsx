"use client"

import { WifiOff } from "lucide-react"

export function OfflineMessage() {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 p-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <WifiOff className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-heading">No internet connection</p>
            <p className="text-xs text-muted-foreground">
              Reconnect to scan QR codes and view site details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

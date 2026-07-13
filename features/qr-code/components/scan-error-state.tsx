"use client"

import { AlertTriangle, RefreshCw, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScanErrorStateProps {
  message: string
  onRetry: () => void
  onManualEntry: () => void
}

export function ScanErrorState({ message, onRetry, onManualEntry }: ScanErrorStateProps) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 p-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-heading">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="sm" onClick={onManualEntry} className="gap-2">
            <Keyboard className="size-4" />
            Enter manually
          </Button>
          <Button size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}

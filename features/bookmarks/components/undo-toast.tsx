"use client"

import { Undo2 } from "lucide-react"

interface UndoToastProps {
  siteName: string
  onUndo: () => void
  onDismiss: () => void
}

export function UndoToast({ siteName, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-heading">{siteName}</span> removed
        </p>
        <button
          onClick={onUndo}
          className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Undo2 className="size-3" />
          Undo
        </button>
        <button
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-heading"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

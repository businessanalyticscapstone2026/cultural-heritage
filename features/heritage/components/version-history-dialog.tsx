"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2Icon, RotateCcwIcon, ClockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { HeritageSiteVersion } from "../types"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteName: string
  versions: HeritageSiteVersion[]
  onRestore: (versionId: string) => Promise<void>
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  status_changed: "Status Changed",
}

const CHANGE_TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  created: "default",
  updated: "secondary",
  status_changed: "outline",
}

export default function VersionHistoryDialog({
  open,
  onOpenChange,
  siteName,
  versions,
  onRestore,
}: VersionHistoryDialogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setExpandedId(null)
      setRestoringId(null)
    }
  }, [open])

  const handleRestore = useCallback(async (versionId: string) => {
    setRestoringId(versionId)
    try {
      await onRestore(versionId)
      onOpenChange(false)
    } catch {
      // Error handled by parent
    } finally {
      setRestoringId(null)
    }
  }, [onRestore, onOpenChange])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>{siteName}</DialogDescription>
        </DialogHeader>

        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ClockIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No version history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="rounded-lg border bg-muted/30 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={CHANGE_TYPE_VARIANTS[version.changeType] ?? "secondary"}>
                        {CHANGE_TYPE_LABELS[version.changeType] ?? version.changeType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {version.changedBy ? `By: ${version.changedBy.slice(0, 8)}...` : "System"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setExpandedId(expandedId === version.id ? null : version.id)}
                    >
                      <ClockIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRestore(version.id)}
                      disabled={restoringId === version.id}
                    >
                      {restoringId === version.id ? (
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcwIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedId === version.id && (
                  <div className="mt-3 rounded-md bg-background p-3 text-xs font-mono overflow-auto max-h-48">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(version.snapshot, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

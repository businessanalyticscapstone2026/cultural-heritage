"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import { getMunicipalityAuditLogAction } from "../actions/municipality"
import type { MunicipalityAuditLog } from "../types"

type AuditLogDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  municipalityId: string
  municipalityName: string
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  created: "default",
  status_changed: "secondary",
  updated: "outline",
}

export function AuditLogDialog({
  open,
  onOpenChange,
  municipalityId,
  municipalityName,
}: AuditLogDialogProps) {
  const [logs, setLogs] = useState<MunicipalityAuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open || loadedRef.current === municipalityId) return

    let cancelled = false
    setLoading(true)

    getMunicipalityAuditLogAction(municipalityId)
      .then((data) => {
        if (!cancelled) {
          setLogs(data)
          loadedRef.current = municipalityId
        }
      })
      .catch(() => {
        if (!cancelled) setLogs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [open, municipalityId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Audit Log — {municipalityName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <History className="mb-2 size-8" />
            <p className="text-sm">No audit records yet</p>
          </div>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={ACTION_VARIANT[log.action] ?? "outline"}>
                    {log.action.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                {log.action === "status_changed" && (
                  <p className="text-xs text-muted-foreground">
                    Status: {String(log.previous_value?.status)} → {String(log.new_value?.status)}
                  </p>
                )}
                {log.action === "updated" && (
                  <p className="text-xs text-muted-foreground">
                    Updated: {Object.keys(log.new_value).join(", ")}
                  </p>
                )}
                {log.action === "created" && (
                  <p className="text-xs text-muted-foreground">
                    Municipality registered
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

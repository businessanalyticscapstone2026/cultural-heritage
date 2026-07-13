"use client"

import { useState, useCallback } from "react"
import { Database, Loader2, Clock, HardDrive } from "lucide-react"
import type { HeritageBackup } from "../types"

interface BackupPanelProps {
  backups: HeritageBackup[]
  onCreateBackup: (options?: { name?: string }) => Promise<void>
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—"
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function BackupPanel({ backups, onCreateBackup }: BackupPanelProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = useCallback(async () => {
    setIsCreating(true)
    try {
      await onCreateBackup()
    } finally {
      setIsCreating(false)
    }
  }, [onCreateBackup])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {backups.length} backup{backups.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Database className="size-4" />
          )}
          Create Backup
        </button>
      </div>

      {backups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <HardDrive className="mb-3 size-10" />
          <p className="text-sm">No backups yet</p>
          <p className="text-xs mt-1">Create your first backup to protect your heritage data</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Size</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Records</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{backup.backupName ?? "Unnamed"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                      {backup.type ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatBytes(backup.sizeBytes)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{backup.recordsCount ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      backup.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : backup.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {backup.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3.5" />
                      {formatDate(backup.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react"
import { RotateCcwIcon, SearchIcon, EyeIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/confirm-dialog"
import HeritageDetailPanel from "./heritage-detail-panel"
import type { HeritageSite } from "../types"

interface ArchiveListProps {
  sites: HeritageSite[]
  onRestore: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function ArchiveList({ sites, onRestore, onDelete }: ArchiveListProps) {
  const [search, setSearch] = useState("")
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<HeritageSite | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HeritageSite | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewTarget, setViewTarget] = useState<HeritageSite | null>(null)

  const filtered = sites.filter((site) =>
    site.siteName.toLowerCase().includes(search.toLowerCase()) ||
    (site.municipalityName ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const handleRestore = async (id: string) => {
    setRestoringId(id)
    try {
      await onRestore(id)
    } finally {
      setRestoringId(null)
    }
  }

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return
    await handleRestore(restoreTarget.id)
    setRestoreTarget(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      await onDelete(deleteTarget.id)
      notifySuccess(`"${deleteTarget.siteName}" permanently deleted.`)
      setDeleteTarget(null)
    } catch (error) {
      notifyError(errorReason(error, "Failed to delete site. Please try again."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search archived sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground">
          <p className="text-sm">No archived heritage sites</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Site Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Municipality</th>
                <th className="px-4 py-3 text-left font-medium">Last Updated</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((site) => (
                <tr key={site.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{site.siteName}</td>
                  <td className="px-4 py-3">
                    {site.category ? (
                      <Badge variant="secondary">{site.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{site.municipalityName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(site.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="View"
                        onClick={() => setViewTarget(site)}
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Restore to Draft"
                        onClick={() => setRestoreTarget(site)}
                        disabled={restoringId === site.id || deletingId === site.id}
                      >
                        {restoringId === site.id ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcwIcon className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete Permanently"
                        onClick={() => setDeleteTarget(site)}
                        disabled={restoringId === site.id || deletingId === site.id}
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Restore Confirmation */}
      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restore heritage site?"
        description={
          restoreTarget ? (
            <>
              "{restoreTarget.siteName}" will be restored to the heritage sites list
              as a draft.
            </>
          ) : null
        }
        confirmLabel="Restore"
        isConfirming={restoringId !== null}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setRestoreTarget(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete heritage site?"
        description={
          deleteTarget ? (
            <>
              Are you sure you want to permanently delete "{deleteTarget.siteName}"?
              This action cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deletingId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* View (Read-only) */}
      <HeritageDetailPanel
        site={viewTarget}
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        readOnly
      />
    </div>
  )
}

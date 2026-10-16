/* eslint-disable react/no-unescaped-entities */
"use client"

import { useCallback, useMemo, useState } from "react"
import { RotateCcwIcon, SearchIcon, EyeIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import ConfirmDialog from "@/components/confirm-dialog"
import HeritageDetailPanel from "./heritage-detail-panel"
import type { BatchDeleteSiteResult } from "../actions/mto-sites"
import type { HeritageSite } from "../types"

interface ArchiveListProps {
  sites: HeritageSite[]
  onRestore: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<{ ok: boolean; reason?: string }>
  onDeleteMany: (ids: string[]) => Promise<BatchDeleteSiteResult>
}

function formatFailureSummary(failed: BatchDeleteSiteResult["failed"], sites: HeritageSite[]): string {
  const parts = failed.slice(0, 5).map((f) => {
    const name = sites.find((s) => s.id === f.id)?.siteName ?? f.id.slice(0, 8)
    return `"${name}": ${f.reason}`
  })
  const extra = failed.length > 5 ? ` (+${failed.length - 5} more)` : ""
  return parts.join(" · ") + extra
}

function matchesSearch(site: HeritageSite, query: string): boolean {
  const q = query.toLowerCase()
  return (
    site.siteName.toLowerCase().includes(q) ||
    (site.municipalityName ?? "").toLowerCase().includes(q)
  )
}

export default function ArchiveList({ sites, onRestore, onDelete, onDeleteMany }: ArchiveListProps) {
  const [search, setSearch] = useState("")
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<HeritageSite | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HeritageSite | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewTarget, setViewTarget] = useState<HeritageSite | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchTarget, setBatchTarget] = useState<HeritageSite[] | null>(null)
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)

  const filtered = useMemo(() => sites.filter((site) => matchesSearch(site, search)), [sites, search])

  // The effective selection is always derived as `selectedIds ∩ visible rows`,
  // so a selected id can never point at a hidden or deleted row. `selectedIds`
  // is pruned on search and on delete; stale ids from an external refetch are
  // inert because only `selectedSites` (below) feeds the toolbar and delete.
  const selectedSites = useMemo(
    () => filtered.filter((s) => selectedIds.has(s.id)),
    [filtered, selectedIds]
  )

  const allVisibleSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id))
  const someVisibleSelected = filtered.some((s) => selectedIds.has(s.id))
  const anyDeleting = isBatchDeleting || deletingId !== null

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setSelectedIds((prev) => {
      const visible = new Set(sites.filter((s) => matchesSearch(s, value)).map((s) => s.id))
      const next = new Set([...prev].filter((id) => visible.has(id)))
      return next.size === prev.size ? prev : next
    })
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filtered.forEach((s) => next.delete(s.id))
      } else {
        filtered.forEach((s) => next.add(s.id))
      }
      return next
    })
  }, [allVisibleSelected, filtered])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

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
      const result = await onDelete(deleteTarget.id)
      if (result.ok) {
        notifySuccess(`"${deleteTarget.siteName}" permanently deleted.`)
        setSelectedIds((prev) => new Set([...prev].filter((id) => id !== deleteTarget.id)))
      } else {
        notifyError(result.reason ?? "Failed to delete site. Please try again.")
      }
      setDeleteTarget(null)
    } catch (error) {
      notifyError(errorReason(error, "Failed to delete site. Please try again."))
    } finally {
      setDeletingId(null)
    }
  }

  const handleBatchDeleteConfirm = async () => {
    const targets = batchTarget
    if (!targets || targets.length === 0) return
    setIsBatchDeleting(true)
    try {
      const result = await onDeleteMany(targets.map((s) => s.id))
      const deletedCount = result.deleted.length
      const failedCount = result.failed.length

      if (failedCount === 0) {
        notifySuccess(`${deletedCount} ${deletedCount === 1 ? "site" : "sites"} permanently deleted.`)
      } else if (deletedCount === 0) {
        notifyError(`No sites were deleted. ${formatFailureSummary(result.failed, sites)}`)
      } else {
        notifyError(
          `${deletedCount} deleted, ${failedCount} failed. ${formatFailureSummary(result.failed, sites)}`
        )
      }

      const deletedIds = new Set(result.deleted.map((d) => d.id))
      setSelectedIds((prev) => new Set([...prev].filter((id) => !deletedIds.has(id))))
      setBatchTarget(null)
    } catch (error) {
      notifyError(errorReason(error, "Failed to delete sites. Please try again."))
    } finally {
      setIsBatchDeleting(false)
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {selectedSites.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">{selectedSites.length} selected</span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBatchTarget(selectedSites)}
              disabled={anyDeleting}
            >
              <Trash2Icon className="size-3.5" />
              Delete selected
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection} disabled={anyDeleting}>
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground">
          <p className="text-sm">No archived heritage sites</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    onCheckedChange={() => toggleSelectAll()}
                    disabled={anyDeleting}
                    aria-label={allVisibleSelected ? "Deselect all visible sites" : "Select all visible sites"}
                  />
                </th>
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
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(site.id)}
                      onCheckedChange={() => toggleSelect(site.id)}
                      disabled={anyDeleting || restoringId === site.id}
                      aria-label={`Select ${site.siteName}`}
                    />
                  </td>
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
                        disabled={anyDeleting}
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Restore to Draft"
                        onClick={() => setRestoreTarget(site)}
                        disabled={restoringId === site.id || deletingId === site.id || isBatchDeleting}
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
                        disabled={restoringId === site.id || deletingId === site.id || isBatchDeleting}
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

      {/* Single Delete Confirmation */}
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

      {/* Batch Delete Confirmation */}
      <ConfirmDialog
        open={batchTarget !== null}
        title={`Delete ${batchTarget?.length ?? 0} ${(batchTarget?.length ?? 0) === 1 ? "site" : "sites"}?`}
        description={
          batchTarget ? (
            <>
              Are you sure you want to permanently delete these archived sites?
              This action cannot be undone.
              <ul className="mt-2 space-y-1 text-left">
                {batchTarget.slice(0, 5).map((site) => (
                  <li key={site.id}>• {site.siteName}</li>
                ))}
                {batchTarget.length > 5 && <li>… and {batchTarget.length - 5} more</li>}
              </ul>
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={isBatchDeleting}
        onConfirm={handleBatchDeleteConfirm}
        onCancel={() => setBatchTarget(null)}
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

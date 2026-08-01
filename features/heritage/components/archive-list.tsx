"use client"

import { useState } from "react"
import { RotateCcwIcon, SearchIcon, EyeIcon, Loader2Icon, Trash2Icon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { HeritageSite } from "../types"

interface ArchiveListProps {
  sites: HeritageSite[]
  onRestore: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function ArchiveList({ sites, onRestore, onDelete }: ArchiveListProps) {
  const [search, setSearch] = useState("")
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HeritageSite | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    setDeleteError(null)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete site")
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
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Restore to Draft"
                        onClick={() => handleRestore(site.id)}
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
                        onClick={() => { setDeleteTarget(site); setDeleteError(null) }}
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

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm deletion"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Delete heritage site</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Are you sure you want to permanently delete{" "}
                  <strong>{deleteTarget.siteName}</strong>? This action cannot be undone
                  and the site will be removed permanently.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deletingId !== null}>
                {deletingId !== null ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

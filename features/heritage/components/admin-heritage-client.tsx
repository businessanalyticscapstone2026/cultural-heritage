"use client"

import { useState, useCallback } from "react"
import { Landmark, Plus, Search } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import {
  createHeritageSiteAction,
  updateHeritageSiteAction,
  deleteHeritageSiteAction,
  getHeritageSiteVersionsAction,
  restoreHeritageSiteVersionAction,
} from "../actions/heritage"
import { useHeritageSites } from "../hooks"
import HeritageSiteForm from "./heritage-site-form"
import VersionHistoryDialog from "./version-history-dialog"
import type { HeritageSite, HeritageCategory, HeritageSiteVersion } from "../types"

interface AdminHeritageClientProps {
  initialSites: HeritageSite[]
  categories: HeritageCategory[]
  municipalities: { id: string; name: string }[]
}

export default function AdminHeritageClient({
  initialSites,
  categories,
  municipalities,
}: AdminHeritageClientProps) {
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterMunicipality, setFilterMunicipality] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<HeritageSite | null>(null)
  const [versionSite, setVersionSite] = useState<HeritageSite | null>(null)
  const [versions, setVersions] = useState<HeritageSiteVersion[]>([])
  const [versionOpen, setVersionOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSites = useCallback(async () => {
    const { getHeritageSitesAction } = await import("../actions/heritage")
    return getHeritageSitesAction()
  }, [])

  const { sites, refetch } = useHeritageSites(fetchSites)
  const displaySites = sites.length > 0 ? sites : initialSites

  const filtered = displaySites.filter((site) => {
    if (search && !site.siteName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && site.categoryId !== filterCategory) return false
    if (filterMunicipality && site.municipalityId !== filterMunicipality) return false
    if (filterStatus && site.publicationStatus !== filterStatus) return false
    return true
  })

  const handleCreate = useCallback(async (data: Partial<HeritageSite>) => {
    await createHeritageSiteAction(data)
    refetch()
  }, [refetch])

  const handleUpdate = useCallback(async (id: string, data: Partial<HeritageSite>) => {
    await updateHeritageSiteAction(id, data)
    refetch()
  }, [refetch])

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      await deleteHeritageSiteAction(id)
      notifySuccess("Heritage site deleted.")
      refetch()
    } catch (err) {
      notifyError(errorReason(err, "Failed to delete heritage site. Please try again."))
    } finally {
      setDeletingId(null)
    }
  }, [refetch])

  const handleFetchVersions = useCallback(async (siteId: string) => {
    return getHeritageSiteVersionsAction(siteId)
  }, [])

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    try {
      await restoreHeritageSiteVersionAction(versionId)
      notifySuccess("Heritage site version restored.")
      refetch()
    } catch (err) {
      notifyError(errorReason(err, "Failed to restore version. Please try again."))
    }
  }, [refetch])

  const handleViewVersions = useCallback(async (site: HeritageSite) => {
    setVersionSite(site)
    const v = await handleFetchVersions(site.id)
    setVersions(v)
    setVersionOpen(true)
  }, [handleFetchVersions])

  const handleArchive = useCallback(async (site: HeritageSite) => {
    try {
      await updateHeritageSiteAction(site.id, { publicationStatus: "archived" })
      notifySuccess(`"${site.siteName}" has been archived.`)
      refetch()
    } catch (err) {
      notifyError(errorReason(err, "Failed to archive site. Please try again."))
    }
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Heritage Repository</h1>
        <p className="mt-1 text-sm opacity-80">
          Manage all heritage sites across the First District of Batangas
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-9 pr-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={filterMunicipality}
            onChange={(e) => setFilterMunicipality(e.target.value)}
          >
            <option value="">All Municipalities</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => { setEditingSite(null); setFormOpen(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add Site
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} heritage site{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Landmark className="mb-3 size-10" />
          <p className="text-sm">No heritage sites found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Site Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Municipality</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rating</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((site) => (
                <tr key={site.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{site.siteName}</span>
                      {site.isFeatured && <span className="text-yellow-500 text-xs">★</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {site.category ? (
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: site.category.color ? `${site.category.color}15` : undefined, borderColor: site.category.color ?? undefined }}
                      >
                        {site.category.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{site.municipalityName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      site.publicationStatus === "published"
                        ? "bg-green-100 text-green-800"
                        : site.publicationStatus === "archived"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {site.publicationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {site.averageRating > 0
                      ? `${site.averageRating.toFixed(1)} (${site.reviewCount})`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingSite(site); setFormOpen(true) }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Edit"
                      >
                        <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewVersions(site)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Version History"
                      >
                        <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </button>
                      {site.publicationStatus !== "archived" && (
                        <button
                          type="button"
                          onClick={() => handleArchive(site)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Archive"
                        >
                          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(site.id)}
                        disabled={deletingId === site.id}
                        className="rounded-md p-1.5 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                        title="Delete"
                      >
                        <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <HeritageSiteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        site={editingSite}
        categories={categories}
        municipalities={municipalities}
        onSubmit={editingSite ? (data) => handleUpdate(editingSite.id, data) : handleCreate}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={versionOpen}
        onOpenChange={setVersionOpen}
        siteName={versionSite?.siteName ?? ""}
        versions={versions}
        onRestore={handleRestoreVersion}
      />
    </div>
  )
}

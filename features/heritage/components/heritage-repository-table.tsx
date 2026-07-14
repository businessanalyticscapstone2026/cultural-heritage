"use client"

import { useState, useMemo } from "react"
import { Landmark, Search, Send } from "lucide-react"
import type { HeritageSite, HeritageCategory, HeritageSiteVersion } from "../types"
import HeritageSiteForm from "./heritage-site-form"
import VersionHistoryDialog from "./version-history-dialog"

interface HeritageRepositoryTableProps {
  sites: HeritageSite[]
  categories: HeritageCategory[]
  municipalities: { id: string; name: string }[]
  onCreateSite: (data: Partial<HeritageSite>) => Promise<void>
  onUpdateSite: (id: string, data: Partial<HeritageSite>) => Promise<void>
  onDeleteSite: (id: string) => Promise<void>
  onFetchVersions: (siteId: string) => Promise<HeritageSiteVersion[]>
  onRestoreVersion: (versionId: string) => Promise<void>
  onSubmitForReview?: (siteId: string, versionId: string) => Promise<void>
}

export default function HeritageRepositoryTable({
  sites,
  categories,
  municipalities,
  onCreateSite,
  onUpdateSite,
  onDeleteSite,
  onFetchVersions,
  onRestoreVersion,
  onSubmitForReview,
}: HeritageRepositoryTableProps) {
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
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return sites.filter((site) => {
      if (search && !site.siteName.toLowerCase().includes(search.toLowerCase())) return false
      if (filterCategory && site.categoryId !== filterCategory) return false
      if (filterMunicipality && site.municipalityId !== filterMunicipality) return false
      if (filterStatus && site.publicationStatus !== filterStatus) return false
      return true
    })
  }, [sites, search, filterCategory, filterMunicipality, filterStatus])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDeleteSite(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewVersions = async (site: HeritageSite) => {
    setVersionSite(site)
    const v = await onFetchVersions(site.id)
    setVersions(v)
    setVersionOpen(true)
  }

  const handleSubmitForReview = async (site: HeritageSite) => {
    if (!onSubmitForReview) return
    setSubmittingId(site.id)
    try {
      const v = await onFetchVersions(site.id)
      const latestVersion = v[0]
      if (latestVersion) {
        await onSubmitForReview(site.id, latestVersion.id)
      }
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="space-y-4">
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
        <button
          type="button"
          onClick={() => { setEditingSite(null); setFormOpen(true) }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Site
        </button>
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
                      {onSubmitForReview && site.publicationStatus === "draft" && (
                        <button
                          type="button"
                          onClick={() => handleSubmitForReview(site)}
                          disabled={submittingId === site.id}
                          className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                          title="Submit for Review"
                        >
                          <Send className="size-3" />
                          Submit
                        </button>
                      )}
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
                          onClick={() => onUpdateSite(site.id, { publicationStatus: "archived" })}
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
        onSubmit={editingSite ? (data) => onUpdateSite(editingSite.id, data) : onCreateSite}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={versionOpen}
        onOpenChange={setVersionOpen}
        siteName={versionSite?.siteName ?? ""}
        versions={versions}
        onRestore={onRestoreVersion}
      />
    </div>
  )
}

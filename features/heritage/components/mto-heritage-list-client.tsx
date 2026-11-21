/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  MoreHorizontalIcon,
  ArchiveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmDialog from "@/components/confirm-dialog"
import type { SiteWithDetails } from "../services/mto-sites"
import HeritageDetailPanel from "./heritage-detail-panel"

interface MtoHeritageListClientProps {
  initialSites: SiteWithDetails[]
  kpiCounts: { total: number; published: number; draft: number; archived: number }
  categories: { id: string; name: string; color: string | null }[]
}

const PAGE_SIZE = 10

export default function MtoHeritageListClient({
  initialSites,
  kpiCounts,
  categories,
}: MtoHeritageListClientProps) {
  const [sites, setSites] = useState<SiteWithDetails[]>(initialSites)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedSite, setSelectedSite] = useState<SiteWithDetails | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<SiteWithDetails | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const statusCounts = useMemo(() => {
    const total = sites.length
    const published = sites.filter((s) => s.publicationStatus === "published").length
    const draft = sites.filter((s) => s.publicationStatus === "draft").length
    return { total, published, draft }
  }, [sites])

  const filtered = useMemo(() => {
    return sites.filter((site) => {
      if (search) {
        const q = search.toLowerCase()
        if (!site.siteName.toLowerCase().includes(q)) return false
      }
      if (statusFilter && site.publicationStatus !== statusFilter) return false
      if (categoryFilter && site.categoryId !== categoryFilter) return false
      return true
    })
  }, [sites, search, statusFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleArchive = useCallback((site: SiteWithDetails) => {
    setArchiveTarget(site)
  }, [])

  const confirmArchive = useCallback(async () => {
    if (!archiveTarget) return
    const site = archiveTarget
    setArchivingId(site.id)

    try {
      const { archiveMtoSiteAction } = await import("../actions/mto-sites")
      await archiveMtoSiteAction(site.id)
      setSites((prev) => prev.filter((s) => s.id !== site.id))
      notifySuccess(`"${site.siteName}" has been archived.`)
    } catch (err) {
      notifyError(errorReason(err, "Failed to archive site. Please try again."))
    } finally {
      setArchivingId(null)
      setArchiveTarget(null)
    }
  }, [archiveTarget])

  const openDetailPanel = useCallback((site: SiteWithDetails) => {
    setSelectedSite(site)
    setPanelOpen(true)
  }, [])

  const closeDetailPanel = useCallback(() => {
    setPanelOpen(false)
    setSelectedSite(null)
  }, [])

  const handleEdit = useCallback((site: SiteWithDetails) => {
    window.location.href = `/mto/heritage-sites/${site.id}/edit`
  }, [])

  const handleAddNew = useCallback(() => {
    window.location.href = "/mto/heritage-sites/new"
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Published</Badge>
      case "draft":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Draft</Badge>
      case "archived":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (site: SiteWithDetails) => {
    if (!site.category) return null
    return (
      <span
        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: site.category.color ? `${site.category.color}15` : undefined,
          borderColor: site.category.color ?? undefined,
          color: site.category.color ?? undefined,
        }}
      >
        {site.category.name}
      </span>
    )
  }

  const getThumbnail = (site: SiteWithDetails) => {
    const primary = site.media.find((m) => m.isPrimary && m.mediaType === "image")
    const anyImage = primary ?? site.media.find((m) => m.mediaType === "image")
    return anyImage?.fileUrl ?? null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Dashboard</span>
          <span className="text-muted-foreground/60">/</span>
          <span>Heritage Information Management</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">Heritage Sites</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Heritage Sites</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Heritage Sites</p>
          <p className="mt-1 text-3xl font-bold">{statusCounts.total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Published Sites</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{statusCounts.published}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Draft Sites</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{statusCounts.draft}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-9 pr-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="size-4 mr-1" />
            Filter
          </Button>
        </div>
        <Button size="sm" onClick={handleAddNew}>
          <PlusIcon className="size-4 mr-1" />
          Add New Site
        </Button>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground">
          <p className="text-sm">No heritage sites found</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Site Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date Added</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((site) => (
                <tr
                  key={site.id}
                  className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => openDetailPanel(site)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {getThumbnail(site) ? (
                          <Image
                            src={getThumbnail(site)!}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">No img</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{site.siteName}</p>
                        {site.isFeatured && <span className="text-yellow-500 text-[10px]">★ Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getCategoryBadge(site) ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[site.barangay, site.exactAddress].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(site.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(site.publicationStatus)}</td>
                  <td className="px-4 py-3 text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-xs">
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openDetailPanel(site)}>
                            <EyeIcon className="size-3.5" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(site)}>
                            <EditIcon className="size-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleArchive(site)}
                            disabled={archivingId === site.id}
                          >
                            <ArchiveIcon className="size-3.5" /> Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to{" "}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} sites
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground/60">...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                      p === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          <select
            className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
          >
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
        </div>
      </div>

      {/* Slide-in Detail Panel */}
      <HeritageDetailPanel
        site={selectedSite}
        open={panelOpen}
        onClose={closeDetailPanel}
        onEdit={handleEdit}
        onArchive={handleArchive}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        open={archiveTarget !== null}
        title="Archive heritage site?"
        description={
          archiveTarget ? (
            <>
              "{archiveTarget.siteName}" will be moved to the archive. You can restore
              it later from the Archive page.
            </>
          ) : null
        }
        confirmLabel="Archive"
        variant="destructive"
        isConfirming={archivingId !== null}
        onConfirm={confirmArchive}
        onCancel={() => {
          setArchiveTarget(null)
          setArchivingId(null)
        }}
      />
    </div>
  )
}

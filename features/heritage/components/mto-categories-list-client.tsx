/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useMemo, useCallback } from "react"
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  MoreHorizontalIcon,
  EyeIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/confirm-dialog"
import type { HeritageCategory } from "@/types/heritage"

interface CategoryWithSiteCount extends HeritageCategory {
  siteCount: number
}

interface MtoCategoriesListClientProps {
  initialCategories: CategoryWithSiteCount[]
}

const PAGE_SIZE = 10

export default function MtoCategoriesListClient({
  initialCategories,
}: MtoCategoriesListClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryWithSiteCount[]>(initialCategories)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithSiteCount | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithSiteCount | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return categories.filter((cat) => {
      if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && cat.status !== statusFilter) return false
      return true
    })
  }, [categories, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleDelete = useCallback(async (id: string) => {
    const cat = categories.find((c) => c.id === id)
    setDeletingId(id)
    setOpenMenuId(null)
    try {
      const { deleteCategoryAction } = await import("../actions/category")
      await deleteCategoryAction(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.error(`Category "${cat?.name ?? ""}" deleted.`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category. Please try again.",
      )
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }, [categories])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    handleDelete(deleteTarget.id)
  }, [deleteTarget, handleDelete])

  const handleAddNew = useCallback(() => {
    router.push("/mto/categories/new")
  }, [router])

  const handleEdit = useCallback((cat: CategoryWithSiteCount) => {
    router.push(`/mto/categories/${cat.id}/edit`)
  }, [router])

  const openDetailPanel = useCallback((cat: CategoryWithSiteCount) => {
    setSelectedCategory(cat)
    setPanelOpen(true)
    setOpenMenuId(null)
  }, [])

  const closeDetailPanel = useCallback(() => {
    setPanelOpen(false)
    setSelectedCategory(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Dashboard</span>
          <span className="text-muted-foreground/60">/</span>
          <span>Heritage Information Management</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">Categories</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Heritage Categories</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-9 pr-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon className="size-4 mr-1" />
            Filter
          </Button>
        </div>
        <Button size="sm" onClick={handleAddNew}>
          <PlusIcon className="size-4 mr-1" />
          Add New Category
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground">
          <p className="text-sm">No categories found</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Icon</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Color</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total Sites</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => openDetailPanel(cat)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.icon && <span className="text-lg">{cat.icon}</span>}
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                    {cat.description || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.icon || "—"}</td>
                  <td className="px-4 py-3">
                    {cat.color ? (
                      <div className="flex items-center gap-2">
                        <div className="size-4 rounded-full border" style={{ backgroundColor: cat.color }} />
                        <span className="font-mono text-xs text-muted-foreground">{cat.color}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{cat.siteCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.status === "active" ? "default" : "secondary"}>
                      {cat.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === cat.id ? null : cat.id)
                        }}
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                      {openMenuId === cat.id && (
                        <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border bg-popover shadow-md py-1">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                            onClick={() => openDetailPanel(cat)}
                          >
                            <EyeIcon className="size-3.5" /> View
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                            onClick={() => handleEdit(cat)}
                          >
                            <EditIcon className="size-3.5" /> Edit
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(cat)}
                            disabled={cat.siteCount > 0}
                          >
                            <span className="size-3.5 inline-flex items-center justify-center text-[10px]">✕</span>
                            Delete
                          </button>
                        </div>
                      )}
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
          Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)} to{" "}
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} categories
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
        </div>
      </div>

      {/* Slide-in Detail Panel */}
      <>
        {panelOpen && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={closeDetailPanel} />
        )}
        <div
          className={`fixed right-0 top-0 z-50 h-full w-[420px] max-w-full bg-background shadow-xl border-l transition-transform duration-300 ease-in-out ${
            panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedCategory && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <h2 className="text-base font-semibold">Category Details</h2>
                <button
                  type="button"
                  onClick={closeDetailPanel}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <XIcon className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Icon + Name */}
                <div className="flex items-center gap-4">
                  {selectedCategory.icon && (
                    <div className="size-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {selectedCategory.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCategory.name}</h3>
                    <Badge variant={selectedCategory.status === "active" ? "default" : "secondary"}>
                      {selectedCategory.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {selectedCategory.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                    <p className="text-sm">{selectedCategory.description}</p>
                  </div>
                )}

                {/* Color */}
                {selectedCategory.color && (
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg border" style={{ backgroundColor: selectedCategory.color }} />
                    <span className="font-mono text-sm text-muted-foreground">{selectedCategory.color}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Total Heritage Sites</p>
                    <p className="text-2xl font-bold mt-1">{selectedCategory.siteCount}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Display Order</p>
                    <p className="text-2xl font-bold mt-1">{selectedCategory.displayOrder ?? "—"}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Icon: {selectedCategory.icon || "—"}</p>
                  <p>Created: —</p>
                  <p>Last Updated: —</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => handleEdit(selectedCategory)}>
                    <EditIcon className="size-4 mr-1" />
                    Edit Category
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setDeleteTarget(selectedCategory)}
                    disabled={selectedCategory.siteCount > 0}
                  >
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete category?"
        description={
          deleteTarget ? (
            <>
              Are you sure you want to delete the category "{deleteTarget.name}"?
              This action cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

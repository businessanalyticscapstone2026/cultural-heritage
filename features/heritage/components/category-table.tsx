"use client"

import { useState, useCallback } from "react"
import { PencilIcon, Trash2Icon, Loader2Icon, MoreHorizontalIcon, GripVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { HeritageCategory } from "../types"
import CategoryForm from "./category-form"

interface CategoryTableProps {
  categories: (HeritageCategory & { siteCount: number })[]
  onCreate: (data: { name: string; description?: string; icon?: string; color?: string; displayOrder?: number }) => Promise<void>
  onUpdate: (id: string, updates: Partial<HeritageCategory>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CategoryTable({
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryTableProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<HeritageCategory | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
      setOpenMenuId(null)
    }
  }, [onDelete])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <Button onClick={() => { setEditingCategory(null); setFormOpen(true) }}>
          Add Category
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium w-8"></th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Color</th>
              <th className="px-4 py-3 text-left font-medium">Sites</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <GripVerticalIcon className="h-4 w-4 text-muted-foreground cursor-grab" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {cat.icon && <span className="text-lg">{cat.icon}</span>}
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {cat.color ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-muted-foreground">{cat.color}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">{cat.siteCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={cat.status === "active" ? "default" : "secondary"}>
                    {cat.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                    {openMenuId === cat.id && (
                      <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border bg-popover shadow-md py-1">
                        <button
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                          onClick={() => { setEditingCategory(cat); setFormOpen(true); setOpenMenuId(null) }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id || cat.siteCount > 0}
                        >
                          <Trash2Icon className="h-3.5 w-3.5" /> Delete
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

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSubmit={editingCategory
          ? async (data) => { await onUpdate(editingCategory.id, data as Partial<HeritageCategory>) }
          : async (data) => { await onCreate(data as { name: string; description?: string; icon?: string; color?: string; displayOrder?: number }) }
        }
      />
    </div>
  )
}

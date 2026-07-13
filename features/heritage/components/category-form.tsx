"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { categorySchema, type CategoryFormValues } from "../schemas/category"
import type { HeritageCategory } from "../types"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: HeritageCategory | null
  onSubmit: (data: CategoryFormValues) => Promise<void>
}

export default function CategoryForm({
  open,
  onOpenChange,
  category,
  onSubmit,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? null,
      icon: category?.icon ?? null,
      color: category?.color ?? null,
      displayOrder: category?.displayOrder ?? null,
      status: category?.status ?? "active",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        description: category?.description ?? null,
        icon: category?.icon ?? null,
        color: category?.color ?? null,
        displayOrder: category?.displayOrder ?? null,
        status: category?.status ?? "active",
      })
    }
  }, [open, category, form])

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger()
    if (!valid) return

    setIsSubmitting(true)
    try {
      await onSubmit(form.getValues())
      onOpenChange(false)
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }, [form, onSubmit, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g., Church, Heritage House" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Brief description of this category" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" {...form.register("icon")} placeholder="e.g., Church, Landmark" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input id="color" {...form.register("color")} placeholder="#6366f1" />
                <input
                  type="color"
                  className="h-8 w-8 rounded border cursor-pointer"
                  value={form.watch("color") ?? "#6366f1"}
                  onChange={(e) => form.setValue("color", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input id="displayOrder" type="number" {...form.register("displayOrder")} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...form.register("status")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <CheckIcon className="h-4 w-4 mr-1" />
            )}
            {category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

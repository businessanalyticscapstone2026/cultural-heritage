"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SaveIcon, Loader2Icon, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { categorySchema, type CategoryFormValues } from "../schemas/category"
import type { HeritageCategory } from "@/types/heritage"

type CategoryFormData = {
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  displayOrder?: number | null
  status?: string
}

interface MtoCategoryFormClientProps {
  category?: HeritageCategory | null
  onSubmit: (data: CategoryFormData) => Promise<void>
}

export default function MtoCategoryFormClient({ category, onSubmit }: MtoCategoryFormClientProps) {
  const router = useRouter()
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

  const watchAll = form.watch()

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger()
    if (!valid) return

    setIsSubmitting(true)
    try {
      await onSubmit(form.getValues())
      if (category) {
        toast.info("Category updated successfully.")
      } else {
        toast.success("Category created successfully.")
      }
      router.push("/mto/categories")
      router.refresh()
    } catch (err) {
      console.error("Failed to save category:", err)
      toast.error(err instanceof Error ? err.message : "Failed to save category. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [form, onSubmit, router, category])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Dashboard</span>
          <span className="text-muted-foreground/60">/</span>
          <span>Heritage Information Management</span>
          <span className="text-muted-foreground/60">/</span>
          <a href="/mto/categories" className="hover:text-foreground transition-colors">Categories</a>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">{category ? "Edit Category" : "Add New Category"}</span>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="size-4 mr-1" />
          Back to Categories
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {category ? "Edit Category" : "Add New Category"}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Category Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g., Religious, Historical" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Brief description of this category"
                    rows={3}
                    maxLength={255}
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                    {(form.watch("description")?.length ?? 0)}/255
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Icon & Color Card */}
          <Card>
            <CardHeader>
              <CardTitle>Icon & Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex gap-2">
                    <Input
                      {...form.register("icon")}
                      placeholder="e.g., Church, Landmark"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" className="shrink-0">
                      Choose Icon
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter an icon name or click Choose Icon</p>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input
                      {...form.register("color")}
                      placeholder="#6366f1"
                      className="flex-1 font-mono"
                    />
                    <input
                      type="color"
                      className="size-8 shrink-0 rounded border cursor-pointer"
                      value={form.watch("color") ?? "#6366f1"}
                      onChange={(e) => form.setValue("color", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Order & Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...form.register("displayOrder", { valueAsNumber: true })}
                    placeholder="0"
                  />
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
            </CardContent>
          </Card>

          {/* Additional Information Card (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input placeholder="Type a tag and press Enter" />
                <p className="text-xs text-muted-foreground">Press Enter to add a tag</p>
              </div>
              <div className="space-y-2">
                <Label>Reference Link</Label>
                <Input placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <div className="relative">
                  <Textarea placeholder="Additional notes..." rows={3} maxLength={500} />
                  <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">0/500</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/mto/categories")}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 mr-1 animate-spin" /> : <SaveIcon className="size-4 mr-1" />}
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 mr-1 animate-spin" /> : <SaveIcon className="size-4 mr-1" />}
              Save Category
            </Button>
          </div>
        </div>

        {/* Right Column — Live Preview */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            {/* Icon Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Icon Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-8">
                  {watchAll.icon ? (
                    <span className="text-5xl">{watchAll.icon}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No icon selected</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Category Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {watchAll.name && (
                    <span
                      className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium"
                      style={{
                        backgroundColor: watchAll.color ? `${watchAll.color}15` : undefined,
                        borderColor: watchAll.color ?? undefined,
                        color: watchAll.color ?? undefined,
                      }}
                    >
                      {watchAll.icon && <span className="mr-1.5">{watchAll.icon}</span>}
                      {watchAll.name}
                    </span>
                  )}
                  {!watchAll.name && (
                    <p className="text-sm text-muted-foreground text-center py-4">Category preview will appear here</p>
                  )}
                  {watchAll.description && (
                    <p className="text-xs text-muted-foreground">{watchAll.description}</p>
                  )}
                  <div className="pt-1">
                    <Badge variant={watchAll.status === "active" ? "default" : "secondary"}>
                      {watchAll.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

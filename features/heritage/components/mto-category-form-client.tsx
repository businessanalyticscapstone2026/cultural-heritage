"use client"

import { useState, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { SaveIcon, Loader2Icon, ArrowLeftIcon, UploadIcon, ImageIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { categorySchema, type CategoryFormValues } from "../schemas/category"
import type { HeritageCategory } from "@/types/heritage"
import CategoryIcon from "./category-icon"
import CategoryIconPicker from "./category-icon-picker"
import {
  requestCategoryImageUploadUrlAction,
  resolveCategoryImageUrlAction,
} from "@/features/media/actions/media"

type CategoryFormData = {
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  imageUrl?: string | null
  displayOrder?: number | null
  status?: string
}

interface MtoCategoryFormClientProps {
  category?: HeritageCategory | null
  onSubmit: (data: CategoryFormData) => Promise<void>
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export default function MtoCategoryFormClient({ category, onSubmit }: MtoCategoryFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? null,
      icon: category?.icon ?? null,
      color: category?.color ?? null,
      imageUrl: category?.imageUrl ?? null,
      displayOrder: category?.displayOrder ?? null,
      status: category?.status ?? "active",
    },
  })

  const watchAll = form.watch()
  const imageUrl = watchAll.imageUrl ?? null

  const colorInputValue = watchAll.color?.match(/^#[0-9a-fA-F]{6}$/)
    ? watchAll.color
    : "#6366f1"

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadError(null)
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError("Unsupported file type. Please upload a JPG, PNG, or WebP image.")
        return
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setUploadError("Image is too large. The maximum size is 10MB.")
        return
      }

      setIsUploading(true)
      try {
        const { uploadUrl, filePath } = await requestCategoryImageUploadUrlAction(
          file.name,
        )
        const response = await fetch(uploadUrl, { method: "PUT", body: file })
        if (!response.ok) throw new Error("Upload failed")
        const publicUrl = await resolveCategoryImageUrlAction(filePath)
        form.setValue("imageUrl", publicUrl, { shouldValidate: true })
      } catch (err) {
        setUploadError(errorReason(err, "Failed to upload image. Please try again."))
      } finally {
        setIsUploading(false)
      }
    },
    [form],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void handleUpload(file)
      e.target.value = ""
    },
    [handleUpload],
  )

  const removeImage = useCallback(() => {
    form.setValue("imageUrl", null, { shouldValidate: true })
  }, [form])

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger()
    if (!valid) return

    setIsSubmitting(true)
    try {
      await onSubmit(form.getValues())
      notifySuccess(category ? "Category updated successfully." : "Category created successfully.")
      router.push("/mto/categories")
      router.refresh()
    } catch (err) {
      console.error("Failed to save category:", err)
      notifyError(errorReason(err, "Failed to save category. Please try again."))
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
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setIconPickerOpen(true)}>
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
                      value={colorInputValue}
                      onChange={(e) => form.setValue("color", e.target.value)}
                    />
                  </div>
                  {form.formState.errors.color && (
                    <p className="text-xs text-destructive">{form.formState.errors.color.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Image Card */}
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {imageUrl ? (
                <div className="relative overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL */}
                  <img src={imageUrl} alt="Category preview" className="h-40 w-full object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8">
                  <ImageIcon className="size-8 text-muted-foreground" />
                  <p className="text-center text-sm text-muted-foreground">
                    No image set. This card will fall back to the icon and color.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2Icon className="size-4 mr-1 animate-spin" />
                  ) : (
                    <UploadIcon className="size-4 mr-1" />
                  )}
                  {isUploading ? "Uploading..." : imageUrl ? "Replace Image" : "Upload Image"}
                </Button>
                {imageUrl && (
                  <Button type="button" variant="ghost" onClick={removeImage} disabled={isUploading}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP up to 10MB.
              </p>
              {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
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
                    <CategoryIcon name={watchAll.icon} className="size-16 text-foreground" />
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
                      {watchAll.icon && <CategoryIcon name={watchAll.icon} className="mr-1.5 size-4" />}
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

      <CategoryIconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        onSelect={(value) => form.setValue("icon", value, { shouldValidate: true })}
        current={watchAll.icon ?? null}
      />
    </div>
  )
}

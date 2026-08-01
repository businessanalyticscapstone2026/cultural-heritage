"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SaveIcon, FileTextIcon, Loader2Icon, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { mtoHeritageSiteSchema } from "../schemas/mto-heritage-site"
import type { HeritageCategory, HeritageSite } from "@/types/heritage"
import TagInput from "./tag-input"
import ReferenceLinksInput from "./reference-links-input"
import RichTextEditor from "./rich-text-editor"
import SitePreviewCard from "./site-preview-card"

interface MtoHeritageFormClientProps {
  site?: HeritageSite | null
  categories: HeritageCategory[]
  municipalityId: string
  municipalityName: string
  barangays?: { name: string }[]
  tags?: { tag: string }[]
  referenceLinks?: { url: string; label?: string | null }[]
}

export default function MtoHeritageFormClient({
  site,
  categories,
  municipalityId,
  municipalityName,
  barangays,
  tags: initialTags,
  referenceLinks: initialLinks,
}: MtoHeritageFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<"draft" | "published" | null>(null)
  const [tags, setTags] = useState<{ tag: string }[]>(initialTags ?? [])
  const [referenceLinks, setReferenceLinks] = useState<{ url: string; label?: string | null }[]>(
    initialLinks ?? [],
  )

  const form = useForm({
    resolver: zodResolver(mtoHeritageSiteSchema),
    defaultValues: {
      siteName: site?.siteName ?? "",
      alternativeName: site?.alternativeName ?? null,
      categoryId: site?.categoryId ?? null,
      barangay: site?.barangay ?? null,
      exactAddress: site?.exactAddress ?? null,
      shortDescription: site?.shortDescription ?? null,
      detailedDescription: site?.detailedDescription ?? null,
      historicalPeriod: site?.historicalPeriod ?? null,
      yearEstablished: site?.yearEstablished ?? null,
      architectBuilder: site?.architectBuilder ?? null,
      architecturalStyle: site?.architecturalStyle ?? null,
      designation: site?.designation ?? null,
      historicalSignificance: site?.historicalSignificance ?? null,
      culturalSignificance: site?.culturalSignificance ?? null,
      latitude: site?.latitude ?? null,
      longitude: site?.longitude ?? null,
      elevation: site?.elevation ?? null,
      geoAccuracy: site?.geoAccuracy ?? null,
      publicationStatus: site?.publicationStatus ?? "draft",
      isFeatured: site?.isFeatured ?? false,
    },
  })

  const watchAll = form.watch()
  const selectedCategory = categories.find((c) => c.id === form.watch("categoryId")) ?? null

  const requestSubmit = useCallback(
    async (status: "draft" | "published") => {
      setSubmitError(null)
      form.setValue("publicationStatus", status)
      const valid = await form.trigger()
      if (!valid) {
        const message = "Please fix the highlighted fields before saving."
        setSubmitError(message)
        toast.warning(message)
        return
      }

      const { checkDuplicateSiteNameAction } = await import("../actions/mto-sites")
      const duplicate = await checkDuplicateSiteNameAction(form.getValues("siteName"), site?.id)
      if (duplicate) {
        const message = `A heritage site named "${duplicate.siteName}" already exists in ${duplicate.municipalityName ?? "this municipality"}. Please use a different name.`
        setSubmitError(message)
        toast.warning(message)
        return
      }

      setPendingStatus(status)
    },
    [form, site],
  )

  const confirmSubmit = useCallback(async () => {
    if (!pendingStatus) return

    setIsSubmitting(true)
    try {
      const values = form.getValues()
      const payload = JSON.stringify({
        ...values,
        ...(site?.id ? { id: site.id } : {}),
        tags,
        referenceLinks,
      })

      const { saveMtoSiteAction } = await import("../actions/mto-sites")
      await saveMtoSiteAction(payload)
      toast.success(site ? "Heritage site updated." : "Heritage site added successfully.")
      router.push("/mto/heritage-sites/")
      router.refresh()
    } catch (err) {
      console.error("Failed to save site:", err)
      const message = err instanceof Error ? err.message : "Failed to save site. Please try again."
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
      setPendingStatus(null)
    }
  }, [pendingStatus, form, tags, referenceLinks, site, router])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Dashboard</span>
          <span className="text-muted-foreground/60">/</span>
          <span>Heritage Information Management</span>
          <span className="text-muted-foreground/60">/</span>
          <a href="/mto/heritage-sites" className="hover:text-foreground transition-colors">Heritage Sites</a>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">{site ? "Edit Site" : "Add New Site"}</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">{site ? "Edit Heritage Site" : "Add New Heritage Site"}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Site Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
                <Input id="siteName" {...form.register("siteName")} placeholder="e.g., Taal Basilica" />
                {form.formState.errors.siteName && (
                  <p className="text-xs text-destructive">{form.formState.errors.siteName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...form.register("categoryId")}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternativeName">Alternative Name (Optional)</Label>
                <Input id="alternativeName" {...form.register("alternativeName")} placeholder="e.g., Minor Basilica of Saint Martin" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Municipality</Label>
                  <Input value={municipalityName} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Input id="barangay" {...form.register("barangay")} placeholder="Barangay name" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exactAddress">Exact Location / Address</Label>
                <Input id="exactAddress" {...form.register("exactAddress")} placeholder="Full street address" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <div className="relative">
                  <Textarea
                    id="shortDescription"
                    {...form.register("shortDescription")}
                    placeholder="Brief description of the site"
                    rows={3}
                    maxLength={255}
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                    {(form.watch("shortDescription")?.length ?? 0)}/255
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="detailedDescription">Detailed Background</Label>
                <RichTextEditor
                  value={form.watch("detailedDescription") ?? ""}
                  onChange={(val) => form.setValue("detailedDescription", val, { shouldValidate: false })}
                  placeholder="Comprehensive description of the heritage site..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Established Year / Period</Label>
                  <Input id="yearEstablished" {...form.register("yearEstablished")} placeholder="e.g., 1856" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="historicalPeriod">Historical Period</Label>
                  <Input id="historicalPeriod" {...form.register("historicalPeriod")} placeholder="e.g., Spanish Colonial" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="architecturalStyle">Architectural Style</Label>
                  <Input id="architecturalStyle" {...form.register("architecturalStyle")} placeholder="e.g., Baroque" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="architectBuilder">Architect / Builder</Label>
                  <Input id="architectBuilder" {...form.register("architectBuilder")} placeholder="e.g., Fr. Domingo Salazar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("designation")}
                  >
                    <option value="">None</option>
                    <option value="National Cultural Treasure">National Cultural Treasure</option>
                    <option value="Important Cultural Property">Important Cultural Property</option>
                    <option value="Local Cultural Treasure">Local Cultural Treasure</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="historicalSignificance">Historical Significance</Label>
                  <Input id="historicalSignificance" {...form.register("historicalSignificance")} placeholder="Significance" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="culturalSignificance">Cultural Significance (Optional)</Label>
                <Textarea
                  id="culturalSignificance"
                  {...form.register("culturalSignificance")}
                  placeholder="Cultural importance to the community"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Geographic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...form.register("latitude", { valueAsNumber: true })}
                    placeholder="e.g., 13.8833"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...form.register("longitude", { valueAsNumber: true })}
                    placeholder="e.g., 120.9239"
                  />
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full">
                Pick on Map
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="elevation">Elevation (Optional)</Label>
                  <Input
                    id="elevation"
                    type="number"
                    step="any"
                    {...form.register("elevation", { valueAsNumber: true })}
                    placeholder="Meters"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geo Accuracy (Optional)</Label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("geoAccuracy")}
                  >
                    <option value="">Select accuracy</option>
                    <option value="exact">Exact</option>
                    <option value="approximate">Approximate</option>
                    <option value="estimated">Estimated</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tags (Optional)</Label>
                <TagInput tags={tags} onChange={setTags} placeholder="Type a tag and press Enter" />
              </div>
              <div className="space-y-2">
                <Label>Reference Links (Optional)</Label>
                <ReferenceLinksInput links={referenceLinks} onChange={setReferenceLinks} />
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Publication Status</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...form.register("publicationStatus")}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  className="size-4 rounded border-input"
                  {...form.register("isFeatured")}
                />
                <Label htmlFor="isFeatured">Feature Site</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Error */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircleIcon className="size-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/mto/heritage-sites")}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => requestSubmit("draft")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 mr-1 animate-spin" />
              ) : (
                <FileTextIcon className="size-4 mr-1" />
              )}
              Save as Draft
            </Button>
            <Button onClick={() => requestSubmit("published")} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="size-4 mr-1 animate-spin" />
              ) : (
                <SaveIcon className="size-4 mr-1" />
              )}
              Save Site
            </Button>
          </div>
        </div>

        {/* Right Column — Live Preview */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <SitePreviewCard
                  siteName={watchAll.siteName ?? ""}
                  category={selectedCategory}
                  shortDescription={watchAll.shortDescription ?? null}
                  yearEstablished={watchAll.yearEstablished ?? null}
                  publicationStatus={watchAll.publicationStatus ?? "draft"}
                  isFeatured={watchAll.isFeatured ?? false}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={pendingStatus !== null} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{site ? "Save changes?" : "Add this heritage site?"}</DialogTitle>
            <DialogDescription>
              {pendingStatus === "published"
                ? `"${watchAll.siteName}" will be saved and published.`
                : `"${watchAll.siteName}" will be saved as a draft.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="size-4 mr-1 animate-spin" />
              ) : (
                <SaveIcon className="size-4 mr-1" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

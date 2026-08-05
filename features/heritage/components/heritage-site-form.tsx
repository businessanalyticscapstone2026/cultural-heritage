"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react"
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
import {
  heritageSiteBasicInfoSchema,
  heritageSiteHistoricalSchema,
  heritageSiteLocationSchema,
  heritageSiteReviewSchema,
  type HistoricalFormValues,
  type ReviewFormValues,
} from "../schemas/heritage-site"
import type { HeritageSite, HeritageCategory } from "../types"

interface HeritageSiteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site?: HeritageSite | null
  categories: HeritageCategory[]
  municipalities: { id: string; name: string }[]
  onSubmit: (data: Partial<HeritageSite>) => Promise<void>
}

const STEPS = ["Basic Info", "Historical", "Location", "Review"] as const

export default function HeritageSiteForm({
  open,
  onOpenChange,
  site,
  categories,
  municipalities,
  onSubmit,
}: HeritageSiteFormProps) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const basicForm = useForm({
    resolver: zodResolver(heritageSiteBasicInfoSchema),
    defaultValues: {
      siteName: site?.siteName ?? "",
      alternativeName: site?.alternativeName ?? null,
      categoryId: site?.categoryId ?? null,
      municipalityId: site?.municipalityId ?? null,
      barangay: site?.barangay ?? null,
      exactAddress: site?.exactAddress ?? null,
      shortDescription: site?.shortDescription ?? null,
    },
  })

  const historicalForm = useForm<HistoricalFormValues>({
    resolver: zodResolver(heritageSiteHistoricalSchema),
    defaultValues: {
      detailedDescription: site?.detailedDescription ?? null,
      historicalPeriod: site?.historicalPeriod ?? null,
      yearEstablished: site?.yearEstablished ?? null,
      architectBuilder: site?.architectBuilder ?? null,
      architecturalStyle: site?.architecturalStyle ?? null,
      historicalSignificance: site?.historicalSignificance ?? null,
      culturalSignificance: site?.culturalSignificance ?? null,
      designation: site?.designation ?? null,
    },
  })

  const locationForm = useForm({
    resolver: zodResolver(heritageSiteLocationSchema),
    defaultValues: {
      latitude: site?.latitude ?? null,
      longitude: site?.longitude ?? null,
      elevation: site?.elevation ?? null,
      geoAccuracy: site?.geoAccuracy ?? null,
      accessibilityInfo: site?.accessibilityInfo ?? null,
      operatingHours: site?.operatingHours ?? null,
      entranceFee: site?.entranceFee ?? null,
    },
  })

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(heritageSiteReviewSchema),
    defaultValues: {
      publicationStatus: site?.publicationStatus ?? "draft",
      isFeatured: site?.isFeatured ?? false,
      visibility: site?.visibility ?? "public",
    },
  })

  useEffect(() => {
    if (open) {
      setStep(0)
      setSubmitError(null)
      basicForm.reset({
        siteName: site?.siteName ?? "",
        alternativeName: site?.alternativeName ?? null,
        categoryId: site?.categoryId ?? null,
        municipalityId: site?.municipalityId ?? null,
        barangay: site?.barangay ?? null,
        exactAddress: site?.exactAddress ?? null,
        shortDescription: site?.shortDescription ?? null,
      })
      historicalForm.reset({
        detailedDescription: site?.detailedDescription ?? null,
        historicalPeriod: site?.historicalPeriod ?? null,
        yearEstablished: site?.yearEstablished ?? null,
        architectBuilder: site?.architectBuilder ?? null,
        architecturalStyle: site?.architecturalStyle ?? null,
        historicalSignificance: site?.historicalSignificance ?? null,
        culturalSignificance: site?.culturalSignificance ?? null,
        designation: site?.designation ?? null,
      })
      locationForm.reset({
        latitude: site?.latitude ?? null,
        longitude: site?.longitude ?? null,
        elevation: site?.elevation ?? null,
        geoAccuracy: site?.geoAccuracy ?? null,
        accessibilityInfo: site?.accessibilityInfo ?? null,
        operatingHours: site?.operatingHours ?? null,
        entranceFee: site?.entranceFee ?? null,
      })
      reviewForm.reset({
        publicationStatus: site?.publicationStatus ?? "draft",
        isFeatured: site?.isFeatured ?? false,
        visibility: site?.visibility ?? "public",
      })
    }
  }, [open, site, basicForm, historicalForm, locationForm, reviewForm])

  const validateStep = useCallback(async () => {
    switch (step) {
      case 0:
        return basicForm.trigger()
      case 1:
        return historicalForm.trigger()
      case 2:
        return locationForm.trigger()
      case 3:
        return reviewForm.trigger()
      default:
        return true
    }
  }, [step, basicForm, historicalForm, locationForm, reviewForm])

  const handleNext = useCallback(async () => {
    const valid = await validateStep()
    if (valid && step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }, [step, validateStep])

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1)
  }, [step])

  const handleSubmit = useCallback(async () => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const allData = {
        ...basicForm.getValues(),
        ...historicalForm.getValues(),
        ...locationForm.getValues(),
        ...reviewForm.getValues(),
      } as Partial<HeritageSite>
      await onSubmit(allData)
      toast.success(site ? "Heritage site updated." : "Heritage site added successfully.")
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save heritage site. Please try again."
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [basicForm, historicalForm, locationForm, reviewForm, onSubmit, onOpenChange, site])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {site ? "Edit Heritage Site" : "Add Heritage Site"}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/20 text-primary border border-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
                <Input id="siteName" {...basicForm.register("siteName")} placeholder="e.g., Taal Basilica" />
                {basicForm.formState.errors.siteName && (
                  <p className="text-xs text-destructive">{basicForm.formState.errors.siteName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternativeName">Alternative Name</Label>
                <Input id="alternativeName" {...basicForm.register("alternativeName")} placeholder="e.g., Minor Basilica of Saint Martin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...basicForm.register("categoryId")}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {basicForm.formState.errors.categoryId && (
                    <p className="text-xs text-destructive">{basicForm.formState.errors.categoryId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Municipality *</Label>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...basicForm.register("municipalityId")}
                  >
                    <option value="">Select municipality</option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {basicForm.formState.errors.municipalityId && (
                    <p className="text-xs text-destructive">{basicForm.formState.errors.municipalityId.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Input id="barangay" {...basicForm.register("barangay")} placeholder="Barangay name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exactAddress">Exact Address</Label>
                <Input id="exactAddress" {...basicForm.register("exactAddress")} placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea id="shortDescription" {...basicForm.register("shortDescription")} placeholder="Brief description (max 500 chars)" rows={3} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="detailedDescription">Detailed Description</Label>
                <Textarea id="detailedDescription" {...historicalForm.register("detailedDescription")} placeholder="Comprehensive description of the heritage site" rows={5} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="historicalPeriod">Historical Period</Label>
                  <Input id="historicalPeriod" {...historicalForm.register("historicalPeriod")} placeholder="e.g., Spanish Colonial" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input id="yearEstablished" {...historicalForm.register("yearEstablished")} placeholder="e.g., 1856" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="architectBuilder">Architect / Builder</Label>
                  <Input id="architectBuilder" {...historicalForm.register("architectBuilder")} placeholder="Name of architect or builder" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="architecturalStyle">Architectural Style</Label>
                  <Input id="architecturalStyle" {...historicalForm.register("architecturalStyle")} placeholder="e.g., Baroque" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="historicalSignificance">Historical Significance</Label>
                <Textarea id="historicalSignificance" {...historicalForm.register("historicalSignificance")} placeholder="Why is this site historically significant?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="culturalSignificance">Cultural Significance</Label>
                <Textarea id="culturalSignificance" {...historicalForm.register("culturalSignificance")} placeholder="Cultural importance to the community" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" {...historicalForm.register("designation")} placeholder="e.g., National Cultural Treasure" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" type="number" step="any" {...locationForm.register("latitude", { valueAsNumber: true })} placeholder="e.g., 13.8833" />
                  {locationForm.formState.errors.latitude && (
                    <p className="text-xs text-destructive">{locationForm.formState.errors.latitude.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" type="number" step="any" {...locationForm.register("longitude", { valueAsNumber: true })} placeholder="e.g., 120.9239" />
                  {locationForm.formState.errors.longitude && (
                    <p className="text-xs text-destructive">{locationForm.formState.errors.longitude.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="elevation">Elevation (m)</Label>
                  <Input id="elevation" type="number" step="any" {...locationForm.register("elevation", { valueAsNumber: true })} placeholder="Meters above sea level" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="geoAccuracy">Geo Accuracy</Label>
                  <Input id="geoAccuracy" {...locationForm.register("geoAccuracy")} placeholder="e.g., exact, approximate" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessibilityInfo">Accessibility Info</Label>
                <Textarea id="accessibilityInfo" {...locationForm.register("accessibilityInfo")} placeholder="How to get here, parking, accessibility features" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input id="operatingHours" {...locationForm.register("operatingHours")} placeholder="e.g., Mon-Sun 8:00 AM - 5:00 PM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entranceFee">Entrance Fee</Label>
                <Input id="entranceFee" {...locationForm.register("entranceFee")} placeholder="e.g., Free, PHP 50" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Publication Status</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...reviewForm.register("publicationStatus")}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...reviewForm.register("visibility")}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  className="h-4 w-4 rounded border-input"
                  {...reviewForm.register("isFeatured")}
                />
                <Label htmlFor="isFeatured">Mark as Featured</Label>
              </div>

              {/* Summary */}
              <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <dt className="text-muted-foreground">Name:</dt>
                  <dd>{basicForm.getValues("siteName") || "—"}</dd>
                  <dt className="text-muted-foreground">Category:</dt>
                  <dd>{categories.find((c) => c.id === basicForm.getValues("categoryId"))?.name || "—"}</dd>
                  <dt className="text-muted-foreground">Municipality:</dt>
                  <dd>{municipalities.find((m) => m.id === basicForm.getValues("municipalityId"))?.name || "—"}</dd>
                  <dt className="text-muted-foreground">Status:</dt>
                  <dd>{reviewForm.getValues("publicationStatus")}</dd>
                </dl>
              </div>
            </div>
          )}
        </div>

        {submitError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <CheckIcon className="h-4 w-4 mr-1" />
                )}
                {site ? "Update Site" : "Create Site"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

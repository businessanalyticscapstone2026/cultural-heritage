"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { XIcon, Landmark, EditIcon, UploadIcon, QrCodeIcon, ArchiveIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCategoryName } from "@/lib/format-category"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { SiteWithDetails } from "../services/mto-sites"

interface HeritageDetailPanelProps {
  site: SiteWithDetails | null
  open: boolean
  onClose: () => void
  onEdit?: (site: SiteWithDetails) => void
  onArchive?: (site: SiteWithDetails) => void
  readOnly?: boolean
}

export default function HeritageDetailPanel({
  site,
  open,
  onClose,
  onEdit,
  onArchive,
  readOnly = false,
}: HeritageDetailPanelProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  if (!site) return null

  const primaryImage = site.media.find((m) => m.isPrimary && m.mediaType === "image") ?? site.media.find((m) => m.mediaType === "image")

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[480px] max-w-full bg-background shadow-xl border-l transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-base font-semibold">
              Site Details{readOnly && <span className="ml-2 text-xs font-normal text-muted-foreground">(Read-only)</span>}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Hero Image */}
            <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage.fileUrl}
                  alt={site.siteName}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover"
                />
              ) : (
                <Landmark className="size-14 text-muted-foreground/60" />
              )}
            </div>

            {/* Title section */}
            <div className="px-5 py-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold leading-tight">{site.siteName}</h3>
                <Badge
                  variant={
                    site.publicationStatus === "published"
                      ? "default"
                      : site.publicationStatus === "archived"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {site.publicationStatus}
                </Badge>
              </div>

              {site.category && (
                <span
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: site.category.color ? `${site.category.color}15` : undefined,
                    borderColor: site.category.color ?? undefined,
                  }}
                >
                  {formatCategoryName(site.category.name)}
                </span>
              )}

              <div className="space-y-0.5 text-sm text-muted-foreground">
                {site.barangay && <p>{site.barangay}</p>}
                {site.exactAddress && <p className="text-xs">{site.exactAddress}</p>}
              </div>

              <p className="text-xs text-muted-foreground">
                Added {new Date(site.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="px-5">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4 pb-4">
                {site.shortDescription && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                    <p className="text-sm leading-relaxed">{site.shortDescription}</p>
                  </div>
                )}

                {site.detailedDescription && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Detailed Description</h4>
                    <div
                      className="text-sm leading-relaxed [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: site.detailedDescription }}
                    />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Historical Information</h4>
                  <div className="space-y-2 text-sm">
                    {site.yearEstablished && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Established</span>
                        <span className="font-medium">{site.yearEstablished}</span>
                      </div>
                    )}
                    {site.architecturalStyle && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Architectural Style</span>
                        <span className="font-medium">{site.architecturalStyle}</span>
                      </div>
                    )}
                    {site.historicalSignificance && (
                      <div>
                        <span className="text-muted-foreground text-xs block mb-0.5">Historical Significance</span>
                        <p className="font-medium text-xs">{site.historicalSignificance}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                {!readOnly && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit?.(site)}>
                        <EditIcon className="size-3.5 mr-1.5" />
                        Edit Site
                      </Button>
                      <Button variant="outline" size="sm">
                        <UploadIcon className="size-3.5 mr-1.5" />
                        Upload Media
                      </Button>
                      <Button variant="outline" size="sm">
                        <QrCodeIcon className="size-3.5 mr-1.5" />
                        Generate QR
                      </Button>
                      {site.publicationStatus !== "archived" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onArchive?.(site)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <ArchiveIcon className="size-3.5 mr-1.5" />
                          Archive Site
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
                  {site.creatorName && (
                    <p>Created by: {site.creatorName}</p>
                  )}
                  <p>Last updated: {new Date(site.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</p>
                </div>
              </TabsContent>

              <TabsContent value="media" className="pt-4 pb-4">
                {site.media.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No media uploaded</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {site.media.map((m) => (
                      <div key={m.id} className="relative aspect-video rounded-lg bg-muted overflow-hidden">
                        {m.mediaType === "image" ? (
                          <Image
                            src={m.fileUrl}
                            alt={m.caption ?? ""}
                            fill
                            sizes="(max-width: 768px) 50vw, 220px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                            {m.mediaType}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="location" className="pt-4 pb-4 space-y-3 text-sm">
                {site.barangay && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barangay</span>
                    <span>{site.barangay}</span>
                  </div>
                )}
                {site.exactAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-right max-w-[60%]">{site.exactAddress}</span>
                  </div>
                )}
                {site.latitude != null && site.longitude != null && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latitude</span>
                      <span>{site.latitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longitude</span>
                      <span>{site.longitude}</span>
                    </div>
                  </>
                )}
                {site.elevation != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elevation</span>
                    <span>{site.elevation}m</span>
                  </div>
                )}
                {site.geoAccuracy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geo Accuracy</span>
                    <span>{site.geoAccuracy}</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="pt-4 pb-4 space-y-3 text-sm">
                {site.yearEstablished && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year Established</span>
                    <span className="font-medium">{site.yearEstablished}</span>
                  </div>
                )}
                {site.architecturalStyle && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Architectural Style</span>
                    <span className="font-medium">{site.architecturalStyle}</span>
                  </div>
                )}
                {site.historicalSignificance && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Historical Significance</span>
                    <p className="text-sm">{site.historicalSignificance}</p>
                  </div>
                )}
                {site.culturalSignificance && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Cultural Significance</span>
                    <p className="text-sm">{site.culturalSignificance}</p>
                  </div>
                )}
                {site.tags && site.tags.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {site.tags.map((t) => (
                        <span key={t.id} className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Map as MapIcon,
  Landmark,
  Crosshair,
  Layers,
  Search,
  X,
  Save,
  Loader2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { MapSite, MapSiteDetail } from "../services"
import type { GeoFeatureCollection } from "@/types/gis"

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">Loading map...</div> },
)
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapMarker),
  { ssr: false },
)
const MarkerContent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerContent),
  { ssr: false },
)
const MarkerLabel = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerLabel),
  { ssr: false },
)
const MapControls = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapControls),
  { ssr: false },
)
const MapPopup = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapPopup),
  { ssr: false },
)

const coordinatesFormValuesSchema = z.object({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  elevation: z.string().optional(),
  geoAccuracy: z.string().optional(),
})

type CoordinatesFormValues = z.infer<typeof coordinatesFormValuesSchema>

type MTOSiteWithGeo = MapSite & { categoryColor: string }

type MTOGISPanelProps = {
  initialSites: MapSite[]
  initialGeoJSON: GeoFeatureCollection
  categories: { id: string; name: string; color: string }[]
  municipalityCenter: { lat: number; lng: number }
}

const GEO_ACCURACY_OPTIONS = ["Exact", "Approximate", "Unverified"]

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
]

export default function MTOGISPanel({
  initialSites,
  categories,
  municipalityCenter,
}: MTOGISPanelProps) {
  const [sites, setSites] = useState<MapSite[]>(initialSites)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [selectedSite, setSelectedSite] = useState<MapSiteDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [pinMode, setPinMode] = useState(false)
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [visibleCategoryIds, setVisibleCategoryIds] = useState<string[]>(
    categories.map((c) => c.id),
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingDetail, setLoadingDetail] = useState(false)
  const mapRef = useRef<{ map: maplibregl.Map | null }>({ map: null })

  const locationForm = useForm<CoordinatesFormValues>({
    resolver: zodResolver(coordinatesFormValuesSchema),
    defaultValues: { latitude: "", longitude: "", elevation: "", geoAccuracy: "" },
  })

  const filteredSites = sites.filter((s) => {
    if (categoryFilter !== "all" && s.categoryId !== categoryFilter) return false
    if (statusFilter !== "all" && s.publicationStatus !== statusFilter) return false
    if (!visibleCategoryIds.includes(s.categoryId ?? "")) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!s.siteName.toLowerCase().includes(q) && !(s.barangay ?? "").toLowerCase().includes(q)) return false
    }
    return true
  })

  const openDetail = useCallback(async (siteId: string) => {
    setSelectedSiteId(siteId)
    setLoadingDetail(true)
    setDetailOpen(true)
    try {
      const { getMtoSiteDetailAction } = await import("../actions")
      const detail = await getMtoSiteDetailAction(siteId)
      setSelectedSite(detail)
      if (detail) {
        locationForm.reset({
          latitude: detail.latitude != null ? String(detail.latitude) : "",
          longitude: detail.longitude != null ? String(detail.longitude) : "",
          elevation: detail.elevation != null ? String(detail.elevation) : "",
          geoAccuracy: detail.geoAccuracy ?? "",
        })
      }
    } catch {
      setSelectedSite(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [locationForm])

  const closeDetail = useCallback(() => {
    setDetailOpen(false)
    setSelectedSiteId(null)
    setSelectedSite(null)
    setTempPin(null)
    setPinMode(false)
    setSaveMessage(null)
  }, [])

  const handleMapClick = useCallback(
    async (e: { lngLat: { lng: number; lat: number } }) => {
      if (!pinMode) return
      const { lng, lat } = e.lngLat
      setTempPin({ lat, lng })
      locationForm.setValue("latitude", String(lat))
      locationForm.setValue("longitude", String(lng))

      if (selectedSiteId) {
        setSaving(true)
        setSaveMessage(null)
        try {
          const { updateSiteCoordinatesJSON } = await import("../actions")
          await updateSiteCoordinatesJSON(
            JSON.stringify({
              siteId: selectedSiteId,
              latitude: lat,
              longitude: lng,
            }),
          )
          setSites((prev) =>
            prev.map((s) =>
              s.id === selectedSiteId ? { ...s, latitude: lat, longitude: lng } : s,
            ),
          )
          if (selectedSite) {
            setSelectedSite({ ...selectedSite, latitude: lat, longitude: lng })
          }
          setSaveMessage({ text: "Coordinates updated from map click.", error: false })
        } catch {
          setSaveMessage({ text: "Failed to update coordinates.", error: true })
        } finally {
          setSaving(false)
        }
      }
    },
    [pinMode, selectedSiteId, locationForm, selectedSite],
  )

  const handleSaveCoordinates = useCallback(
    async (values: Record<string, unknown>) => {
      if (!selectedSiteId) return
      setSaving(true)
      setSaveMessage(null)
      try {
        const { updateSiteCoordinatesJSON } = await import("../actions")
        const lat = values.latitude === "" || values.latitude == null ? null : Number(values.latitude)
        const lng = values.longitude === "" || values.longitude == null ? null : Number(values.longitude)
        const elev = values.elevation === "" || values.elevation == null ? null : Number(values.elevation)
        const acc = (values.geoAccuracy as string) || null
        await updateSiteCoordinatesJSON(
          JSON.stringify({
            siteId: selectedSiteId,
            latitude: lat,
            longitude: lng,
            elevation: elev,
            geoAccuracy: acc,
          }),
        )
        setSites((prev) =>
          prev.map((s) =>
            s.id === selectedSiteId
              ? { ...s, latitude: lat, longitude: lng, elevation: elev, geoAccuracy: acc }
              : s,
          ),
        )
        if (selectedSite) {
          setSelectedSite({ ...selectedSite, latitude: lat, longitude: lng, elevation: elev, geoAccuracy: acc })
        }
        setSaveMessage({ text: "Coordinates saved successfully.", error: false })
      } catch {
        setSaveMessage({ text: "Failed to save coordinates.", error: true })
      } finally {
        setSaving(false)
      }
    },
    [selectedSiteId, selectedSite],
  )

  const getAccuracyIcon = (accuracy: string | null) => {
    if (!accuracy) return <HelpCircle className="size-3.5 text-muted-foreground" />
    const lower = accuracy.toLowerCase()
    if (lower === "exact") return <CheckCircle2 className="size-3.5 text-success" />
    if (lower === "approximate") return <AlertTriangle className="size-3.5 text-warning" />
    return <HelpCircle className="size-3.5 text-muted-foreground" />
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border">
      {/* Left Filter Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r bg-card">
        <div className="border-b p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <MapIcon className="size-4 text-primary" />
            GIS Map
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Heritage site geotagging</p>
        </div>

        {/* Search */}
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="border-b p-3 space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layers Toggle */}
        <div className="border-b p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Layers className="size-3" />
              Layers
            </div>
            <button
              type="button"
              onClick={() => {
                setVisibleCategoryIds(
                  visibleCategoryIds.length === categories.length
                    ? []
                    : categories.map((c) => c.id),
                )
              }}
              className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {visibleCategoryIds.length === categories.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="space-y-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent has-checked:bg-primary/5"
              >
                <input
                  type="checkbox"
                  checked={visibleCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    setVisibleCategoryIds(
                      e.target.checked
                        ? [...visibleCategoryIds, cat.id]
                        : visibleCategoryIds.filter((id) => id !== cat.id),
                    )
                  }}
                  className="size-3.5 accent-primary"
                />
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sites List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Heritage Sites
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {filteredSites.length}
            </Badge>
          </div>
          {filteredSites.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No sites match the current filters.
            </p>
          ) : (
            <div className="space-y-1">
              {filteredSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => openDetail(site.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent",
                    selectedSiteId === site.id && "bg-primary/10 font-medium",
                  )}
                >
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: site.categoryColor ?? "#6366f1" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{site.siteName}</p>
                    {site.barangay && (
                      <p className="truncate text-[10px] text-muted-foreground">{site.barangay}</p>
                    )}
                  </div>
                  {site.latitude != null && site.longitude != null ? (
                    <MapPin className="size-3 shrink-0 text-success" />
                  ) : (
                    <Crosshair className="size-3 shrink-0 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Map Area */}
      <div className="relative flex-1">
        <Map
          className="h-full w-full"
          viewport={{
            center: [municipalityCenter.lng, municipalityCenter.lat],
            zoom: 12,
            bearing: 0,
            pitch: 0,
          }}
        >
          {/* Render pins */}
          {filteredSites
            .filter((s) => s.latitude != null && s.longitude != null)
            .map((site) => (
              <MapMarker
                key={site.id}
                longitude={site.longitude as number}
                latitude={site.latitude as number}
                onClick={() => openDetail(site.id)}
              >
                <MarkerContent>
                  <button
                    type="button"
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110",
                      selectedSiteId === site.id && "scale-125 ring-2 ring-primary",
                    )}
                    style={{
                      backgroundColor: site.categoryColor ?? "#6366f1",
                    }}
                    title={site.siteName}
                  >
                    <Landmark className="size-2.5 text-white" />
                  </button>
                </MarkerContent>
                <MarkerLabel>{site.siteName}</MarkerLabel>
              </MapMarker>
            ))}

          {/* Temp pin for click-to-place */}
          {pinMode && tempPin && (
            <MapMarker longitude={tempPin.lng} latitude={tempPin.lat}>
              <MarkerContent>
                <div className="flex size-7 items-center justify-center">
                  <div className="size-4 animate-ping rounded-full bg-primary/40" />
                  <div className="absolute size-3 rounded-full border-2 border-white bg-primary shadow-lg" />
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          <MapControls showZoom showLocate />
        </Map>

        {/* Pin Mode Toggle */}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={pinMode ? "default" : "outline"}
            onClick={() => {
              setPinMode(!pinMode)
              if (!pinMode) setTempPin(null)
            }}
            className="gap-1.5 text-xs shadow-sm"
          >
            <MapPin className="size-3.5" />
            {pinMode ? "Exit Pin Mode" : "Click Map to Pin"}
          </Button>
        </div>

        {/* Pin mode help */}
        {pinMode && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs text-background shadow-lg">
              <MapPin className="size-3.5" />
              {selectedSiteId
                ? "Click on the map to set coordinates for the selected site"
                : "Select a site from the list first, then click the map to pin coordinates"}
            </div>
          </div>
        )}
      </div>

      {/* Right Detail Panel (slide-in) */}
      {detailOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={closeDetail} />
          <div
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full w-[480px] max-w-full flex-col border-l bg-background shadow-xl transition-transform duration-300 ease-in-out",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <MapPin className="size-4 text-primary" />
                Site Details
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : selectedSite ? (
                <>
                  {/* Hero Image */}
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    {selectedSite.primaryImage ? (
                      <img
                        src={selectedSite.primaryImage}
                        alt={selectedSite.siteName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Landmark className="size-14 text-muted-foreground/60" />
                    )}
                  </div>

                  {/* Title section */}
                  <div className="space-y-2 px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight">{selectedSite.siteName}</h3>
                      <Badge
                        variant={
                          selectedSite.publicationStatus === "published"
                            ? "default"
                            : selectedSite.publicationStatus === "archived"
                              ? "secondary"
                              : "outline"
                        }
                        className="shrink-0"
                      >
                        {selectedSite.publicationStatus}
                      </Badge>
                    </div>

                    {selectedSite.categoryName && (
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: selectedSite.categoryColor
                            ? `${selectedSite.categoryColor}15`
                            : undefined,
                          borderColor: selectedSite.categoryColor ?? undefined,
                        }}
                      >
                        {selectedSite.categoryName}
                      </span>
                    )}

                    {selectedSite.barangay && (
                      <p className="text-sm text-muted-foreground">{selectedSite.barangay}</p>
                    )}
                    {selectedSite.exactAddress && (
                      <p className="text-xs text-muted-foreground">{selectedSite.exactAddress}</p>
                    )}
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="px-5">
                    <TabsList className="w-full">
                      <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                      <TabsTrigger value="information" className="flex-1">Information</TabsTrigger>
                      <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                      <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 pb-4 pt-4">
                      {selectedSite.shortDescription && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Description
                          </h4>
                          <p className="text-sm leading-relaxed">{selectedSite.shortDescription}</p>
                        </div>
                      )}
                      {selectedSite.detailedDescription && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Detailed Description
                          </h4>
                          <p className="text-sm leading-relaxed">{selectedSite.detailedDescription}</p>
                        </div>
                      )}
                      {selectedSite.latitude != null && selectedSite.longitude != null && (
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Current Coordinates
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Latitude</span>
                              <span className="font-mono font-medium">{selectedSite.latitude}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Longitude</span>
                              <span className="font-mono font-medium">{selectedSite.longitude}</span>
                            </div>
                            {selectedSite.elevation != null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Elevation</span>
                                <span className="font-mono font-medium">{selectedSite.elevation}m</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Accuracy</span>
                              <span className="flex items-center gap-1 font-medium">
                                {getAccuracyIcon(selectedSite.geoAccuracy)}
                                {selectedSite.geoAccuracy ?? (
                                  <span className="text-muted-foreground">Not set</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="information" className="space-y-4 pb-4 pt-4">
                      {selectedSite.historicalPeriod && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Historical Period</span>
                          <span className="font-medium">{selectedSite.historicalPeriod}</span>
                        </div>
                      )}
                      {selectedSite.yearEstablished && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Year Established</span>
                          <span className="font-medium">{selectedSite.yearEstablished}</span>
                        </div>
                      )}
                      {selectedSite.architecturalStyle && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Architectural Style</span>
                          <span className="font-medium">{selectedSite.architecturalStyle}</span>
                        </div>
                      )}
                      {selectedSite.historicalSignificance && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                            Historical Significance
                          </h4>
                          <p className="text-sm">{selectedSite.historicalSignificance}</p>
                        </div>
                      )}
                      {selectedSite.culturalSignificance && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                            Cultural Significance
                          </h4>
                          <p className="text-sm">{selectedSite.culturalSignificance}</p>
                        </div>
                      )}
                      {selectedSite.accessibilityInfo && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                            Accessibility
                          </h4>
                          <p className="text-sm">{selectedSite.accessibilityInfo}</p>
                        </div>
                      )}
                      {selectedSite.operatingHours && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Operating Hours</span>
                          <span className="font-medium">{selectedSite.operatingHours}</span>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="media" className="pb-4 pt-4">
                      {selectedSite.media.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No media uploaded
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedSite.media.map((m) => (
                            <div key={m.id} className="overflow-hidden rounded-lg bg-muted">
                              {m.mediaType === "image" ? (
                                <div className="aspect-video">
                                  <img
                                    src={m.fileUrl}
                                    alt={m.caption ?? ""}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex aspect-video items-center justify-center text-xs text-muted-foreground">
                                  {m.mediaType}
                                </div>
                              )}
                              {m.caption && (
                                <p className="truncate px-2 py-1 text-[10px] text-muted-foreground">
                                  {m.caption}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="location" className="space-y-4 pb-4 pt-4">
                      {/* Coordinate Display & Edit */}
                      <form onSubmit={locationForm.handleSubmit(handleSaveCoordinates)}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="edit-lat" className="text-xs">Latitude</Label>
                              <Input
                                id="edit-lat"
                                type="number"
                                step="any"
                                placeholder="-90 to 90"
                                className="h-8 text-xs"
                                {...locationForm.register("latitude")}
                              />
                              {locationForm.formState.errors.latitude && (
                                <p className="text-[10px] text-destructive">
                                  {locationForm.formState.errors.latitude.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="edit-lng" className="text-xs">Longitude</Label>
                              <Input
                                id="edit-lng"
                                type="number"
                                step="any"
                                placeholder="-180 to 180"
                                className="h-8 text-xs"
                                {...locationForm.register("longitude")}
                              />
                              {locationForm.formState.errors.longitude && (
                                <p className="text-[10px] text-destructive">
                                  {locationForm.formState.errors.longitude.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="edit-elevation" className="text-xs">Elevation (m)</Label>
                              <Input
                                id="edit-elevation"
                                type="number"
                                step="any"
                                placeholder="Optional"
                                className="h-8 text-xs"
                                {...locationForm.register("elevation")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="edit-geoAccuracy" className="text-xs">Geo Accuracy</Label>
                              <select
                                id="edit-geoAccuracy"
                                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                {...locationForm.register("geoAccuracy")}
                              >
                                <option value="">Select accuracy...</option>
                                {GEO_ACCURACY_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <Button type="submit" size="sm" disabled={saving}>
                              {saving ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Save className="size-3.5" />
                              )}
                              {saving ? "Saving..." : "Save Coordinates"}
                            </Button>
                            {saveMessage && (
                              <span
                                className={
                                  saveMessage.error
                                    ? "text-xs text-destructive"
                                    : "text-xs text-success"
                                }
                              >
                                {saveMessage.text}
                              </span>
                            )}
                          </div>

                          {saveMessage && saveMessage.text && !saveMessage.error && (
                            <p className="text-xs text-success">{saveMessage.text}</p>
                          )}
                        </div>
                      </form>

                      {/* Help text */}
                      <div className="rounded-lg border border-dashed bg-muted/20 p-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">Pin on Map</p>
                            <p className="mt-0.5">
                              Toggle "Click Map to Pin" mode on the map, then click anywhere on the map to set coordinates.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                  Site not found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

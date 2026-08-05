"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Eye,
  EyeOff,
  Map as MapIcon,
  Crosshair,
  AlertTriangle,
  Save,
  Globe,
  Lock,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GisConfig, HeritageCategoryWithStatus, IntegrationInfo } from "../types"
import type { MapSite } from "../services"
import type { StyleSpecification } from "maplibre-gl"

const MapPreview = dynamic(
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
const MapControls = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapControls),
  { ssr: false },
)

// Standard OSM raster tiles for the "openstreetmap" provider. Distinct from
// "mapcn" which uses the Map component's own bundled vector style.
const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
}

/**
 * Google Maps tile rendering isn't implemented yet (separate integration ticket).
 * Fall back to the default basemap instead of crashing or leaving the preview blank.
 */
function resolvePreviewBasemap(
  provider: GisConfig["basemapProvider"],
  googleMapsIntegration: IntegrationInfo | null,
): { styles?: { light: StyleSpecification; dark: StyleSpecification }; notice: string | null } {
  if (provider === "openstreetmap") {
    return { styles: { light: OSM_RASTER_STYLE, dark: OSM_RASTER_STYLE }, notice: null }
  }
  if (provider === "google_maps") {
    return {
      notice: googleMapsIntegration?.status === "active"
        ? "Google Maps rendering isn't wired up yet — showing the default basemap."
        : "Google Maps Platform isn't configured — showing the default basemap.",
    }
  }
  return { notice: null }
}

const visibleCategoryIdsSchema = z.object({
  visibleCategoryIds: z.array(z.string()),
})

const basemapSchema = z.object({
  provider: z.enum(["openstreetmap", "google_maps", "mapcn"]),
  googleMapsStyle: z.enum(["roadmap", "satellite", "hybrid", "terrain"]).optional(),
})

const mapCenterSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  zoom: z.coerce.number().min(1).max(20),
})

type GisAdminPanelProps = {
  gisConfig: GisConfig
  categories: HeritageCategoryWithStatus[]
  googleMapsIntegration: IntegrationInfo | null
  sites: MapSite[]
}

const PROVIDER_LABELS: Record<string, string> = {
  openstreetmap: "OpenStreetMap",
  google_maps: "Google Maps",
  mapcn: "MapCN",
}

const MAP_STYLE_LABELS: Record<string, string> = {
  roadmap: "Roadmap",
  satellite: "Satellite",
  hybrid: "Hybrid",
  terrain: "Terrain",
}

export default function GisAdminPanel({
  gisConfig,
  categories,
  googleMapsIntegration,
  sites,
}: GisAdminPanelProps) {
  const [layerSaving, setLayerSaving] = useState(false)
  const [basemapSaving, setBasemapSaving] = useState(false)
  const [centerSaving, setCenterSaving] = useState(false)
  const [layerMessage, setLayerMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [basemapMessage, setBasemapMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [centerMessage, setCenterMessage] = useState<{ text: string; error: boolean } | null>(null)

  const layerForm = useForm<z.infer<typeof visibleCategoryIdsSchema>>({
    defaultValues: {
      visibleCategoryIds: gisConfig.visibleCategoryIds,
    },
  })

  const basemapForm = useForm<z.infer<typeof basemapSchema>>({
    defaultValues: {
      provider: gisConfig.basemapProvider,
      googleMapsStyle: gisConfig.googleMapsStyle,
    },
  })

  const centerForm = useForm<z.infer<typeof mapCenterSchema>>({
    defaultValues: {
      lat: gisConfig.defaultMapCenter.lat,
      lng: gisConfig.defaultMapCenter.lng,
      zoom: gisConfig.defaultZoom,
    },
  })

  const selectedProvider = basemapForm.watch("provider")

  const mappableSites = sites.filter((s) => s.latitude != null && s.longitude != null)
  const previewBasemap = resolvePreviewBasemap(selectedProvider, googleMapsIntegration)
  const previewCenter = gisConfig.defaultMapCenter

  async function onSaveLayerToggles(values: z.infer<typeof visibleCategoryIdsSchema>) {
    setLayerSaving(true)
    setLayerMessage(null)
    try {
      const { updateVisibleCategories } = await import("../actions")
      await updateVisibleCategories(values.visibleCategoryIds)
      setLayerMessage({ text: "Layer toggles saved.", error: false })
    } catch {
      setLayerMessage({ text: "Failed to save layer toggles.", error: true })
    } finally {
      setLayerSaving(false)
    }
  }

  async function onSaveBasemap(values: z.infer<typeof basemapSchema>) {
    setBasemapSaving(true)
    setBasemapMessage(null)
    try {
      const { updateBasemapProvider } = await import("../actions")
      await updateBasemapProvider(values.provider, values.googleMapsStyle)
      setBasemapMessage({ text: "Base map source saved.", error: false })
    } catch {
      setBasemapMessage({ text: "Failed to save base map source.", error: true })
    } finally {
      setBasemapSaving(false)
    }
  }

  async function onSaveMapCenter(values: z.infer<typeof mapCenterSchema>) {
    setCenterSaving(true)
    setCenterMessage(null)
    try {
      const { updateDefaultMapCenter } = await import("../actions")
      await updateDefaultMapCenter(values.lat, values.lng, values.zoom)
      setCenterMessage({ text: "Default map center saved.", error: false })
    } catch {
      setCenterMessage({ text: "Failed to save default map center.", error: true })
    } finally {
      setCenterSaving(false)
    }
  }

  const allCategoryIds = categories.map((c) => c.id)
  const visibleIds = layerForm.watch("visibleCategoryIds")
  const allVisible = visibleIds.length === categories.length

  function toggleAll() {
    if (allVisible) {
      layerForm.setValue("visibleCategoryIds", [])
    } else {
      layerForm.setValue("visibleCategoryIds", allCategoryIds)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">GIS Data Management</h1>
        <p className="mt-1 text-sm opacity-80">
          Configure map layers, base map sources, and map defaults
        </p>
      </div>

      {/* Map Preview */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapIcon className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Map Preview</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {mappableSites.length} site{mappableSites.length !== 1 ? "s" : ""} plotted · {PROVIDER_LABELS[selectedProvider]}
          </span>
        </div>

        {previewBasemap.notice && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-warning" />
            {previewBasemap.notice}
          </div>
        )}

        <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
          <MapPreview
            className="h-full w-full"
            styles={previewBasemap.styles}
            viewport={{
              center: [previewCenter.lng, previewCenter.lat],
              zoom: gisConfig.defaultZoom,
              bearing: 0,
              pitch: 0,
            }}
          >
            {mappableSites.map((site) => (
              <MapMarker
                key={site.id}
                longitude={site.longitude as number}
                latitude={site.latitude as number}
              >
                <MarkerContent>
                  <div
                    className="flex size-5 items-center justify-center rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: site.categoryColor ?? "#6366f1" }}
                    title={site.siteName}
                  />
                </MarkerContent>
              </MapMarker>
            ))}
            <MapControls showZoom showLocate />
          </MapPreview>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section 1: Map Layer Toggles */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="size-5 text-muted-foreground" />
              <h2 className="font-semibold">Map Layer Toggles</h2>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {allVisible ? "Deselect All" : "Select All"}
            </button>
          </div>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            Control which heritage categories are visible on the map by default. Reads from
            heritage_categories.status.
          </p>

          {categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No categories found.</p>
          ) : (
            <form onSubmit={layerForm.handleSubmit(onSaveLayerToggles)}>
              <fieldset className="space-y-2" disabled={layerSaving}>
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      value={cat.id}
                      {...layerForm.register("visibleCategoryIds")}
                      className="size-4 accent-primary"
                    />
                    <span
                      className="inline-block size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1">{cat.name}</span>
                    {cat.status === "inactive" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <EyeOff className="size-3" />
                        Inactive
                      </span>
                    )}
                  </label>
                ))}
              </fieldset>

              <div className="mt-4 flex items-center gap-3">
                <Button type="submit" size="sm" disabled={layerSaving}>
                  <Save className="size-3.5" />
                  {layerSaving ? "Saving..." : "Save Layer Toggles"}
                </Button>
                {layerMessage && (
                  <span
                    className={
                      layerMessage.error ? "text-xs text-error" : "text-xs text-success"
                    }
                  >
                    {layerMessage.text}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Section 2: Base Map Source */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Base Map Source</h2>
          </div>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            Select the base map provider. Reads/writes provider config from
            system_settings (gis_config). API key is stored in integrations table.
          </p>

          <form onSubmit={basemapForm.handleSubmit(onSaveBasemap)}>
            <fieldset className="space-y-4" disabled={basemapSaving}>
              <div>
                <label
                  htmlFor="basemap-provider"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Map Provider
                </label>
                <select
                  id="basemap-provider"
                  {...basemapForm.register("provider")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProvider === "google_maps" && (
                <>
                  <div>
                    <label
                      htmlFor="google-maps-style"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Map Style
                    </label>
                    <select
                      id="google-maps-style"
                      {...basemapForm.register("googleMapsStyle")}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {Object.entries(MAP_STYLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      API Key
                    </p>
                    {googleMapsIntegration ? (
                      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                        <Lock className="size-3.5 text-muted-foreground" />
                        <code className="font-mono text-xs">
                          {googleMapsIntegration.apiKeyMasked ?? "Not configured"}
                        </code>
                        <span
                          className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            googleMapsIntegration.status === "active"
                              ? "bg-success/10 text-success"
                              : googleMapsIntegration.status === "error"
                                ? "bg-error/10 text-error"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {googleMapsIntegration.status}
                        </span>
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                        No Google Maps Platform integration found in integrations table.
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Masked key displayed. Manage the full key in System Settings.
                    </p>
                  </div>
                </>
              )}
            </fieldset>

            <div className="mt-4 flex items-center gap-3">
              <Button type="submit" size="sm" disabled={basemapSaving}>
                <Save className="size-3.5" />
                {basemapSaving ? "Saving..." : "Save Base Map"}
              </Button>
              {basemapMessage && (
                <span
                  className={
                    basemapMessage.error ? "text-xs text-error" : "text-xs text-success"
                  }
                >
                  {basemapMessage.text}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section 3: Default Map Center */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Crosshair className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Default Map Center</h2>
          </div>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            Set the default viewport center and zoom level when the map loads. Stored in
            system_settings (gis_config).
          </p>

          <form onSubmit={centerForm.handleSubmit(onSaveMapCenter)}>
            <fieldset className="space-y-4" disabled={centerSaving}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="map-center-lat"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    Latitude
                  </label>
                  <input
                    id="map-center-lat"
                    type="number"
                    step="any"
                    {...centerForm.register("lat")}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  {centerForm.formState.errors.lat && (
                    <p className="mt-1 text-xs text-error">
                      {centerForm.formState.errors.lat.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="map-center-lng"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    Longitude
                  </label>
                  <input
                    id="map-center-lng"
                    type="number"
                    step="any"
                    {...centerForm.register("lng")}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  {centerForm.formState.errors.lng && (
                    <p className="mt-1 text-xs text-error">
                      {centerForm.formState.errors.lng.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="map-center-zoom"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Zoom Level (1–20)
                </label>
                <input
                  id="map-center-zoom"
                  type="number"
                  min={1}
                  max={20}
                  {...centerForm.register("zoom")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {centerForm.formState.errors.zoom && (
                  <p className="mt-1 text-xs text-error">
                    {centerForm.formState.errors.zoom.message}
                  </p>
                )}
              </div>
            </fieldset>

            <div className="mt-4 flex items-center gap-3">
              <Button type="submit" size="sm" disabled={centerSaving}>
                <Save className="size-3.5" />
                {centerSaving ? "Saving..." : "Save Map Center"}
              </Button>
              {centerMessage && (
                <span
                  className={
                    centerMessage.error ? "text-xs text-error" : "text-xs text-success"
                  }
                >
                  {centerMessage.text}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Section 4: Municipal Boundaries */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <MapIcon className="size-5 text-muted-foreground" />
            <h2 className="font-semibold">Municipal Boundaries</h2>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">Schema gap — no polygon storage</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The municipalities table has no geometry column. Boundary rendering on the map
                  requires either:
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                  <li>Adding a polygon/GeoJSON column to municipalities, or</li>
                  <li>Storing boundary GeoJSON file paths in system_settings, or</li>
                  <li>Creating a dedicated municipal_boundaries table</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-center">
              <MapIcon className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-2 text-xs text-muted-foreground">
                TODO: Upload GeoJSON or KML boundary files here once schema supports it.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Currently referencing boundary files is stored as
                <code className="mx-1 rounded bg-muted px-1 font-mono">gis_config.municipalityBoundarySource</code>
                (null / not implemented).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

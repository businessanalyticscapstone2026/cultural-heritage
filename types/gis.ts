import type { HeritageSite } from "./heritage"

export interface GeoFeature {
  type: "Feature"
  geometry: {
    type: "Point" | "Polygon" | "LineString" | "MultiPolygon"
    coordinates: number[] | number[][] | number[][][] | number[][][][]
  }
  properties: Record<string, unknown>
}

export interface GeoFeatureCollection {
  type: "FeatureCollection"
  features: GeoFeature[]
}

export interface MapViewport {
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
}

export interface HeritageMarker {
  site: HeritageSite
  coordinates: [number, number]
}

export interface GisConfig {
  defaultMapCenter: { lat: number; lng: number }
  defaultZoom: number
  basemapProvider: "openstreetmap" | "google_maps" | "mapcn"
  googleMapsStyle?: "roadmap" | "satellite" | "hybrid" | "terrain"
  visibleCategoryIds: string[]
}

export interface HeritageCategoryWithStatus {
  id: string
  name: string
  color: string
  icon: string | null
  status: "active" | "inactive"
}

export interface IntegrationInfo {
  id: string
  name: string
  category: string | null
  status: "active" | "inactive" | "error"
  apiKeyMasked: string | null
  config: Record<string, unknown> | null
}

export interface BoundaryGeometry {
  type: "Polygon" | "MultiPolygon"
  coordinates: number[][][] | number[][][][]
}

export interface BoundaryGeoJSON {
  type: "Feature"
  geometry: BoundaryGeometry
  properties: Record<string, unknown>
}

export interface MunicipalBoundary {
  id: string
  municipalityId: string
  boundaryGeojson: BoundaryGeoJSON
  createdAt: string
  updatedAt: string
}

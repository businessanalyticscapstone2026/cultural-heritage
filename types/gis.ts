import type { HeritageSite } from "./heritage"

export interface GeoFeature {
  type: "Feature"
  geometry: {
    type: "Point" | "Polygon" | "LineString"
    coordinates: number[] | number[][] | number[][][]
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

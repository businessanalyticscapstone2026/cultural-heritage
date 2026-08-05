import { DOMParser } from "@xmldom/xmldom"
import { kml } from "@tmcw/togeojson"
import { z } from "zod"
import type { BoundaryGeoJSON, BoundaryGeometry } from "@/types/gis"

// Mirrors the `municipal_boundaries_geojson_type_check` constraint in the
// migration: geometry must be Polygon or MultiPolygon. Validating shape here
// (rather than only relying on the DB constraint) lets us surface a specific,
// actionable error message instead of a raw Postgres constraint violation.
const positionSchema = z.array(z.number()).min(2).max(3)
const linearRingSchema = z.array(positionSchema).min(4)
const polygonCoordinatesSchema = z.array(linearRingSchema).min(1)
const multiPolygonCoordinatesSchema = z.array(polygonCoordinatesSchema).min(1)

const boundaryGeometrySchema = z.union([
  z.object({ type: z.literal("Polygon"), coordinates: polygonCoordinatesSchema }),
  z.object({ type: z.literal("MultiPolygon"), coordinates: multiPolygonCoordinatesSchema }),
])

type RawFeature = { type: "Feature"; geometry?: unknown; properties?: unknown }
type RawGeometry = { type?: unknown; coordinates?: unknown }

function isPolygonType(geometry: unknown): geometry is BoundaryGeometry {
  if (typeof geometry !== "object" || geometry === null) return false
  const type = (geometry as RawGeometry).type
  return type === "Polygon" || type === "MultiPolygon"
}

/**
 * Collapses every Polygon/MultiPolygon feature found in a FeatureCollection
 * into a single MultiPolygon. Municipality boundaries in the wild are often
 * exported as several disjoint Placemarks (e.g. mainland + island barangays),
 * so requiring exactly one polygon feature would reject valid real-world
 * files.
 */
function collectPolygons(features: RawFeature[]): number[][][][] {
  const polygons: number[][][][] = []
  for (const feature of features) {
    if (!isPolygonType(feature.geometry)) continue
    if (feature.geometry.type === "Polygon") {
      polygons.push(feature.geometry.coordinates as number[][][])
    } else {
      polygons.push(...(feature.geometry.coordinates as number[][][][]))
    }
  }
  return polygons
}

function toBoundaryFeature(geometry: BoundaryGeometry): BoundaryGeoJSON {
  const parsed = boundaryGeometrySchema.safeParse(geometry)
  if (!parsed.success) {
    throw new Error(
      `Invalid boundary geometry: ${parsed.error.issues[0]?.message ?? "malformed coordinates"}`,
    )
  }
  return { type: "Feature", geometry: parsed.data as BoundaryGeometry, properties: {} }
}

/** Normalizes a parsed GeoJSON value (Feature, FeatureCollection, or bare geometry) into one boundary Feature. */
function normalizeToBoundaryFeature(value: unknown): BoundaryGeoJSON {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    throw new Error("File does not contain valid GeoJSON.")
  }

  const type = (value as { type: unknown }).type

  if (type === "FeatureCollection") {
    const features = ((value as { features?: unknown }).features ?? []) as RawFeature[]
    const polygons = collectPolygons(features)
    if (polygons.length === 0) {
      throw new Error("No Polygon or MultiPolygon geometry found in the file.")
    }
    if (polygons.length === 1) {
      return toBoundaryFeature({ type: "Polygon", coordinates: polygons[0] } as unknown as BoundaryGeometry)
    }
    return toBoundaryFeature({ type: "MultiPolygon", coordinates: polygons })
  }

  if (type === "Feature") {
    const geometry = (value as RawFeature).geometry
    if (!isPolygonType(geometry)) {
      throw new Error("The uploaded feature must have a Polygon or MultiPolygon geometry.")
    }
    return toBoundaryFeature(geometry)
  }

  if (type === "Polygon" || type === "MultiPolygon") {
    return toBoundaryFeature(value as BoundaryGeometry)
  }

  throw new Error(`Unsupported GeoJSON type "${String(type)}". Expected a Polygon, MultiPolygon, Feature, or FeatureCollection.`)
}

export function parseBoundaryGeoJSON(text: string): BoundaryGeoJSON {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error("File is not valid JSON.")
  }
  return normalizeToBoundaryFeature(value)
}

export function parseBoundaryKML(text: string): BoundaryGeoJSON {
  let doc: ReturnType<DOMParser["parseFromString"]>
  try {
    doc = new DOMParser().parseFromString(text, "text/xml")
  } catch {
    throw new Error("File is not valid KML/XML.")
  }

  const parseErrors = doc.getElementsByTagName("parsererror")
  if (parseErrors.length > 0) {
    throw new Error("File is not valid KML/XML.")
  }

  const geojson = kml(doc as unknown as Document)
  return normalizeToBoundaryFeature(geojson)
}

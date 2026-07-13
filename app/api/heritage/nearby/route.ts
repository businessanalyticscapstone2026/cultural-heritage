import { NextRequest, NextResponse } from "next/server"
import { getNearbySitesFromLocation } from "@/features/heritage/services"
import type { TravelMode } from "@/types/heritage"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const lat = parseFloat(searchParams.get("lat") ?? "")
  const long = parseFloat(searchParams.get("long") ?? "")
  const radius = parseFloat(searchParams.get("radius") ?? "3")
  const category = searchParams.get("category") ?? undefined
  const mode = (searchParams.get("mode") ?? "walking") as TravelMode
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)

  if (isNaN(lat) || isNaN(long)) {
    return NextResponse.json(
      { error: "lat and long parameters are required" },
      { status: 400 }
    )
  }

  if (lat < -90 || lat > 90 || long < -180 || long > 180) {
    return NextResponse.json(
      { error: "Invalid coordinates" },
      { status: 400 }
    )
  }

  try {
    const results = await getNearbySitesFromLocation(lat, long, radius, {
      category,
      mode,
      limit,
    })

    return NextResponse.json({
      location: { lat, long },
      radiusKm: radius,
      mode,
      results,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch nearby sites" },
      { status: 500 }
    )
  }
}

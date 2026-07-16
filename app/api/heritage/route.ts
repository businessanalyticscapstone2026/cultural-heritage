import { NextRequest, NextResponse } from "next/server"
import { getNearbySites, getCategories } from "@/features/heritage/services"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const nearbySiteId = searchParams.get("nearby")

  if (nearbySiteId) {
    try {
      const sites = await getNearbySites(nearbySiteId)
      return NextResponse.json({ sites })
    } catch {
      return NextResponse.json({ sites: [] })
    }
  }

  try {
    const categories = await getCategories()
    return NextResponse.json({ message: "Heritage API", categories })
  } catch {
    return NextResponse.json({ message: "Heritage API", categories: [] })
  }
}

export async function POST() {
  return NextResponse.json({ message: "Heritage API" })
}

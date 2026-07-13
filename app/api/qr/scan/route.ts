import { NextRequest, NextResponse } from "next/server"
import { recordScanEvent } from "@/features/qr-code/services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codeValue, siteId, deviceType } = body

    if (!codeValue || !siteId) {
      return NextResponse.json(
        { success: false, error: "codeValue and siteId are required" },
        { status: 400 }
      )
    }

    await recordScanEvent(codeValue, deviceType)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}

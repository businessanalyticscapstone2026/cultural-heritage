import { NextRequest, NextResponse } from "next/server"
import { resolveQRCode } from "@/features/qr-code/services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "not_found", message: "Code is required." },
        { status: 400 }
      )
    }

    const result = await resolveQRCode(code)

    if (!result.success) {
      const status = result.error === "not_found" ? 404 : 410
      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, error: "network_error", message: "Unable to resolve code. Please try again." },
      { status: 500 }
    )
  }
}

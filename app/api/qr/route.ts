import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "QR Code API" })
}

export async function POST() {
  return NextResponse.json({ message: "QR Code API" })
}

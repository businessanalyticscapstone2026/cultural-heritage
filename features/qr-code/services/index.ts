import type { QRCodeData, QRCodeConfig } from "../types"

export async function generateQRCode(siteId: string, config?: QRCodeConfig): Promise<QRCodeData> {
  throw new Error("Not implemented")
}

export async function getQRCodeBySite(siteId: string): Promise<QRCodeData | null> {
  return null
}

export async function recordScan(qrCodeId: string): Promise<void> {}

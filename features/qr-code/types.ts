export interface QRCodeData {
  id: string
  siteId: string
  url: string
  svg: string
  scans: number
  createdAt: string
}

export interface QRCodeConfig {
  size: number
  foregroundColor: string
  backgroundColor: string
}

export interface QRCodeRecord {
  id: string
  siteId: string
  codeValue: string
  status: "active" | "inactive"
  createdBy: string | null
  createdAt: string
}

export interface ScanResult {
  success: boolean
  siteId?: string
  siteName?: string
  status?: string
  error?: "not_found" | "inactive" | "network_error"
  message?: string
}

export interface ScanHistoryItem {
  siteId: string
  siteName: string
  codeValue: string
  scannedAt: Date
}

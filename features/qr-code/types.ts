export type QRCodeStatus = "active" | "inactive" | "revoked"

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
  status: QRCodeStatus
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

export interface QRCodeWithSite {
  id: string
  siteId: string
  siteName: string
  siteThumbnail: string | null
  codeValue: string
  status: QRCodeStatus
  scanCount: number
  createdBy: string | null
  creatorName: string | null
  createdAt: string
}

export interface QRKpiCounts {
  total: number
  active: number
  inactive: number
  scansThisMonth: number
}

export interface QRScanLogEntry {
  id: string
  qrCodeId: string
  codeValue: string
  siteName: string
  scannedAt: string
  deviceType: string | null
}

export interface SiteOption {
  id: string
  siteName: string
  thumbnail: string | null
}

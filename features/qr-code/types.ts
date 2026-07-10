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

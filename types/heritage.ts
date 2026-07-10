export interface HeritageSite {
  id: string
  name: string
  description: string
  categoryId: string
  municipalityId: string
  coordinates: [number, number]
  historicalSignificance: string
  accessibility: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface HeritageCategory {
  id: string
  name: string
  description: string
}

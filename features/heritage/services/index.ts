import type { HeritageSite, HeritageCategory } from "../types"

export async function getHeritageSites(): Promise<HeritageSite[]> {
  return []
}

export async function getHeritageSiteById(id: string): Promise<HeritageSite | null> {
  return null
}

export async function getCategories(): Promise<HeritageCategory[]> {
  return []
}

export async function createHeritageSite(data: Partial<HeritageSite>): Promise<HeritageSite> {
  throw new Error("Not implemented")
}

export async function updateHeritageSite(id: string, data: Partial<HeritageSite>): Promise<HeritageSite> {
  throw new Error("Not implemented")
}

export async function deleteHeritageSite(id: string): Promise<void> {}

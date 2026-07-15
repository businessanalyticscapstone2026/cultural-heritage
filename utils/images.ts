import fs from "fs/promises"
import path from "path"

const MUNICIPALITIES_DIR = path.join(process.cwd(), "public", "images", "municipalities")

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|jfif)$/i

export async function getMunicipalityImage(municipalityName: string): Promise<string | null> {
  const slug = municipalityName.toLowerCase()
  const dir = path.join(MUNICIPALITIES_DIR, slug)

  try {
    const files = await fs.readdir(dir)
    const imageFile = files.find(f => IMAGE_EXT.test(f))
    if (imageFile) return `/images/municipalities/${slug}/${encodeURI(imageFile)}`
  } catch {}

  const logoPath = path.join(MUNICIPALITIES_DIR, "logo", `${slug}.png`)
  try {
    await fs.access(logoPath)
    return `/images/municipalities/logo/${slug}.png`
  } catch {}

  return null
}

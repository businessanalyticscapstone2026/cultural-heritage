import { describe, expect, it } from "bun:test"
import { compressImage } from "./image-compression"

describe("compressImage", () => {
  it("returns non-image file untouched", async () => {
    const file = new File(["dummy content"], "doc.pdf", { type: "application/pdf" })
    const result = await compressImage(file)
    expect(result).toBe(file)
  })

  it("returns small image file untouched when below minSizeThreshold", async () => {
    const file = new File(["small image content"], "photo.jpg", { type: "image/jpeg" })
    const result = await compressImage(file, { minSizeThreshold: 1024 * 1024 })
    expect(result).toBe(file)
  })

  it("handles environment safely when canvas or window is unavailable", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" })
    const result = await compressImage(file)
    expect(result).toBeDefined()
  })
})

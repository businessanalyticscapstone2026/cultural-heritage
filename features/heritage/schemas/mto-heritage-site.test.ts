import { describe, expect, test } from "bun:test"
import { mtoHeritageSiteSchema } from "./mto-heritage-site"

const base = {
  siteName: "Taal Basilica",
  publicationStatus: "draft" as const,
}

describe("mtoHeritageSiteSchema", () => {
  test("allows an empty-string categoryId (unselected <select>) when saving as draft", () => {
    // CHT-062: drafts can be saved incrementally, so an unselected category
    // must not block "Save as Draft". "" is normalized to null and accepted.
    const result = mtoHeritageSiteSchema.safeParse({ ...base, categoryId: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.categoryId).toBeNull()
    }
  })

  test("allows a null categoryId when saving as draft", () => {
    const result = mtoHeritageSiteSchema.safeParse({ ...base, categoryId: null })
    expect(result.success).toBe(true)
  })

  test("rejects an empty-string categoryId as missing category when publishing", () => {
    // Regression: CHT-033 — the "Category" <select> submits "" when nothing is
    // chosen. This is normalized to null (not left as an invalid uuid string)
    // and then rejected by the required-category rule when publishing, with a
    // clear "Category is required" error shown under the field.
    const result = mtoHeritageSiteSchema.safeParse({
      ...base,
      publicationStatus: "published",
      categoryId: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Category is required")
    }
  })

  test("rejects a null categoryId when publishing", () => {
    const result = mtoHeritageSiteSchema.safeParse({
      ...base,
      publicationStatus: "published",
      categoryId: null,
    })
    expect(result.success).toBe(false)
  })

  test("accepts a valid uuid categoryId", () => {
    const result = mtoHeritageSiteSchema.safeParse({
      ...base,
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
    })
    expect(result.success).toBe(true)
  })

  test("rejects a malformed non-empty categoryId regardless of status", () => {
    const result = mtoHeritageSiteSchema.safeParse({ ...base, categoryId: "not-a-uuid" })
    expect(result.success).toBe(false)
  })

  test("rejects a missing site name", () => {
    const result = mtoHeritageSiteSchema.safeParse({ ...base, siteName: "" })
    expect(result.success).toBe(false)
  })
})

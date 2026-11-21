import { describe, expect, test } from "bun:test"
import { formatCategoryName } from "./format-category"

describe("formatCategoryName", () => {
  test("translates 'Natural' to 'Natural Attraction'", () => {
    expect(formatCategoryName("Natural")).toBe("Natural Attraction")
    expect(formatCategoryName("natural")).toBe("Natural Attraction")
    expect(formatCategoryName("NATURAL")).toBe("Natural Attraction")
    expect(formatCategoryName(" Natural ")).toBe("Natural Attraction")
  })

  test("passes through other category names unchanged", () => {
    expect(formatCategoryName("Religious")).toBe("Religious")
    expect(formatCategoryName("Historical")).toBe("Historical")
    expect(formatCategoryName("Heritage House")).toBe("Heritage House")
    expect(formatCategoryName("Museum")).toBe("Museum")
  })

  test("handles empty or null/undefined gracefully", () => {
    expect(formatCategoryName(null)).toBe("")
    expect(formatCategoryName(undefined)).toBe("")
    expect(formatCategoryName("")).toBe("")
  })
})

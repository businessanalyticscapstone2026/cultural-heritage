import { describe, expect, it } from "bun:test"
import { AGE_GROUPS, DEFAULT_AGE_GROUP } from "@/lib/constants"
import type { ProfileData } from "../types"

describe("Tourist Age Groups", () => {
  it("defines the expected age group brackets", () => {
    const expectedValues = ["18-24", "25-34", "35-54", "55+"]
    expect(AGE_GROUPS.map((g) => g.value)).toEqual(expectedValues)
  })

  it("exports '18-24' as the universal DEFAULT_AGE_GROUP", () => {
    expect(DEFAULT_AGE_GROUP).toBe("18-24")
    expect(AGE_GROUPS.some((g) => g.value === DEFAULT_AGE_GROUP)).toBe(true)
  })

  it("each age group has a valid label and non-empty value", () => {
    for (const group of AGE_GROUPS) {
      expect(group.value).toBeTruthy()
      expect(group.label).toBeTruthy()
    }
  })

  it("resolves null or undefined ageGroup to DEFAULT_AGE_GROUP", () => {
    const rawAgeGroup: string | null = null
    const resolved = rawAgeGroup ?? DEFAULT_AGE_GROUP
    expect(resolved).toBe("18-24")
  })

  it("ProfileData type includes nullable ageGroup", () => {
    const mockProfile: ProfileData = {
      firstName: "Maria",
      lastName: "Santos",
      email: "maria@example.com",
      homeLatitude: 13.9,
      homeLongitude: 120.6,
      interests: ["history"],
      preferredCategoryIds: ["cat-1"],
      travelStyle: "cultural",
      groupType: "solo",
      ageGroup: "25-34",
      accessibilityNeeds: [],
      onboardingCompletedAt: "2026-11-25T00:00:00Z",
    }

    expect(mockProfile.ageGroup).toBe("25-34")

    const mockProfileNullAge: ProfileData = {
      ...mockProfile,
      ageGroup: null,
    }
    expect(mockProfileNullAge.ageGroup).toBeNull()
  })
})

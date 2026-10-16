import { describe, expect, test } from "bun:test"
import { deleteMtoSitesSchema } from "./mto-site-delete"

const UUID_A = "11111111-1111-4111-8111-111111111111"
const UUID_B = "22222222-2222-4222-8222-222222222222"

describe("deleteMtoSitesSchema", () => {
  test("accepts a list of valid UUIDs", () => {
    expect(deleteMtoSitesSchema.parse([UUID_A, UUID_B])).toEqual([UUID_A, UUID_B])
  })

  test("rejects an empty array", () => {
    expect(() => deleteMtoSitesSchema.parse([])).toThrow()
  })

  test("rejects non-UUID ids", () => {
    expect(() => deleteMtoSitesSchema.parse(["not-a-uuid"])).toThrow()
  })

  test("rejects duplicate ids", () => {
    expect(() => deleteMtoSitesSchema.parse([UUID_A, UUID_A])).toThrow()
  })

  test("rejects oversized input", () => {
    const ids = Array.from({ length: 51 }, (_, i) =>
      `00000000-0000-4000-8000-${i.toString(16).padStart(12, "0")}`
    )
    expect(() => deleteMtoSitesSchema.parse(ids)).toThrow()
  })
})

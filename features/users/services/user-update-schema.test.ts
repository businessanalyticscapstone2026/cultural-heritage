import { describe, expect, it } from "bun:test"
import { updateStaffSchema } from "@/app/api/users/[id]/route"

describe("updateStaffSchema", () => {
  it("accepts PTCAO account updates with null municipality_id", () => {
    const payload = {
      first_name: "Juan",
      last_name: "Dela Cruz",
      username: "ptcao_admin",
      role_id: "e44d32e9-4e8c-4f76-857c-2b5d4304e223",
      municipality_id: null,
    }

    const result = updateStaffSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.municipality_id).toBeNull()
      expect(result.data.first_name).toBe("Juan")
      expect(result.data.last_name).toBe("Dela Cruz")
    }
  })

  it("accepts MTO account updates with valid string municipality_id", () => {
    const payload = {
      first_name: "Maria",
      last_name: "Santos",
      username: "taal_mto",
      role_id: "e44d32e9-4e8c-4f76-857c-2b5d4304e223",
      municipality_id: "c87b8d80-5a39-4458-96d5-1fbeee440536",
    }

    const result = updateStaffSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.municipality_id).toBe("c87b8d80-5a39-4458-96d5-1fbeee440536")
    }
  })

  it("accepts payload where municipality_id is omitted (undefined)", () => {
    const payload = {
      first_name: "Carlos",
    }

    const result = updateStaffSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.municipality_id).toBeUndefined()
      expect(result.data.first_name).toBe("Carlos")
    }
  })

  it("accepts null for last_name", () => {
    const payload = {
      first_name: "Administrator",
      last_name: null,
    }

    const result = updateStaffSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.last_name).toBeNull()
    }
  })

  it("rejects empty string for first_name when provided", () => {
    const payload = {
      first_name: "",
    }

    const result = updateStaffSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})

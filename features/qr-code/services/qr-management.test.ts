import { describe, expect, test, mock } from "bun:test"
import type { QRCodeStatus } from "../types"

describe("updateQrCodeStatus", () => {
  test("rejects invalid status values", async () => {
    const { updateQrCodeStatus } = await import("./qr-management")
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQrCodeStatus("qr-123", "unknown_status" as any, "mun-123")
    ).rejects.toThrow("Invalid QR code status: unknown_status")
  })

  test("rejects when municipality has no sites", async () => {
    const fakeSupabase = {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            neq: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
    }

    mock.module("@/utils/supabase/server", () => ({
      createClient: () => fakeSupabase,
    }))

    mock.module("next/headers", () => ({
      cookies: async () => ({
        getAll: () => [],
      }),
    }))

    const { updateQrCodeStatus } = await import("./qr-management")
    expect(
      updateQrCodeStatus("qr-123", "inactive", "mun-empty")
    ).rejects.toThrow("No sites found for this municipality")
  })

  test("successfully updates QR code status for site in municipality", async () => {
    let updatePayload: Record<string, unknown> | null = null
    let updateFilters: Record<string, unknown> = {}

    const fakeSupabase = {
      from: (table: string) => {
        if (table === "heritage_sites") {
          return {
            select: () => ({
              eq: () => ({
                neq: () => Promise.resolve({ data: [{ id: "site-1" }, { id: "site-2" }] }),
              }),
            }),
          }
        }
        if (table === "qr_codes") {
          return {
            update: (payload: Record<string, unknown>) => {
              updatePayload = payload
              const builder = {
                eq: (col: string, val: unknown) => {
                  updateFilters[col] = val
                  return builder
                },
                in: (col: string, vals: unknown) => {
                  updateFilters[col] = vals
                  return Promise.resolve({ error: null })
                },
              }
              return builder
            },
          }
        }
        throw new Error(`Unexpected table ${table}`)
      },
    }

    mock.module("@/utils/supabase/server", () => ({
      createClient: () => fakeSupabase,
    }))

    const { updateQrCodeStatus } = await import("./qr-management")
    await updateQrCodeStatus("qr-abc", "inactive", "mun-taal")

    expect(updatePayload).toEqual({ status: "inactive" })
    expect(updateFilters["id"]).toBe("qr-abc")
    expect(updateFilters["site_id"]).toEqual(["site-1", "site-2"])
  })

  test("propagates database error with descriptive message", async () => {
    const fakeSupabase = {
      from: (table: string) => {
        if (table === "heritage_sites") {
          return {
            select: () => ({
              eq: () => ({
                neq: () => Promise.resolve({ data: [{ id: "site-1" }] }),
              }),
            }),
          }
        }
        if (table === "qr_codes") {
          return {
            update: () => ({
              eq: () => ({
                in: () => Promise.resolve({ error: { message: "new row violates row-level security policy for table \"qr_codes\"" } }),
              }),
            }),
          }
        }
        throw new Error(`Unexpected table ${table}`)
      },
    }

    mock.module("@/utils/supabase/server", () => ({
      createClient: () => fakeSupabase,
    }))

    const { updateQrCodeStatus } = await import("./qr-management")
    expect(
      updateQrCodeStatus("qr-xyz", "active", "mun-taal")
    ).rejects.toThrow("Failed to update QR code status: new row violates row-level security policy for table \"qr_codes\"")
  })
})

describe("resolveQRCode", () => {
  test("resolves from full URL, lowercase code, and raw code value", async () => {
    const mockQr = {
      id: "qr-1",
      site_id: "833188bf-e4aa-42b2-a482-ef6e551d1838",
      code_value: "TCDSS-7VE5NH",
      status: "active",
    }
    const mockSite = {
      id: "833188bf-e4aa-42b2-a482-ef6e551d1838",
      site_name: "Amerfino Punzalan",
      publication_status: "published",
      visibility: "public",
    }

    const fakeSupabase = {
      from: (table: string) => {
        if (table === "qr_codes") {
          return {
            select: () => {
              const chain = {
                ilike: (_col: string, val: string) => {
                  const match = val.toUpperCase() === mockQr.code_value.toUpperCase() ? mockQr : null
                  return {
                    maybeSingle: () => Promise.resolve({ data: match, error: null }),
                  }
                },
                or: () => ({
                  maybeSingle: () => Promise.resolve({ data: mockQr, error: null }),
                }),
              }
              return chain
            },
          }
        }
        if (table === "heritage_sites") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: mockSite, error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      },
    }

    mock.module("@/utils/supabase/server", () => ({
      createClient: () => fakeSupabase,
    }))

    mock.module("next/headers", () => ({
      cookies: async () => ({
        getAll: () => [],
      }),
    }))

    const { resolveQRCode } = await import("./index")

    // 1. Raw code value
    const res1 = await resolveQRCode("TCDSS-7VE5NH")
    expect(res1.success).toBe(true)
    expect(res1.siteId).toBe("833188bf-e4aa-42b2-a482-ef6e551d1838")
    expect(res1.siteName).toBe("Amerfino Punzalan")

    // 2. Full URL from production domain
    const res2 = await resolveQRCode("https://cultural-heritage.techsite.live/qr/TCDSS-7VE5NH")
    expect(res2.success).toBe(true)
    expect(res2.siteId).toBe("833188bf-e4aa-42b2-a482-ef6e551d1838")

    // 3. Full URL from vercel domain
    const res3 = await resolveQRCode("https://cultural-heritage-three.vercel.app/qr/TCDSS-7VE5NH")
    expect(res3.success).toBe(true)

    // 4. Lowercase and padded with whitespace
    const res4 = await resolveQRCode("  tcdss-7ve5nh  ")
    expect(res4.success).toBe(true)
  })
})

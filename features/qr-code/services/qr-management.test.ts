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

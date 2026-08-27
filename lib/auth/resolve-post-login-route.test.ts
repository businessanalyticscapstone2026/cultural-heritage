import { describe, expect, test } from "bun:test"
import { resolvePostLoginRoute, isPathAuthorizedForRole } from "./resolve-post-login-route"

function createFakeSupabase(tables: Record<string, Record<string, unknown>[]>) {
  function from(table: string) {
    const filters: Record<string, unknown> = {}
    const builder: Record<string, unknown> = {}
    builder.select = () => builder
    builder.eq = (col: string, val: unknown) => {
      filters[col] = val
      return builder
    }
    builder.maybeSingle = () =>
      Promise.resolve({
        data: (tables[table] ?? []).find((row) => Object.entries(filters).every(([k, v]) => row[k] === v)) ?? null,
        error: null,
      })
    return builder
  }
  return { from } as unknown as Parameters<typeof resolvePostLoginRoute>[0]
}

const MTO_STAFF_ID = "mto-staff-id"
const OTHER_STAFF_ID = "admin-staff-id"
const ONBOARDED_TOURIST_ID = "onboarded-tourist-id"
const NEW_TOURIST_ID = "new-tourist-id"
const UNKNOWN_ID = "unknown-id"

const supabase = createFakeSupabase({
  staff_profiles: [
    { id: MTO_STAFF_ID, roles: { name: "MTO Staff" } },
    { id: OTHER_STAFF_ID, roles: { name: "PTCAO Admin" } },
  ],
  tourist_profiles: [
    { id: ONBOARDED_TOURIST_ID, onboarding_completed_at: "2026-01-01T00:00:00Z" },
    { id: NEW_TOURIST_ID, onboarding_completed_at: null },
  ],
})

describe("resolvePostLoginRoute", () => {
  test("MTO staff resolves to the MTO dashboard", async () => {
    const resolved = await resolvePostLoginRoute(supabase, MTO_STAFF_ID)
    expect(resolved).toEqual({ role: "mto_staff", defaultRoute: "/mto/dashboard" })
  })

  test("non-MTO staff resolves to the admin dashboard", async () => {
    const resolved = await resolvePostLoginRoute(supabase, OTHER_STAFF_ID)
    expect(resolved).toEqual({ role: "admin_staff", defaultRoute: "/admin/dashboard" })
  })

  test("onboarded tourist resolves to /home", async () => {
    const resolved = await resolvePostLoginRoute(supabase, ONBOARDED_TOURIST_ID)
    expect(resolved).toEqual({ role: "tourist", defaultRoute: "/home" })
  })

  test("tourist without onboarding resolves to /onboarding", async () => {
    const resolved = await resolvePostLoginRoute(supabase, NEW_TOURIST_ID)
    expect(resolved).toEqual({ role: "tourist", defaultRoute: "/onboarding" })
  })

  test("account with no profile resolves to null", async () => {
    const resolved = await resolvePostLoginRoute(supabase, UNKNOWN_ID)
    expect(resolved).toBeNull()
  })
})

describe("isPathAuthorizedForRole", () => {
  test("allows a path under the role's own prefix", () => {
    expect(isPathAuthorizedForRole("/mto/heritage-sites", "mto_staff")).toBe(true)
    expect(isPathAuthorizedForRole("/admin/users", "admin_staff")).toBe(true)
    expect(isPathAuthorizedForRole("/onboarding", "tourist")).toBe(true)
  })

  test("rejects a path outside the role's authorized prefixes", () => {
    expect(isPathAuthorizedForRole("/admin/users", "mto_staff")).toBe(false)
    expect(isPathAuthorizedForRole("/mto/dashboard", "tourist")).toBe(false)
  })

  test("rejects protocol-relative paths to guard against open redirects", () => {
    expect(isPathAuthorizedForRole("//evil.com", "tourist")).toBe(false)
  })

  test("rejects paths that don't start with a slash", () => {
    expect(isPathAuthorizedForRole("mto/dashboard", "mto_staff")).toBe(false)
  })
})

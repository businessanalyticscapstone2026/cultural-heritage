import { describe, expect, test, mock, beforeEach, spyOn } from "bun:test"
import { NextRequest } from "next/server"

type Row = Record<string, unknown>

const state = {
  tables: { staff_profiles: [] as Row[], tourist_profiles: [] as Row[] } as Record<string, Row[]>,
  exchangeUser: null as Row | null,
  exchangeError: null as { message: string; code?: string } | null,
  upsertError: null as { message: string } | null,
  upsertCalls: [] as { row: Row; options: unknown }[],
  signOutCalls: [] as unknown[],
  deleteUserCalls: [] as unknown[],
}

function from(table: string) {
  const filters: Row = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
    select: () => builder,
    eq: (col: string, val: unknown) => { filters[col] = val; return builder },
    maybeSingle: async () => ({
      data: (state.tables[table] ?? []).find((r) => Object.entries(filters).every(([k, v]) => r[k] === v)) ?? null,
      error: null,
    }),
    upsert: async (row: Row, options: unknown) => {
      state.upsertCalls.push({ row, options })
      if (state.upsertError) return { error: state.upsertError }
      const rows = (state.tables[table] ??= [])
      if (!rows.some((r) => r.id === row.id)) rows.push({ onboarding_completed_at: null, ...row })
      return { error: null }
    },
  }
  return builder
}

const userClient = {
  from,
  auth: {
    exchangeCodeForSession: async () => ({
      data: { user: state.exchangeError ? null : state.exchangeUser, session: state.exchangeError ? null : {} },
      error: state.exchangeError,
    }),
    signOut: async (opts: unknown) => { state.signOutCalls.push(opts); return { error: null } },
  },
}
const adminClient = {
  from,
  auth: { admin: { deleteUser: async (id: string) => { state.deleteUserCalls.push(id); return { error: null } } } },
}

mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
mock.module("@/utils/supabase/server", () => ({ createClient: () => userClient }))
mock.module("@/utils/supabase/admin", () => ({ createAdminClient: () => adminClient }))

const { GET } = await import("./route")

const BASE = "http://localhost:3000/auth/callback"
const call = async (query: string) => {
  const res = await GET(new NextRequest(`${BASE}${query}`))
  return res.headers.get("location")?.replace("http://localhost:3000", "")
}

const NEW_USER = { id: "new-user", email: "new.person@gmail.com", user_metadata: { given_name: "New", family_name: "Person" } }

let errorLog: ReturnType<typeof spyOn>
beforeEach(() => {
  state.tables = { staff_profiles: [], tourist_profiles: [] }
  state.exchangeUser = NEW_USER
  state.exchangeError = null
  state.upsertError = null
  state.upsertCalls = []
  state.signOutCalls = []
  state.deleteUserCalls = []
  errorLog?.mockRestore()
  errorLog = spyOn(console, "error").mockImplementation(() => {})
})

describe("GET /auth/callback", () => {
  test("missing code redirects to oauth-error and logs why", async () => {
    expect(await call("")).toBe("/login?reason=oauth-error")
    expect(String(errorLog.mock.calls[0][0])).toContain("missing code")
  })

  test("provider error (e.g. user cancelled) redirects to oauth-error", async () => {
    expect(await call("?error=access_denied&error_description=cancelled")).toBe("/login?reason=oauth-error")
    expect(String(errorLog.mock.calls[0][0])).toContain("provider returned an error")
  })

  test("failed code exchange redirects to oauth-error", async () => {
    state.exchangeError = { message: "invalid flow state", code: "flow_state_not_found" }
    expect(await call("?code=bad")).toBe("/login?reason=oauth-error")
    expect(String(errorLog.mock.calls[0][0])).toContain("code exchange failed")
  })

  test("onboarded tourist goes to /home", async () => {
    state.tables.tourist_profiles.push({ id: NEW_USER.id, onboarding_completed_at: "2026-01-01T00:00:00Z" })
    expect(await call("?code=ok")).toBe("/home")
    expect(state.upsertCalls).toHaveLength(0)
  })

  test("tourist not yet onboarded goes to /onboarding", async () => {
    state.tables.tourist_profiles.push({ id: NEW_USER.id, onboarding_completed_at: null })
    expect(await call("?code=ok")).toBe("/onboarding")
  })

  test("new user gets a tourist profile from Google names and goes to /onboarding", async () => {
    expect(await call("?code=ok")).toBe("/onboarding")
    expect(state.upsertCalls[0]).toEqual({
      row: { id: "new-user", first_name: "New", last_name: "Person" },
      options: { onConflict: "id", ignoreDuplicates: true },
    })
  })

  test("orphan auth user (no profile) gets a profile, names from full_name", async () => {
    state.exchangeUser = { id: "orphan", email: "o@gmail.com", user_metadata: { full_name: "Maria Clara Santos" } }
    expect(await call("?code=ok")).toBe("/onboarding")
    expect(state.upsertCalls[0].row).toEqual({ id: "orphan", first_name: "Maria Clara", last_name: "Santos" })
  })

  test("no name metadata falls back to the email prefix", async () => {
    state.exchangeUser = { id: "bare", email: "juan@gmail.com", user_metadata: {} }
    await call("?code=ok")
    expect(state.upsertCalls[0].row).toEqual({ id: "bare", first_name: "juan", last_name: "" })
  })

  test.each([
    ["MTO Staff"],
    ["PTCAO Admin"],
  ])("staff (%s) is signed out and rejected", async (roleName) => {
    state.tables.staff_profiles.push({ id: NEW_USER.id, roles: { name: roleName } })
    expect(await call("?code=ok")).toBe("/login?reason=google-staff-not-allowed")
    expect(state.signOutCalls).toEqual([{ scope: "local" }])
    expect(state.upsertCalls).toHaveLength(0)
  })

  test("profile insert failure signs out, does NOT delete the user", async () => {
    state.upsertError = { message: "db down" }
    expect(await call("?code=ok")).toBe("/login?reason=profile-error")
    expect(state.signOutCalls).toEqual([{ scope: "local" }])
    expect(state.deleteUserCalls).toHaveLength(0)
  })

  test.each([["//evil.com"], ["https://evil.com"], ["/admin/dashboard"]])(
    "next=%s is ignored for a tourist",
    async (next) => {
      expect(await call(`?code=ok&next=${encodeURIComponent(next)}`)).toBe("/onboarding")
    },
  )

  test("authorized next path is honored", async () => {
    state.tables.tourist_profiles.push({ id: NEW_USER.id, onboarding_completed_at: "2026-01-01T00:00:00Z" })
    expect(await call(`?code=ok&next=${encodeURIComponent("/home/saved")}`)).toBe("/home/saved")
  })

  test("two simultaneous requests for a new user create one profile, no error", async () => {
    const [a, b] = await Promise.all([call("?code=ok"), call("?code=ok")])
    expect([a, b]).toEqual(["/onboarding", "/onboarding"])
    expect(state.tables.tourist_profiles).toHaveLength(1)
  })
})

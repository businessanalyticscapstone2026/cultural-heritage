import { describe, expect, test } from "bun:test"
import { AuthApiError, AuthRetryableFetchError, type SupabaseClient } from "@supabase/supabase-js"
import { authenticatePortalRequest, extractBearerToken } from "./auth"

const USER_ID = "aaaaaaaa-1111-4111-8111-111111111111"

function fakeClient(getUser: () => Promise<unknown>): (token: string) => SupabaseClient {
  return () => ({ auth: { getUser } }) as unknown as SupabaseClient
}

describe("extractBearerToken", () => {
  test("missing header is 401", () => {
    expect(() => extractBearerToken(null)).toThrow(expect.objectContaining({ status: 401, code: "unauthenticated" }))
  })

  test("wrong scheme or malformed token is 401", () => {
    for (const h of ["Basic abc", "Bearer", "Bearer ", "Bearer a b", "Bearer <script>", `Bearer ${"a".repeat(5000)}`]) {
      expect(() => extractBearerToken(h)).toThrow(expect.objectContaining({ status: 401 }))
    }
  })

  test("accepts a JWT-shaped token, scheme case-insensitive", () => {
    expect(extractBearerToken("bearer aaa.bbb.ccc")).toBe("aaa.bbb.ccc")
  })
})

describe("authenticatePortalRequest", () => {
  test("invalid/expired token is 401", async () => {
    const create = fakeClient(async () => ({
      data: { user: null },
      error: new AuthApiError("invalid JWT", 401, "bad_jwt"),
    }))
    await expect(authenticatePortalRequest("Bearer a.b.c", create)).rejects.toMatchObject({
      status: 401,
      code: "unauthenticated",
    })
  })

  test("no user without error is 401", async () => {
    const create = fakeClient(async () => ({ data: { user: null }, error: null }))
    await expect(authenticatePortalRequest("Bearer a.b.c", create)).rejects.toMatchObject({ status: 401 })
  })

  test("auth service unreachable is 503, not 401", async () => {
    const create = fakeClient(async () => ({
      data: { user: null },
      error: new AuthRetryableFetchError("fetch failed", 0),
    }))
    await expect(authenticatePortalRequest("Bearer a.b.c", create)).rejects.toMatchObject({
      status: 503,
      code: "dependency_unavailable",
    })
  })

  test("valid token returns the token-scoped client and user id", async () => {
    let seenToken = ""
    const client = { auth: { getUser: async () => ({ data: { user: { id: USER_ID } }, error: null }) } }
    const ctx = await authenticatePortalRequest("Bearer a.b.c", (token) => {
      seenToken = token
      return client as unknown as SupabaseClient
    })
    expect(seenToken).toBe("a.b.c")
    expect(ctx.userId).toBe(USER_ID)
    expect(ctx.supabase).toBe(client as unknown as SupabaseClient)
  })
})

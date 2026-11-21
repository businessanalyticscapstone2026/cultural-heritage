import { describe, expect, test, mock } from "bun:test"

describe("Audit Services", () => {
  test("getAuditLogs fetches logs and batch-hydrates staff profile names", async () => {
    const mockAuditLogs = [
      {
        id: "log-1",
        user_id: "user-1",
        category: "heritage",
        action: "created_site",
        target_type: "heritage_sites",
        target_id: "site-101",
        detail: JSON.stringify({ name: "Historic Church" }),
        ip_address: "127.0.0.1",
        user_agent: "Mozilla/5.0",
        created_at: "2026-11-20T10:00:00Z",
      },
      {
        id: "log-2",
        user_id: null,
        category: "system",
        action: "cron_sync",
        target_type: null,
        target_id: null,
        detail: null,
        ip_address: null,
        user_agent: null,
        created_at: "2026-11-20T11:00:00Z",
      },
    ]

    const mockStaffProfiles = [
      {
        id: "user-1",
        first_name: "Maria",
        last_name: "Santos",
        username: "msantos",
      },
    ]

    const fakeSupabase = {
      from: (table: string) => {
        if (table === "audit_logs") {
          return {
            select: () => {
              const chain: Record<string, unknown> = {
                order: () => chain,
                limit: () => Promise.resolve({ data: mockAuditLogs, error: null }),
                eq: () => chain,
                gte: () => chain,
                lte: () => chain,
                or: () => chain,
              }
              return chain
            },
          }
        }
        if (table === "staff_profiles") {
          return {
            select: () => ({
              in: (_col: string, _ids: string[]) =>
                Promise.resolve({ data: mockStaffProfiles, error: null }),
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

    const { getAuditLogs } = await import("./index")
    const results = await getAuditLogs()

    expect(results).toHaveLength(2)
    expect(results[0].userName).toBe("Maria Santos")
    expect(results[0].action).toBe("created_site")
    expect(results[0].detail).toEqual({ name: "Historic Church" })

    expect(results[1].userName).toBeNull()
    expect(results[1].action).toBe("cron_sync")
    expect(results[1].userId).toBeNull()
  })

  test("getLoginAttempts fetches attempts and maps email and user profile name", async () => {
    const mockAttempts = [
      {
        id: "att-1",
        user_id: "user-2",
        email_attempted: "mto_taal@example.com",
        outcome: "success",
        ip_address: "192.168.1.1",
        user_agent: "Chrome",
        created_at: "2026-11-20T08:00:00Z",
      },
    ]

    const mockProfiles = [
      {
        id: "user-2",
        first_name: "Juan",
        last_name: "Dela Cruz",
        username: "jdelacruz",
      },
    ]

    const fakeSupabase = {
      from: (table: string) => {
        if (table === "login_attempts") {
          return {
            select: () => {
              const chain: Record<string, unknown> = {
                order: () => chain,
                limit: () => Promise.resolve({ data: mockAttempts, error: null }),
                eq: () => chain,
                gte: () => chain,
                lte: () => chain,
              }
              return chain
            },
          }
        }
        if (table === "staff_profiles") {
          return {
            select: () => ({
              in: () => Promise.resolve({ data: mockProfiles, error: null }),
            }),
          }
        }
        return {}
      },
    }

    mock.module("@/utils/supabase/server", () => ({
      createClient: () => fakeSupabase,
    }))

    const { getLoginAttempts } = await import("./index")
    const attempts = await getLoginAttempts()

    expect(attempts).toHaveLength(1)
    expect(attempts[0].emailAttempted).toBe("mto_taal@example.com")
    expect(attempts[0].userName).toBe("Juan Dela Cruz")
    expect(attempts[0].outcome).toBe("success")
  })

  test("getSecurityEvents fetches events and batch-hydrates user profile name", async () => {
    const mockEvents = [
      {
        id: "sec-1",
        user_id: "user-3",
        event_type: "unauthorized_role_switch",
        detail: "Tried to access admin route without PTCAO role",
        ip_address: "10.0.0.1",
        user_agent: "Firefox",
        created_at: "2026-11-20T09:00:00Z",
      },
    ]

    const mockProfiles = [
      {
        id: "user-3",
        first_name: null,
        last_name: null,
        username: "unknown_staff",
      },
    ]

    const fakeSupabase = {
      from: (table: string) => {
        if (table === "security_events") {
          return {
            select: () => {
              const chain: Record<string, unknown> = {
                order: () => chain,
                limit: () => Promise.resolve({ data: mockEvents, error: null }),
                eq: () => chain,
                gte: () => chain,
                lte: () => chain,
              }
              return chain
            },
          }
        }
        if (table === "staff_profiles") {
          return {
            select: () => ({
              in: () => Promise.resolve({ data: mockProfiles, error: null }),
            }),
          }
        }
        return {}
      },
    }

    mock.module("@/utils/supabase/server", () => ({
      createClient: () => fakeSupabase,
    }))

    const { getSecurityEvents } = await import("./index")
    const events = await getSecurityEvents()

    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe("unauthorized_role_switch")
    expect(events[0].userName).toBe("unknown_staff")
    expect(events[0].detail).toBe("Tried to access admin route without PTCAO role")
  })
})

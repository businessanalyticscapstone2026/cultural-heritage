import { describe, expect, test } from "bun:test"
import { checkOrigin, corsHeaders, parseAllowedOrigins, preflightHeaders } from "./cors"

const PORTAL = "https://taal.example.gov.ph"

describe("parseAllowedOrigins", () => {
  test("parses a comma-separated list and trims whitespace", () => {
    const set = parseAllowedOrigins(` ${PORTAL} , http://localhost:5173 ,,`)
    expect([...set]).toEqual([PORTAL, "http://localhost:5173"])
  })

  test("drops wildcards, paths, trailing slashes and garbage", () => {
    const set = parseAllowedOrigins(`*,https://*.gov.ph,${PORTAL}/,${PORTAL}/app,not a url,ftp://x.ph`)
    expect(set.size).toBe(0)
  })

  test("empty or missing env allows no origin", () => {
    expect(parseAllowedOrigins(undefined).size).toBe(0)
    expect(parseAllowedOrigins("").size).toBe(0)
  })
})

describe("checkOrigin", () => {
  const allowed = parseAllowedOrigins(PORTAL)

  test("exact match only", () => {
    expect(checkOrigin(PORTAL, allowed)).toEqual({ kind: "allowed", origin: PORTAL })
    expect(checkOrigin("https://TAAL.example.gov.ph", allowed).kind).toBe("denied")
    expect(checkOrigin(`${PORTAL}.evil.com`, allowed).kind).toBe("denied")
    expect(checkOrigin("http://taal.example.gov.ph", allowed).kind).toBe("denied")
  })

  test("no Origin header is not a browser cross-origin request", () => {
    expect(checkOrigin(null, allowed)).toEqual({ kind: "none" })
    expect(checkOrigin("", allowed)).toEqual({ kind: "none" })
  })
})

describe("corsHeaders", () => {
  test("echoes only an allowed origin, always sets Vary, never credentials or *", () => {
    const ok = corsHeaders({ kind: "allowed", origin: PORTAL })
    expect(ok["Access-Control-Allow-Origin"]).toBe(PORTAL)
    expect(ok.Vary).toBe("Origin")
    expect(ok["Access-Control-Allow-Credentials"]).toBeUndefined()

    const denied = corsHeaders({ kind: "denied", origin: "https://evil.com" })
    expect(denied["Access-Control-Allow-Origin"]).toBeUndefined()
    expect(denied.Vary).toBe("Origin")
  })

  test("preflight lists methods and the two allowed headers", () => {
    const headers = preflightHeaders({ kind: "allowed", origin: PORTAL }, ["GET", "POST", "OPTIONS"])
    expect(headers["Access-Control-Allow-Methods"]).toBe("GET, POST, OPTIONS")
    expect(headers["Access-Control-Allow-Headers"]).toBe("Authorization, Content-Type")
    expect(headers["Access-Control-Allow-Origin"]).toBe(PORTAL)
  })
})

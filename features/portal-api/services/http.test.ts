import { describe, expect, test } from "bun:test"
import {
  cacheableJsonResponse,
  computeEtag,
  errorResponse,
  etagMatches,
  readBodyText,
  readJsonBody,
  PUBLIC_CACHE_CONTROL,
} from "./http"
import { PortalApiError, dependencyUnavailable } from "./portal-errors"

const URL_ = "https://tcdss.example/api/v1/taal/reviews"

function streamingRequest(chunks: string[], headers: Record<string, string> = {}): Request {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(new TextEncoder().encode(c))
      controller.close()
    },
  })
  return new Request(URL_, { method: "POST", body: stream, headers, duplex: "half" } as RequestInit)
}

describe("ETag / 304", () => {
  test("etagMatches handles lists, weak tags and *", () => {
    expect(etagMatches('"abc"', '"abc"')).toBe(true)
    expect(etagMatches('W/"abc"', '"abc"')).toBe(true)
    expect(etagMatches('"x", "abc"', '"abc"')).toBe(true)
    expect(etagMatches("*", '"abc"')).toBe(true)
    expect(etagMatches('"x"', '"abc"')).toBe(false)
    expect(etagMatches(null, '"abc"')).toBe(false)
  })

  test("returns 200 with ETag and CDN headers, then 304 for the same payload", async () => {
    const body = { data: [1], meta: {} }
    const first = await cacheableJsonResponse(new Request(URL_), body, { Vary: "Origin" })
    expect(first.status).toBe(200)
    expect(first.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL)
    expect(first.headers.get("Vary")).toBe("Origin")
    const etag = first.headers.get("ETag")
    expect(etag).toBe(await computeEtag(JSON.stringify(body)))

    const second = await cacheableJsonResponse(
      new Request(URL_, { headers: { "If-None-Match": etag! } }),
      body
    )
    expect(second.status).toBe(304)
    expect(await second.text()).toBe("")
  })
})

describe("error envelope", () => {
  test("{ error, code } with no-store and Retry-After on 503", async () => {
    const res = errorResponse(dependencyUnavailable("connection refused at 10.0.0.5"))
    expect(res.status).toBe(503)
    expect(res.headers.get("Retry-After")).toBe("30")
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    const body = await res.json()
    expect(Object.keys(body).sort()).toEqual(["code", "error"])
    expect(JSON.stringify(body)).not.toContain("10.0.0.5")
  })

  test("422 carries field details", async () => {
    const res = errorResponse(
      new PortalApiError(422, "validation_failed", "Review is invalid.", { details: { comment: ["Too long"] } })
    )
    expect(await res.json()).toEqual({
      error: "Review is invalid.",
      code: "validation_failed",
      details: { comment: ["Too long"] },
    })
  })
})

describe("body limits", () => {
  test("rejects by Content-Length before reading", async () => {
    const req = new Request(URL_, { method: "POST", body: "x", headers: { "content-length": "999999" } })
    await expect(readBodyText(req, 10)).rejects.toMatchObject({ status: 413, code: "payload_too_large" })
  })

  test("rejects a streamed body that exceeds the cap (no Content-Length)", async () => {
    await expect(readBodyText(streamingRequest(["12345", "67890", "X"]), 10)).rejects.toMatchObject({
      status: 413,
    })
  })

  test("reads a body within the cap", async () => {
    expect(await readBodyText(streamingRequest(["héllo ", "wörld"]), 100)).toBe("héllo wörld")
  })

  test("readJsonBody requires application/json and valid JSON", async () => {
    const plain = new Request(URL_, { method: "POST", body: "{}", headers: { "content-type": "text/plain" } })
    await expect(readJsonBody(plain, 100)).rejects.toMatchObject({ status: 415 })

    const bad = new Request(URL_, { method: "POST", body: "{nope", headers: { "content-type": "application/json" } })
    await expect(readJsonBody(bad, 100)).rejects.toMatchObject({ status: 400, code: "invalid_json" })

    const ok = new Request(URL_, {
      method: "POST",
      body: '{"a":1}',
      headers: { "content-type": "application/json; charset=utf-8" },
    })
    expect(await readJsonBody(ok, 100)).toEqual({ a: 1 })
  })
})

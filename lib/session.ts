import { cookies } from "next/headers"

export const SESSION_COOKIE_NAME = "session_id"

export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export async function readSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function ensureSessionId(): Promise<string> {
  const existing = await readSessionId()
  if (existing) return existing

  const sessionId = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_COOKIE_MAX_AGE,
  })
  return sessionId
}

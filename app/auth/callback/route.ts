import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { resolvePostLoginRoute, isPathAuthorizedForRole } from "@/lib/auth/resolve-post-login-route"

/**
 * Supabase Auth OAuth (Google) callback. Exchanges the PKCE `code` for a session,
 * creates a tourist profile for first-time Google users, and routes by role.
 * Google sign-in is tourist-only: staff accounts must use email + password, because
 * Supabase links identities by email and staff addresses are not guaranteed to be ours.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl

  const fail = (reason: string, message: string, detail?: unknown) => {
    // Stringify so the reason survives log collectors that drop plain objects.
    console.error(`[auth/callback] ${message}${detail ? ` ${JSON.stringify(detail)}` : ""}`)
    return NextResponse.redirect(`${origin}/login?reason=${reason}`)
  }

  const providerError = searchParams.get("error")
  if (providerError) {
    return fail("oauth-error", "provider returned an error", {
      error: providerError,
      description: searchParams.get("error_description"),
    })
  }

  const code = searchParams.get("code")
  if (!code) return fail("oauth-error", "missing code parameter")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError || !data.user) {
    return fail("oauth-error", "code exchange failed", {
      message: exchangeError?.message,
      code: exchangeError?.code,
    })
  }

  const user = data.user
  let resolved = await resolvePostLoginRoute(supabase, user.id)

  if (resolved && resolved.role !== "tourist") {
    await supabase.auth.signOut({ scope: "local" })
    return fail("google-staff-not-allowed", "staff account tried Google sign-in", { userId: user.id })
  }

  if (!resolved) {
    // New Google user, or an existing auth user that never got a profile.
    const { error: profileError } = await createAdminClient()
      .from("tourist_profiles")
      .upsert({ id: user.id, ...profileNames(user) }, { onConflict: "id", ignoreDuplicates: true })

    if (profileError) {
      await supabase.auth.signOut({ scope: "local" })
      return fail("profile-error", "tourist profile creation failed", {
        userId: user.id,
        message: profileError.message,
      })
    }

    resolved = await resolvePostLoginRoute(supabase, user.id)
  }

  if (!resolved) {
    await supabase.auth.signOut({ scope: "local" })
    return fail("no-profile", "profile still missing after creation", { userId: user.id })
  }

  const next = searchParams.get("next")
  const destination = next && isPathAuthorizedForRole(next, resolved.role) ? next : resolved.defaultRoute
  return NextResponse.redirect(`${origin}${destination}`)
}

function profileNames(user: User): { first_name: string; last_name: string } {
  const meta = user.user_metadata ?? {}
  const given = typeof meta.given_name === "string" ? meta.given_name.trim() : ""
  const family = typeof meta.family_name === "string" ? meta.family_name.trim() : ""
  if (given) return { first_name: given, last_name: family }

  const full = String(meta.full_name ?? meta.name ?? "").trim()
  if (full) {
    const parts = full.split(/\s+/)
    const last = parts.length > 1 ? parts.pop()! : ""
    return { first_name: parts.join(" "), last_name: last }
  }

  return { first_name: (user.email ?? "").split("@")[0], last_name: "" }
}

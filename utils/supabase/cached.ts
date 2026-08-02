import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

/**
 * Cookie-free Supabase client for use inside `unstable_cache` scopes.
 * `cookies()` / `headers()` cannot be read inside a cache callback, so the
 * caller's access token is passed as a serializable cache-key argument and
 * applied via the Authorization header.
 */
export function createTokenClient(accessToken: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  return createSupabaseJsClient(url, key, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Resolve the current session access token outside of any cache scope.
 * Creates the cookie-bound server client once for the session lookup.
 */
export async function resolveAccessToken(): Promise<string> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token ?? ""
  } catch {
    return ""
  }
}

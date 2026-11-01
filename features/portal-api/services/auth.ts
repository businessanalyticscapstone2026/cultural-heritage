import { isAuthApiError, isAuthRetryableFetchError, type SupabaseClient } from "@supabase/supabase-js"
import { createTokenClient } from "@/utils/supabase/cached"
import { dependencyUnavailable, PortalApiError } from "./portal-errors"

/**
 * Bearer authentication for portal writes. No custom auth scheme: the token
 * is a Supabase access token for a user of THIS Supabase project, verified by
 * Supabase Auth (getUser). The returned client carries the same token, so
 * every query and the review RPC run under that user's RLS policies, exactly
 * as on the main site. The service-role client is never used.
 */

/** Generous upper bound for a Supabase JWT; anything longer is rejected unread. */
const MAX_TOKEN_LENGTH = 4096
const TOKEN_PATTERN = /^[A-Za-z0-9\-_.=]+$/

export interface PortalAuthContext {
  supabase: SupabaseClient
  userId: string
}

function unauthenticated(message: string): PortalApiError {
  return new PortalApiError(401, "unauthenticated", message)
}

/** "Bearer <token>" (scheme is case-insensitive) or a 401. */
export function extractBearerToken(header: string | null): string {
  if (!header) throw unauthenticated("Missing Authorization header. Use: Bearer <access token>.")
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header)
  const token = match?.[1]
  if (!token || token.length > MAX_TOKEN_LENGTH || !TOKEN_PATTERN.test(token)) {
    throw unauthenticated("Malformed Authorization header. Use: Bearer <access token>.")
  }
  return token
}

export async function authenticatePortalRequest(
  authorizationHeader: string | null,
  createClient: (token: string) => SupabaseClient = createTokenClient
): Promise<PortalAuthContext> {
  const token = extractBearerToken(authorizationHeader)
  const supabase = createClient(token)

  let result: Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>
  try {
    result = await supabase.auth.getUser(token)
  } catch (err) {
    throw dependencyUnavailable(err instanceof Error ? err.message : String(err))
  }

  const { data, error } = result
  if (error) {
    if (isAuthRetryableFetchError(error)) throw dependencyUnavailable(error.message)
    if (isAuthApiError(error) && error.status >= 500) throw dependencyUnavailable(error.message)
    throw unauthenticated("Invalid or expired access token.")
  }
  if (!data.user) throw unauthenticated("Invalid or expired access token.")

  return { supabase, userId: data.user.id }
}

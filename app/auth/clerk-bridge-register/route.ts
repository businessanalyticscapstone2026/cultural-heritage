import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { resolvePostLoginRoute } from "@/lib/auth/resolve-post-login-route"

/**
 * Bridges a Clerk-authenticated Google identity into a real Supabase Auth session.
 * Clerk only brokers the Google OAuth handshake — the resulting session, RLS, and role
 * resolution are all plain Supabase Auth.
 *
 * Clerk classifies a Google identity as a "sign in" once it has seen it before (including
 * from an earlier attempt that never made it to Supabase, e.g. a dropped connection or a
 * bug), independent of whether the user ever got a Supabase account. So this route can't
 * assume "new to Clerk" == "new to Supabase" — instead it always checks whether a
 * tourist_profiles row exists *after* establishing the session, and creates one if not.
 * This makes it safe as the completion target for both signIn and signUp redirects.
 */
export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
    ?.emailAddress

  if (!email) {
    return NextResponse.redirect(`${origin}/register?reason=oauth-error`)
  }

  const adminClient = createAdminClient()
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: existingUserId } = await adminClient.rpc("get_auth_user_id_by_email", {
    lookup_email: email,
  })

  let touristUserId: string
  let createdAuthUser = false

  if (existingUserId) {
    touristUserId = existingUserId
  } else {
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (createError || !authData.user) {
      return NextResponse.redirect(`${origin}/register?reason=oauth-error`)
    }

    touristUserId = authData.user.id
    createdAuthUser = true
  }

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  })

  if (linkError || !linkData.properties?.email_otp) {
    if (createdAuthUser) await adminClient.auth.admin.deleteUser(touristUserId)
    return NextResponse.redirect(`${origin}/register?reason=oauth-error`)
  }

  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: linkData.properties.email_otp,
    type: "magiclink",
  })

  if (verifyError || !data.session) {
    if (createdAuthUser) await adminClient.auth.admin.deleteUser(touristUserId)
    return NextResponse.redirect(`${origin}/register?reason=oauth-error`)
  }

  let resolved = await resolvePostLoginRoute(supabase, data.session.user.id)

  if (!resolved) {
    const firstName = clerkUser?.firstName?.trim() || email.split("@")[0]
    const lastName = clerkUser?.lastName?.trim() || ""

    const { error: profileError } = await adminClient.from("tourist_profiles").insert({
      id: touristUserId,
      first_name: firstName,
      last_name: lastName,
    })

    if (profileError) {
      await supabase.auth.signOut()
      if (createdAuthUser) await adminClient.auth.admin.deleteUser(touristUserId)
      return NextResponse.redirect(`${origin}/register?reason=oauth-error`)
    }

    resolved = await resolvePostLoginRoute(supabase, data.session.user.id)
  }

  if (!resolved) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?reason=no-profile`)
  }

  return NextResponse.redirect(`${origin}${resolved.defaultRoute}`)
}

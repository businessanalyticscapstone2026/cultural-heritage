import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/utils/supabase/admin"
import { requirePermission } from "@/lib/permissions"
import { getActorScope, getRoleNameById } from "@/lib/mto-scope"
import { logAuditEvent } from "@/features/audit/services"
import { z } from "zod"

const createStaffSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  role_id: z.string().min(1, "Role is required"),
  municipality_id: z.string().optional(),
})

const STAFF_RELATIONS_SELECT = `
  *,
  role:role_id (id, name),
  municipality:municipality_id (id, name),
  creator:created_by (id, first_name, last_name)
`

export async function GET() {
  try {
    await requirePermission("users", "view")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from("staff_profiles")
    .select(STAFF_RELATIONS_SELECT)
    .order("created_at", { ascending: false })

  if (user) {
    const scope = await getActorScope(supabase, user.id)
    if (scope.isMto) {
      if (!scope.municipalityId) {
        return NextResponse.json(
          { error: "Your account is not linked to a municipality" },
          { status: 403 }
        )
      }
      query = query.eq("municipality_id", scope.municipalityId)
    }
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requirePermission("users", "add")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const parsed = createStaffSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const {
    email,
    password,
    first_name,
    last_name,
    username,
    role_id,
    municipality_id,
  } = parsed.data

  // MTO managers may only create accounts inside their own municipality
  // and may only assign MTO-scoped roles.
  const actorScope = await getActorScope(supabase, currentUser.id)
  if (actorScope.isMto) {
    if (!actorScope.municipalityId) {
      return NextResponse.json(
        { error: "Your account is not linked to a municipality" },
        { status: 403 }
      )
    }
    const targetRoleName = await getRoleNameById(supabase, role_id)
    if (targetRoleName !== "MTO Staff") {
      return NextResponse.json(
        { error: "MTO managers can only assign the MTO Staff role" },
        { status: 403 }
      )
    }
  }

  const finalMunicipalityId =
    actorScope.isMto && actorScope.municipalityId
      ? actorScope.municipalityId
      : typeof municipality_id === "string" && municipality_id.trim() === ""
        ? null
        : (municipality_id ?? null)

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", role_id)
    .maybeSingle()

  if (role?.name === "MTO Staff" && !finalMunicipalityId) {
    return NextResponse.json(
      { error: "Municipality is required for MTO Staff accounts" },
      { status: 400 }
    )
  }

  const { data: existingUsername } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (existingUsername) {
    return NextResponse.json(
      { error: `Username "${username}" is already taken` },
      { status: 400 }
    )
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set. Staff account creation requires the service role key." },
      { status: 500 }
    )
  }

  let authUserId: string

  try {
    const adminClient = createAdminClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    })

    if (authError) throw authError
    authUserId = authData.user.id
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create auth user"
    if (/already registered/i.test(message)) {
      return NextResponse.json(
        { error: `Email "${email}" is already registered` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data: createdByProfile } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("id", currentUser.id)
    .maybeSingle()

  const { data: staffProfile, error: profileError } = await supabase
    .from("staff_profiles")
    .insert({
      id: authUserId,
      first_name,
      last_name,
      username,
      role_id,
      municipality_id: finalMunicipalityId,
      account_status: "active",
      created_by: createdByProfile?.id ?? currentUser.id,
    })
    .select(STAFF_RELATIONS_SELECT)
    .single()

  if (profileError) {
    // The auth user was already created above; remove it so a retry doesn't
    // fail with "already registered" while leaving an orphan account behind.
    try {
      const adminClient = createAdminClient()
      await adminClient.auth.admin.deleteUser(authUserId)
    } catch {
      // Best effort — surface the original insert error regardless.
    }
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  try {
    await logAuditEvent({
      category: "user_management",
      action: "staff_created",
      targetType: "staff_profile",
      targetId: staffProfile.id,
      detail: { email, username, role_id, municipality_id: finalMunicipalityId },
    })
  } catch {}

  return NextResponse.json(staffProfile, { status: 201 })
}

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/utils/supabase/admin"
import { requirePermission } from "@/lib/permissions"

export async function GET() {
  try {
    await requirePermission("users", "view")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      role:role_id (id, name),
      municipality:municipality_id (id, name),
      creator:created_by (id, first_name, last_name)
    `)
    .order("created_at", { ascending: false })

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
  const { email, password, first_name, last_name, username, role_id, municipality_id } = body

  if (!email || !password || !first_name || !last_name || !username || !role_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", role_id)
    .maybeSingle()

  if (role?.name === "MTO Staff" && !municipality_id) {
    return NextResponse.json(
      { error: "Municipality is required for MTO Staff accounts" },
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
      municipality_id: municipality_id || null,
      account_status: "active",
      created_by: createdByProfile?.id ?? currentUser.id,
    })
    .select(`
      *,
      role:role_id (id, name),
      municipality:municipality_id (id, name),
      creator:created_by (id, first_name, last_name)
    `)
    .single()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json(staffProfile, { status: 201 })
}

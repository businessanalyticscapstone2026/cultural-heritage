import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { requirePermission } from "@/lib/permissions"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("users", "view")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
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
    .eq("id", id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("users", "edit")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const body = await request.json()

  let roleId = body.role_id as string | undefined
  let currentMunicipalityId: string | null | undefined = undefined

  if (roleId === undefined || body.municipality_id === undefined) {
    const { data: existing } = await supabase
      .from("staff_profiles")
      .select("role_id, municipality_id")
      .eq("id", id)
      .maybeSingle()

    if (existing) {
      if (roleId === undefined) roleId = existing.role_id ?? undefined
      if (body.municipality_id === undefined) {
        currentMunicipalityId = existing.municipality_id
      }
    }
  }

  const finalMunicipalityId =
    body.municipality_id !== undefined ? body.municipality_id : currentMunicipalityId

  if (roleId) {
    const { data: role } = await supabase
      .from("roles")
      .select("name")
      .eq("id", roleId)
      .maybeSingle()

    if (role?.name === "MTO Staff" && !finalMunicipalityId) {
      return NextResponse.json(
        { error: "Municipality is required for MTO Staff accounts" },
        { status: 400 }
      )
    }
  }

  const allowedFields: Record<string, unknown> = {}
  const fieldMap: Record<string, string> = {
    first_name: "first_name",
    last_name: "last_name",
    username: "username",
    role_id: "role_id",
    municipality_id: "municipality_id",
  }

  for (const [inputKey, dbKey] of Object.entries(fieldMap)) {
    if (body[inputKey] !== undefined) {
      allowedFields[dbKey] = body[inputKey]
    }
  }

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  allowedFields.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("staff_profiles")
    .update(allowedFields)
    .eq("id", id)
    .select(`
      *,
      role:role_id (id, name),
      municipality:municipality_id (id, name),
      creator:created_by (id, first_name, last_name)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

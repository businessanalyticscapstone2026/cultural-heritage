import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/utils/supabase/admin"
import { requirePermission } from "@/lib/permissions"
import { logAuditEvent } from "@/features/audit/services"
import { z } from "zod"

const updateStaffSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(1, "Username is required").optional(),
  role_id: z.string().min(1, "Role is required").optional(),
  municipality_id: z.string().optional(),
})

const STAFF_RELATIONS_SELECT = `
  *,
  role:role_id (id, name),
  municipality:municipality_id (id, name),
  creator:created_by (id, first_name, last_name)
`

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
    .select(STAFF_RELATIONS_SELECT)
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

  const parsed = updateStaffSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { first_name, last_name, username, role_id, municipality_id } = parsed.data

  let finalRoleId = role_id
  let resolvedMunicipalityId: string | null | undefined = municipality_id

  if (finalRoleId === undefined || resolvedMunicipalityId === undefined) {
    const { data: existing } = await supabase
      .from("staff_profiles")
      .select("role_id, municipality_id")
      .eq("id", id)
      .maybeSingle()

    if (existing) {
      if (finalRoleId === undefined) finalRoleId = existing.role_id ?? undefined
      if (resolvedMunicipalityId === undefined) {
        resolvedMunicipalityId = existing.municipality_id
      }
    }
  }

  const normalizedMunicipalityId =
    typeof resolvedMunicipalityId === "string" && resolvedMunicipalityId.trim() === ""
      ? null
      : (resolvedMunicipalityId ?? null)

  if (finalRoleId) {
    const { data: role } = await supabase
      .from("roles")
      .select("name")
      .eq("id", finalRoleId)
      .maybeSingle()

    if (role?.name === "MTO Staff" && !normalizedMunicipalityId) {
      return NextResponse.json(
        { error: "Municipality is required for MTO Staff accounts" },
        { status: 400 }
      )
    }
  }

  const allowedFields: Record<string, unknown> = {}
  if (first_name !== undefined) allowedFields.first_name = first_name
  if (last_name !== undefined) allowedFields.last_name = last_name
  if (username !== undefined) allowedFields.username = username
  if (finalRoleId !== undefined) allowedFields.role_id = finalRoleId
  if (municipality_id !== undefined) allowedFields.municipality_id = normalizedMunicipalityId

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  allowedFields.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("staff_profiles")
    .update(allowedFields)
    .eq("id", id)
    .select(STAFF_RELATIONS_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    await logAuditEvent({
      category: "user_management",
      action: "staff_updated",
      targetType: "staff_profile",
      targetId: id,
      detail: allowedFields,
    })
  } catch {}

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("users", "delete")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (currentUser.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    )
  }

  const { data: existing } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from("staff_profiles")
    .delete()
    .eq("id", id)

  if (deleteError) {
    return NextResponse.json(
      { error: `Failed to delete staff account: ${deleteError.message}` },
      { status: 500 }
    )
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminClient = createAdminClient()
      await adminClient.auth.admin.deleteUser(id)
    } catch (err) {
      console.error("Failed to delete auth user after profile deletion:", err)
    }
  }

  try {
    await logAuditEvent({
      category: "user_management",
      action: "staff_deleted",
      targetType: "staff_profile",
      targetId: id,
    })
  } catch {}

  return NextResponse.json({ success: true })
}

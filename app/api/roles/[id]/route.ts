import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { requirePermission } from "@/lib/permissions"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("roles", "edit")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const body = await request.json()

  const allowedFields: Record<string, unknown> = {}
  if (body.name !== undefined) allowedFields.name = body.name
  if (body.description !== undefined) allowedFields.description = body.description
  if (body.status !== undefined) allowedFields.status = body.status

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("roles")
    .update(allowedFields)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("roles", "delete")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { count: staffCount, error: countError } = await supabase
    .from("staff_profiles")
    .select("*", { count: "exact", head: true })
    .eq("role_id", id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if (staffCount && staffCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete role with assigned staff accounts. Reassign or deactivate them first." },
      { status: 409 }
    )
  }

  const { error: delError } = await supabase
    .from("roles")
    .delete()
    .eq("id", id)

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

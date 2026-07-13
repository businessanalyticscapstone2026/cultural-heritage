import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { requirePermission } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    await requirePermission("roles", "view")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const roleId = searchParams.get("roleId")

  if (!roleId) {
    return NextResponse.json({ error: "roleId query parameter is required" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .eq("role_id", roleId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  try {
    await requirePermission("roles", "manage")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { roleId, permissions } = body as {
    roleId: string
    permissions: { permission_id: string; granted: boolean }[]
  }

  if (!roleId || !Array.isArray(permissions)) {
    return NextResponse.json({ error: "roleId and permissions array are required" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  const grantedPerms = permissions.filter((p) => p.granted)
  if (grantedPerms.length > 0) {
    const { error: insertError } = await supabase.from("role_permissions").insert(
      grantedPerms.map((p) => ({
        role_id: roleId,
        permission_id: p.permission_id,
        granted: true,
      }))
    )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

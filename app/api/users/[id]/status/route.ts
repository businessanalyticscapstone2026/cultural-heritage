import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { requirePermission } from "@/lib/permissions"
import { getActorScope, getTargetMunicipalityId } from "@/lib/mto-scope"
import { logAuditEvent } from "@/features/audit/services"

export async function PATCH(
  _request: Request,
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

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (currentUser.id === id) {
    return NextResponse.json(
      { error: "You cannot change the status of your own account." },
      { status: 400 }
    )
  }

  const actorScope = await getActorScope(supabase, currentUser.id)
  if (actorScope.isMto) {
    if (!actorScope.municipalityId) {
      return NextResponse.json(
        { error: "Your account is not linked to a municipality" },
        { status: 403 }
      )
    }
    const targetMunicipalityId = await getTargetMunicipalityId(supabase, id)
    if (targetMunicipalityId !== actorScope.municipalityId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  const { data: current, error: fetchError } = await supabase
    .from("staff_profiles")
    .select("account_status")
    .eq("id", id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const newStatus = current.account_status === "active" ? "inactive" : "active"

  const { data, error } = await supabase
    .from("staff_profiles")
    .update({ account_status: newStatus, updated_at: new Date().toISOString() })
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

  try {
    await logAuditEvent({
      category: "user_management",
      action: "staff_status_changed",
      targetType: "staff_profile",
      targetId: id,
      detail: { previousStatus: current.account_status, newStatus },
    })
  } catch {}

  return NextResponse.json(data)
}

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { mapRoleNameToUserRole } from "@/features/auth/services"
import type {
  Municipality,
  MunicipalityAuditLog,
  CreateMunicipalityInput,
  UpdateMunicipalityInput,
  MunicipalityStatus,
} from "../types"

async function resolvePtcaoAdmin(): Promise<string> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("role_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.role_id) throw new Error("Unauthorized")

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .maybeSingle()

  if (mapRoleNameToUserRole(role?.name) !== "ptcao_admin") throw new Error("Unauthorized - PTCAO admin required")

  return user.id
}

async function writeAuditLog(
  supabase: ReturnType<typeof createClient>,
  municipalityId: string,
  action: "created" | "status_changed" | "updated",
  performedBy: string,
  previousValue: Record<string, unknown> | null,
  newValue: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("municipality_audit_log").insert({
    municipality_id: municipalityId,
    action,
    performed_by: performedBy,
    previous_value: previousValue,
    new_value: newValue,
  })

  if (error) throw new Error(`Failed to write audit log: ${error.message}`)
}

export async function getMunicipalities(
  statusFilter?: MunicipalityStatus
): Promise<Municipality[]> {
  await resolvePtcaoAdmin()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from("municipalities")
    .select("*")
    .order("name", { ascending: true })

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch municipalities: ${error.message}`)

  return (data ?? []) as Municipality[]
}

export async function getMunicipalityById(id: string): Promise<Municipality> {
  await resolvePtcaoAdmin()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch municipality: ${error.message}`)
  if (!data) throw new Error("Municipality not found")

  return data as Municipality
}

export async function createMunicipality(
  input: CreateMunicipalityInput
): Promise<Municipality> {
  const userId = await resolvePtcaoAdmin()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .insert({
      name: input.name,
      status: "pending",
      default_map_center: input.default_map_center ?? null,
    })
    .select("*")
    .maybeSingle()

  if (error) {
    if (error.code === "23505") throw new Error("A municipality with this name already exists")
    throw new Error(`Failed to create municipality: ${error.message}`)
  }

  await writeAuditLog(supabase, data.id, "created", userId, null, {
    name: input.name,
    status: "pending",
    default_map_center: input.default_map_center ?? null,
  })

  return data as Municipality
}

export async function updateMunicipality(
  id: string,
  input: UpdateMunicipalityInput
): Promise<Municipality> {
  const userId = await resolvePtcaoAdmin()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: existing } = await supabase
    .from("municipalities")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!existing) throw new Error("Municipality not found")

  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) updates.name = input.name
  if (input.default_map_center !== undefined) updates.default_map_center = input.default_map_center

  if (Object.keys(updates).length === 0) return existing as Municipality

  const { data, error } = await supabase
    .from("municipalities")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error) {
    if (error.code === "23505") throw new Error("A municipality with this name already exists")
    throw new Error(`Failed to update municipality: ${error.message}`)
  }

  await writeAuditLog(supabase, id, "updated", userId, existing as Record<string, unknown>, updates)

  return data as Municipality
}

export async function updateMunicipalityStatus(
  id: string,
  status: MunicipalityStatus
): Promise<Municipality> {
  const userId = await resolvePtcaoAdmin()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: existing } = await supabase
    .from("municipalities")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!existing) throw new Error("Municipality not found")

  if (existing.status === status) throw new Error(`Municipality is already ${status}`)

  const { data, error } = await supabase
    .from("municipalities")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error) throw new Error(`Failed to update municipality status: ${error.message}`)

  await writeAuditLog(supabase, id, "status_changed", userId, { status: existing.status }, { status })

  return data as Municipality
}

export async function getMunicipalityAuditLog(
  municipalityId: string
): Promise<MunicipalityAuditLog[]> {
  await resolvePtcaoAdmin()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipality_audit_log")
    .select("*")
    .eq("municipality_id", municipalityId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch audit log: ${error.message}`)

  return (data ?? []) as MunicipalityAuditLog[]
}

export async function resolveAndValidateMunicipality(
  municipalityId: string
): Promise<Municipality> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .select("*")
    .eq("id", municipalityId)
    .maybeSingle()

  if (error) throw new Error(`Failed to resolve municipality: ${error.message}`)
  if (!data) throw new Error("Municipality not found")
  if (data.status !== "active") throw new Error("Municipality is not active")

  return data as Municipality
}

export async function getMunicipalityOptions(): Promise<{ id: string; name: string }[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch municipality options: ${error.message}`)

  return (data ?? []) as { id: string; name: string }[]
}

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { requirePermission } from "@/lib/permissions"

export async function GET() {
  try {
    await requirePermission("roles", "view")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requirePermission("roles", "add")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const body = await request.json()
  const { name, description, status } = body

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Role name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("roles")
    .insert({
      name: name.trim(),
      description: description?.trim() ?? null,
      status: status ?? "active",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

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
    .from("permissions")
    .select("*")
    .order("module", { ascending: true })
    .order("action", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

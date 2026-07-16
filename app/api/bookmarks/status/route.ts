import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { siteIds } = await request.json()

    if (!Array.isArray(siteIds) || siteIds.length === 0) {
      return NextResponse.json({ bookmarked: [] })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ bookmarked: [] })
    }

    const { data } = await supabase
      .from("bookmarks")
      .select("site_id")
      .eq("tourist_id", user.id)
      .in("site_id", siteIds)

    const bookmarked = (data ?? []).map((row) => row.site_id as string)

    return NextResponse.json({ bookmarked })
  } catch {
    return NextResponse.json({ bookmarked: [] })
  }
}

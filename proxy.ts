import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const publicRoutes = ["/", "/login", "/register", "/signup", "/explore", "/map", "/recommendations", "/routes", "/heritage", "/tourist/scan", "/mto/login", "/ptcao/login"]
const adminRoutes = ["/admin", "/ptcao"]
const maintenanceExemptRoutes = ["/maintenance", "/api"]

async function getGlobalSetting(supabase: ReturnType<typeof createServerClient>, key: string): Promise<Record<string, unknown> | null> {
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()
  return (data?.value as Record<string, unknown>) ?? null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (maintenanceExemptRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Check maintenance mode
  const globalSettings = await getGlobalSetting(supabase, "global_settings")
  const maintenanceMode = globalSettings?.maintenanceMode === true

  if (maintenanceMode && pathname !== "/maintenance") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/maintenance", request.url))
    }
    if (!isAdminRoute) {
      return NextResponse.redirect(new URL("/maintenance", request.url))
    }
  }

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/tourist/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|api/).*)"],
}

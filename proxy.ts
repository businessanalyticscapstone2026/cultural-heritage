import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/signup",
  "/explore",
  "/map",
  "/recommendations",
  "/routes",
  "/heritage",
  "/reviews",
  "/feedback",
  "/profile",
  "/nearby",
  "/saved",
  "/scan",
  "/about",
  "/maintenance",
]
const adminRoutes = ["/admin", "/ptcao"]
const maintenanceExemptRoutes = ["/maintenance", "/api"]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

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
    error,
  } = await supabase.auth.getUser()

  if (error) {
    request.cookies.getAll().forEach(({ name }) => {
      const isSupabaseAuthCookie =
        name.startsWith("sb-") && (name.includes("-auth-token") || name.endsWith("-code-verifier"))
      if (isSupabaseAuthCookie) {
        supabaseResponse.cookies.set(name, "", { path: "/", maxAge: 0 })
      }
    })
  }

  const isAuthenticated = !!user
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

  // Unauthenticated users
  if (!isAuthenticated) {
    if (isPublicRoute(pathname)) {
      return supabaseResponse
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user — resolve role
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("id, account_status, roles(name)")
    .eq("id", user!.id)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleName: string | undefined = (staffProfile as any)?.roles?.name
  const isStaff = !!staffProfile
  const isMTO = roleName === "MTO Staff"
  const isPTCAO = roleName !== "MTO Staff" && isStaff

  // MTO routes guard
  if (pathname.startsWith("/mto")) {
    if (!isStaff || !isMTO) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (staffProfile?.account_status !== "active") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return supabaseResponse
  }

  // Admin routes guard
  if (isAdminRoute) {
    if (!isStaff || !isPTCAO) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (staffProfile?.account_status !== "active") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return supabaseResponse
  }

  // Staff trying to access tourist-specific routes or onboarding
  if (isStaff) {
    if (pathname === "/onboarding") {
      const dest = isMTO ? "/mto/dashboard" : "/admin/dashboard"
      return NextResponse.redirect(new URL(dest, request.url))
    }

    // Allow staff on public pages or login/register redirect
    if (pathname === "/login" || pathname === "/signup" || pathname === "/register") {
      const dest = isMTO ? "/mto/dashboard" : "/admin/dashboard"
      return NextResponse.redirect(new URL(dest, request.url))
    }

    return supabaseResponse
  }

  // From here on, user is a tourist
  let onboardingCompleted = false
  const { data: touristProfile } = await supabase
    .from("tourist_profiles")
    .select("onboarding_completed_at")
    .eq("id", user!.id)
    .maybeSingle()

  onboardingCompleted = touristProfile?.onboarding_completed_at != null

  // Onboarding check for home
  if (pathname.startsWith("/home")) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
    return supabaseResponse
  }

  // Logged-in tourist on / → redirect to /home
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Already-onboarded tourist visiting /onboarding
  if (pathname === "/onboarding" && onboardingCompleted) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Authenticated tourist on login/register/signup → redirect
  if (pathname === "/login" || pathname === "/signup" || pathname === "/register") {
    if (onboardingCompleted) {
      return NextResponse.redirect(new URL("/home", request.url))
    }
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|api/).*)"],
}

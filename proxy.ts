import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

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
  "/qr",
  "/about",
  "/maintenance",
  // Supabase OAuth callback (/auth/callback): no session exists yet when it is hit.
  "/auth",
];
const adminRoutes = ["/admin", "/ptcao"];
const maintenanceExemptRoutes = ["/maintenance", "/api"];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

let cachedGlobalSettings: {
  value: Record<string, unknown> | null;
  timestamp: number;
} | null = null;
const SETTINGS_CACHE_TTL_MS = 60_000;

const staffProfileCache = new Map<
  string,
  {
    profile: {
      id: string;
      account_status: string;
      roles?: { name: string } | null;
    } | null;
    timestamp: number;
  }
>();
const STAFF_CACHE_TTL_MS = 30_000;

async function getCachedStaffProfile(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
) {
  const now = Date.now();
  const cached = staffProfileCache.get(userId);
  if (cached && now - cached.timestamp < STAFF_CACHE_TTL_MS) {
    return cached.profile;
  }

  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("id, account_status, roles(name)")
    .eq("id", userId)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staffProfileCache.set(userId, {
    profile: staffProfile as any,
    timestamp: now,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return staffProfile as any;
}

async function getGlobalSetting(
  supabase: ReturnType<typeof createServerClient>,
  key: string,
): Promise<Record<string, unknown> | null> {
  const now = Date.now();
  if (
    key === "global_settings" &&
    cachedGlobalSettings &&
    now - cachedGlobalSettings.timestamp < SETTINGS_CACHE_TTL_MS
  ) {
    return cachedGlobalSettings.value;
  }

  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  const result = (data?.value as Record<string, unknown>) ?? null;
  if (key === "global_settings") {
    cachedGlobalSettings = { value: result, timestamp: now };
  }
  return result;
}

async function proxyHandler(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (maintenanceExemptRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith("sb-"));

  let user = null;
  if (hasAuthCookie) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const isAuthenticated = !!user;
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check maintenance mode
  const globalSettings = await getGlobalSetting(supabase, "global_settings");
  const maintenanceMode = globalSettings?.maintenanceMode === true;

  if (maintenanceMode && pathname !== "/maintenance") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    if (!isAdminRoute) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  // Unauthenticated users
  if (!isAuthenticated) {
    if (isPublicRoute(pathname)) {
      if (!request.cookies.get("session_id")) {
        supabaseResponse.cookies.set("session_id", crypto.randomUUID(), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      return supabaseResponse;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "expired");
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user — resolve role (cached for 30s to prevent roundtrip storm)
  const staffProfile = await getCachedStaffProfile(supabase, user!.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleName: string | undefined = (staffProfile as any)?.roles?.name;
  const isStaff = !!staffProfile;
  const isMTO = roleName === "MTO Staff";
  const isPTCAO = roleName !== "MTO Staff" && isStaff;

  // MTO routes guard
  if (pathname.startsWith("/mto")) {
    if (isPTCAO) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (!isStaff || !isMTO) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (staffProfile?.account_status !== "active") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // Admin routes guard
  if (isAdminRoute) {
    if (isMTO) {
      return NextResponse.redirect(new URL("/mto/dashboard", request.url));
    }
    if (!isStaff || !isPTCAO) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (staffProfile?.account_status !== "active") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // Staff trying to access tourist-specific routes or onboarding
  if (isStaff) {
    const dest = isMTO ? "/mto/dashboard" : "/admin/dashboard";

    if (pathname === "/onboarding") {
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/register"
    ) {
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Staff aren't tourists: the tourist home/landing pages generate
    // recommendations keyed to tourist_profiles, which staff accounts
    // don't have (violates recommendations_tourist_id_fkey). Send them
    // straight to their own dashboard instead.
    if (pathname === "/" || pathname === "/home") {
      return NextResponse.redirect(new URL(dest, request.url));
    }

    return supabaseResponse;
  }

  // From here on, user is a tourist
  let onboardingCompleted = false;
  const { data: touristProfile } = await supabase
    .from("tourist_profiles")
    .select("onboarding_completed_at")
    .eq("id", user!.id)
    .maybeSingle();

  onboardingCompleted = touristProfile?.onboarding_completed_at != null;

  // Onboarding check for home
  if (pathname.startsWith("/home")) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return supabaseResponse;
  }

  // Logged-in tourist on / → redirect to /home
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Already-onboarded tourist visiting /onboarding
  if (pathname === "/onboarding" && onboardingCompleted) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Authenticated tourist on login/register/signup → redirect
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register"
  ) {
    if (onboardingCompleted) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return supabaseResponse;
}

export const proxy = proxyHandler;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|api/).*)"],
};

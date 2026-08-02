import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { listRoutes } from "@/features/route-optimization/services"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"
import RoutesClient from "./routes-client"

export const dynamic = "force-dynamic"

export default async function RoutesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <RestrictedGuestPrompt
        title="Sign in to view routes"
        description="Plan and view your heritage tour routes across the First District of Batangas."
      />
    )
  }

  const routes = await listRoutes(supabase, user.id)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-10">
      <div className="mb-8">
        <h1 className="text-display text-2xl text-ink">Routes</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Plan and view your heritage tour routes.
        </p>
      </div>

      <RoutesClient initialRoutes={routes} />
    </div>
  )
}

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { listRoutes } from "@/features/route-optimization/services"
import RoutesClient from "./routes-client"

export const dynamic = "force-dynamic"

export default async function RoutesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const routes = user ? await listRoutes(supabase, user.id) : []

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 md:px-6 lg:px-10">
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

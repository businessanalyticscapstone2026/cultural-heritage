import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { listRoutes } from "@/features/route-optimization/services"
import RoutesClient from "./routes-client"

export const dynamic = "force-dynamic"

export default async function TouristRoutesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const routes = user ? await listRoutes(supabase, user.id) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Routes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plan and view your heritage tour routes.
        </p>
      </div>

      <RoutesClient initialRoutes={routes} />
    </div>
  )
}

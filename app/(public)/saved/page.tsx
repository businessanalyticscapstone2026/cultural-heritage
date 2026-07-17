import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SavedSitesPageContent from "./saved-content"

export default async function SavedSitesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  return <SavedSitesPageContent />
}

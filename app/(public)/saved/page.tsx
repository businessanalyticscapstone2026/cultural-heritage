import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"
import SavedSitesPageContent from "./saved-content"

export default async function SavedSitesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <RestrictedGuestPrompt
        title="Sign in to view your saved sites"
        description="Create a free account to bookmark heritage destinations and come back to them later."
      />
    )
  }

  return <SavedSitesPageContent />
}

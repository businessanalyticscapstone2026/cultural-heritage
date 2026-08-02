import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"

export default async function FeedbackPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <RestrictedGuestPrompt
        title="Sign in to submit feedback"
        description="Create a free account to share your thoughts and help improve heritage tourism."
      />
    )
  }

  return <div>Submit Feedback</div>
}

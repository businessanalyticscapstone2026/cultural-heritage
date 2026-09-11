import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"
import { FeedbackForm } from "@/features/feedback/components/feedback-form"

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

  const { data: sites } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("site_name", { ascending: true })

  const siteOptions = (sites ?? []).map((s) => ({
    id: s.id as string,
    name: s.site_name as string,
  }))

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-heading">Submit Feedback</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us about your experience, report an issue, or suggest an improvement —
          we read every submission.
        </p>
      </div>

      <FeedbackForm sites={siteOptions} />
    </div>
  )
}

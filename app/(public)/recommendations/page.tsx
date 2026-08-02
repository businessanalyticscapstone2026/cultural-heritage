import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"

export default function RecommendationsPage() {
  return (
    <RestrictedGuestPrompt
      title="Sign in for personalized picks"
      description="Create a free account to get heritage recommendations tailored to your interests, travel style, and accessibility needs."
    />
  )
}

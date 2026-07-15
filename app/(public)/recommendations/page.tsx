import { getRecommendationsAction } from "@/features/recommendation/actions"
import RecommendationsClient from "./recommendations-client"

export default async function RecommendationsPage() {
  const results = await getRecommendationsAction({
    interests: [],
    preferredCategoryIds: [],
    limit: 20,
  })

  return <RecommendationsClient initialResults={results} />
}

import { getTouristHomePageData } from "@/features/home/services/home-page"
import { TouristHomePage } from "@/features/home/components"

export default async function PublicHomePage() {
  const data = await getTouristHomePageData()
  return (
    <div className="md:-mt-16">
      <TouristHomePage data={data} />
    </div>
  )
}

import { getTouristHomePageData } from "@/features/home/services/home-page"
import { TouristHomePage } from "@/features/home/components"

export default async function HomePage() {
  const data = await getTouristHomePageData()
  return <TouristHomePage data={data} />
}

import { getRepositoryData } from "@/features/heritage/services/heritage-repository"
import { AdminHeritageClient } from "@/features/heritage/components"

export default async function HeritageRepositoryPage() {
  const { sites, categories, municipalities } = await getRepositoryData()

  return (
    <AdminHeritageClient
      initialSites={sites}
      categories={categories}
      municipalities={municipalities}
    />
  )
}

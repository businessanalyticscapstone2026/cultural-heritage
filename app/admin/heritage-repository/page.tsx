import { getAllHeritageSites, getAllCategories } from "@/features/heritage/services"
import { getMunicipalities } from "@/features/users/services"
import { AdminHeritageClient } from "@/features/heritage/components"

export default async function HeritageRepositoryPage() {
  const [sites, categories, municipalities] = await Promise.all([
    getAllHeritageSites(),
    getAllCategories(),
    getMunicipalities(),
  ])

  return (
    <AdminHeritageClient
      initialSites={sites}
      categories={categories}
      municipalities={municipalities}
    />
  )
}

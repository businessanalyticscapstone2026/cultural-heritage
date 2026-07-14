import { getCategoriesWithSiteCount } from "@/features/heritage/services"
import MtoCategoriesListClient from "@/features/heritage/components/mto-categories-list-client"

export default async function CategoriesPage() {
  const categories = await getCategoriesWithSiteCount()

  return (
    <div className="space-y-6">
      <MtoCategoriesListClient initialCategories={categories} />
    </div>
  )
}

import { getCategoriesWithSiteCount } from "@/features/heritage/services"
import { MtoCategoriesClient } from "@/features/heritage/components"

export default async function CategoriesPage() {
  const categories = await getCategoriesWithSiteCount()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Heritage Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize and manage heritage site categories
        </p>
      </div>

      <MtoCategoriesClient initialCategories={categories} />
    </div>
  )
}

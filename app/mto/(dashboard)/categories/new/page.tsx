import MtoCategoryFormClient from "@/features/heritage/components/mto-category-form-client"
import { createCategoryAction } from "@/features/heritage/actions/category"

export default function NewCategoryPage() {
  async function handleSubmit(data: { name: string; description?: string | null; icon?: string | null; color?: string | null; displayOrder?: number | null; status?: string }) {
    "use server"
    await createCategoryAction({
      name: data.name,
      description: data.description ?? undefined,
      icon: data.icon ?? undefined,
      color: data.color ?? undefined,
      displayOrder: data.displayOrder ?? undefined,
    })
  }

  return <MtoCategoryFormClient onSubmit={handleSubmit} />
}

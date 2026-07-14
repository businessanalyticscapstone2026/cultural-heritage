import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { updateCategoryAction } from "@/features/heritage/actions/category"
import MtoCategoryFormClient from "@/features/heritage/components/mto-category-form-client"
import type { HeritageCategory } from "@/types/heritage"

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: category } = await supabase
    .from("heritage_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!category) notFound()

  const mapped: HeritageCategory = {
    id: category.id as string,
    name: category.name as string,
    description: (category.description ?? null) as string | null,
    icon: (category.icon ?? null) as string | null,
    color: (category.color ?? null) as string | null,
    displayOrder: (category.display_order ?? null) as number | null,
    status: (category.status ?? "active") as HeritageCategory["status"],
  }

  async function handleSubmit(data: { name: string; description?: string | null; icon?: string | null; color?: string | null; displayOrder?: number | null; status?: string }) {
    "use server"
    const updates: Partial<HeritageCategory> = {
      name: data.name,
      description: data.description ?? undefined,
      icon: data.icon ?? undefined,
      color: data.color ?? undefined,
      displayOrder: data.displayOrder ?? undefined,
      status: data.status as HeritageCategory["status"],
    }
    await updateCategoryAction(id, updates)
  }

  return <MtoCategoryFormClient category={mapped} onSubmit={handleSubmit} />
}

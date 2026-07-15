import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { HeritageCategory } from "../types"

export async function getCategories(): Promise<HeritageCategory[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description ?? null) as string | null,
    icon: (row.icon ?? null) as string | null,
    color: (row.color ?? null) as string | null,
    displayOrder: (row.display_order ?? null) as number | null,
    status: (row.status ?? "active") as HeritageCategory["status"],
  }))
}

export async function getAllCategories(): Promise<HeritageCategory[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description ?? null) as string | null,
    icon: (row.icon ?? null) as string | null,
    color: (row.color ?? null) as string | null,
    displayOrder: (row.display_order ?? null) as number | null,
    status: (row.status ?? "active") as HeritageCategory["status"],
  }))
}

export async function createCategory(data: { name: string; description?: string; icon?: string; color?: string; displayOrder?: number }): Promise<HeritageCategory> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: category, error } = await supabase
    .from("heritage_categories")
    .insert({
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      display_order: data.displayOrder ?? null,
      status: "active",
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create category: ${error.message}`)

  return {
    id: category.id as string,
    name: category.name as string,
    description: (category.description ?? null) as string | null,
    icon: (category.icon ?? null) as string | null,
    color: (category.color ?? null) as string | null,
    displayOrder: (category.display_order ?? null) as number | null,
    status: (category.status ?? "active") as HeritageCategory["status"],
  }
}

export async function updateCategory(id: string, updates: Partial<HeritageCategory>): Promise<HeritageCategory> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
  if (updates.status !== undefined) updateData.status = updates.status

  const { error } = await supabase
    .from("heritage_categories")
    .update(updateData)
    .eq("id", id)

  if (error) throw new Error(`Failed to update category: ${error.message}`)

  const { data: updated, error: fetchError } = await supabase
    .from("heritage_categories")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) throw new Error("Failed to fetch updated category")

  return {
    id: updated.id as string,
    name: updated.name as string,
    description: (updated.description ?? null) as string | null,
    icon: (updated.icon ?? null) as string | null,
    color: (updated.color ?? null) as string | null,
    displayOrder: (updated.display_order ?? null) as number | null,
    status: (updated.status ?? "active") as HeritageCategory["status"],
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { count } = await supabase
    .from("heritage_sites")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)

  if (count && count > 0) {
    throw new Error(`Cannot delete category: ${count} heritage site(s) still use it`)
  }

  const { error } = await supabase
    .from("heritage_categories")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete category: ${error.message}`)
}

export async function getCategoriesWithSiteCount(): Promise<(HeritageCategory & { siteCount: number })[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: categories, error: catError } = await supabase
    .from("heritage_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (catError) throw catError

  const results: (HeritageCategory & { siteCount: number })[] = []

  for (const cat of categories ?? []) {
    const { count } = await supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("category_id", cat.id)

    results.push({
      id: cat.id as string,
      name: cat.name as string,
      description: (cat.description ?? null) as string | null,
      icon: (cat.icon ?? null) as string | null,
      color: (cat.color ?? null) as string | null,
      displayOrder: (cat.display_order ?? null) as number | null,
      status: (cat.status ?? "active") as HeritageCategory["status"],
      siteCount: count ?? 0,
    })
  }

  return results
}

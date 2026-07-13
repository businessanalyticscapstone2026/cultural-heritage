"use server"

import { revalidatePath } from "next/cache"
import {
  getAllCategories,
  getCategoriesWithSiteCount,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services"
import type { HeritageCategory } from "../types"

export async function getAllCategoriesAction() {
  return getAllCategories()
}

export async function getCategoriesWithSiteCountAction() {
  return getCategoriesWithSiteCount()
}

export async function createCategoryAction(data: { name: string; description?: string; icon?: string; color?: string; displayOrder?: number }) {
  const category = await createCategory(data)
  revalidatePath("/mto/categories")
  revalidatePath("/admin/heritage-repository")
  return category
}

export async function updateCategoryAction(id: string, updates: Partial<HeritageCategory>) {
  const category = await updateCategory(id, updates)
  revalidatePath("/mto/categories")
  revalidatePath("/admin/heritage-repository")
  return category
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id)
  revalidatePath("/mto/categories")
  revalidatePath("/admin/heritage-repository")
}

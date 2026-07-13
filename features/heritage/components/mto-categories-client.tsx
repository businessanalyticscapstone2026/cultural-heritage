"use client"

import { useCallback } from "react"
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../actions/category"
import { useCategoriesWithSiteCount } from "../hooks"
import CategoryTable from "./category-table"
import type { HeritageCategory } from "../types"

interface MtoCategoriesClientProps {
  initialCategories: (HeritageCategory & { siteCount: number })[]
}

export default function MtoCategoriesClient({
  initialCategories,
}: MtoCategoriesClientProps) {
  const fetchCategories = useCallback(async () => {
    const { getCategoriesWithSiteCountAction } = await import("../actions/category")
    return getCategoriesWithSiteCountAction()
  }, [])

  const { categories, refetch } = useCategoriesWithSiteCount(fetchCategories)
  const displayCategories = categories.length > 0 ? categories : initialCategories

  const handleCreate = useCallback(async (data: { name: string; description?: string; icon?: string; color?: string; displayOrder?: number }) => {
    await createCategoryAction(data)
    refetch()
  }, [refetch])

  const handleUpdate = useCallback(async (id: string, updates: Partial<HeritageCategory>) => {
    await updateCategoryAction(id, updates)
    refetch()
  }, [refetch])

  const handleDelete = useCallback(async (id: string) => {
    await deleteCategoryAction(id)
    refetch()
  }, [refetch])

  return (
    <CategoryTable
      categories={displayCategories}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}

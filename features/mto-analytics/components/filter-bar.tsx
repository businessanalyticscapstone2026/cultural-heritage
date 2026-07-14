"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface FilterBarProps {
  categories: { id: string; name: string }[]
}

export default function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">From</label>
        <input
          id="dateFrom"
          type="date"
          value={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">To</label>
        <input
          id="dateTo"
          type="date"
          value={searchParams.get("dateTo") ?? ""}
          onChange={(e) => update("dateTo", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</label>
        <select
          id="category"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

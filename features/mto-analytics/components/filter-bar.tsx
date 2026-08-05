"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RotateCcw } from "lucide-react"

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

  const reset = useCallback(() => {
    router.push("?")
  }, [router])

  const hasFilters = [
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
    searchParams.get("category"),
    searchParams.get("granularity"),
  ].some(Boolean)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">
          From
        </Label>
        <Input
          id="dateFrom"
          type="date"
          value={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="w-40"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">
          To
        </Label>
        <Input
          id="dateTo"
          type="date"
          value={searchParams.get("dateTo") ?? ""}
          onChange={(e) => update("dateTo", e.target.value)}
          className="w-40"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
          Category
        </Label>
        <Select
          value={searchParams.get("category") ?? ""}
          onValueChange={(v) => update("category", v ?? "")}
        >
          <SelectTrigger id="category" className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-xs">
          <RotateCcw className="mr-1.5 size-3.5" />
          Reset
        </Button>
      )}
    </div>
  )
}

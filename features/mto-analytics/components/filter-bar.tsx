"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
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
import { RotateCcw, Loader2 } from "lucide-react"
import { getLocalTodayDate } from "@/lib/date-utils"

interface FilterBarProps {
  categories: { id: string; name: string }[]
}

export default function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const today = getLocalTodayDate()

  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        let safeValue = value
        if (key === "dateFrom" || key === "dateTo") {
          if (safeValue > today) safeValue = today
          if (key === "dateFrom" && dateTo && safeValue > dateTo) {
            safeValue = dateTo
          }
          if (key === "dateTo" && dateFrom && safeValue < dateFrom) {
            safeValue = dateFrom
          }
        }
        params.set(key, safeValue)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams, today, dateFrom, dateTo]
  )

  const reset = useCallback(() => {
    startTransition(() => {
      router.push("?", { scroll: false })
    })
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
          value={dateFrom}
          max={dateTo && dateTo < today ? dateTo : today}
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
          value={dateTo}
          min={dateFrom || undefined}
          max={today}
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
        <Button variant="ghost" size="sm" onClick={reset} disabled={isPending} className="h-8 text-xs">
          <RotateCcw className="mr-1.5 size-3.5" />
          Reset
        </Button>
      )}
      {isPending && (
        <div className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Updating...</span>
        </div>
      )}
    </div>
  )
}

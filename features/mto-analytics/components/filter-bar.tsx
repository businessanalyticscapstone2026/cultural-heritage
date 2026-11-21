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
import { RotateCcw, Calendar, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  categories: { id: string; name: string }[]
  className?: string
}

export default function FilterBar({ categories, className }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""
  const category = searchParams.get("category") ?? ""

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

  const applyPreset = useCallback(
    (preset: "7d" | "30d" | "month" | "ytd") => {
      const now = new Date()
      const toStr = now.toISOString().slice(0, 10)
      let fromStr = toStr

      if (preset === "7d") {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        fromStr = d.toISOString().slice(0, 10)
      } else if (preset === "30d") {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        fromStr = d.toISOString().slice(0, 10)
      } else if (preset === "month") {
        fromStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      } else if (preset === "ytd") {
        fromStr = `${now.getFullYear()}-01-01`
      }

      const params = new URLSearchParams(searchParams.toString())
      params.set("dateFrom", fromStr)
      params.set("dateTo", toStr)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const reset = useCallback(() => {
    router.push("?")
  }, [router])

  const hasFilters = [
    dateFrom,
    dateTo,
    category,
    searchParams.get("granularity"),
  ].some(Boolean)

  return (
    <div className={cn("rounded-xl border bg-card/60 p-4 shadow-2xs backdrop-blur-xs space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Calendar className="size-3.5 text-primary" />
          <span>Quick Ranges</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset("7d")}
            className="h-7 px-2.5 text-xs"
          >
            Last 7 Days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset("30d")}
            className="h-7 px-2.5 text-xs"
          >
            Last 30 Days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset("month")}
            className="h-7 px-2.5 text-xs"
          >
            This Month
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset("ytd")}
            className="h-7 px-2.5 text-xs"
          >
            Year to Date
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">
            From
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="w-38 text-xs sm:w-40"
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
            onChange={(e) => update("dateTo", e.target.value)}
            className="w-38 text-xs sm:w-40"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
            Heritage Category
          </Label>
          <Select
            value={category}
            onValueChange={(v) => update("category", v ?? "")}
          >
            <SelectTrigger id="category" className="w-48 text-xs">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}

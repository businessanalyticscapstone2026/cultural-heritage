"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

const SECTIONS = [
  { id: "summary-metrics", label: "Summary Metrics" },
  { id: "visitor-trend", label: "Visitor Trend" },
  { id: "visits-by-attraction", label: "Visitors by Attraction" },
  { id: "demographics", label: "Demographics" },
  { id: "top-sites", label: "Top Sites" },
  { id: "recommendation-funnel", label: "Recommendation Funnel" },
  { id: "filter-settings", label: "Filter Settings" },
] as const

export default function ExportPanel() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(SECTIONS.map((s) => s.id))
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => setSelected(new Set(SECTIONS.map((s) => s.id)))
  const selectNone = () => setSelected(new Set())

  const handlePrint = () => {
    document.documentElement.setAttribute("data-exporting", "true")
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) {
        el.setAttribute("data-export-visible", selected.has(section.id) ? "true" : "false")
      }
    }

    window.print()

    document.documentElement.removeAttribute("data-exporting")
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) {
        el.removeAttribute("data-export-visible")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Select sections to include in the exported report.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={selectNone} className="h-7 text-xs">
            None
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          {SECTIONS.map((section) => (
            <label
              key={section.id}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.has(section.id)}
                onChange={() => toggle(section.id)}
                className="size-4 rounded border-muted-foreground/40 accent-primary"
              />
              <span className="text-foreground">{section.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            disabled={selected.size === 0}
            className="flex-1"
            size="sm"
          >
            <Printer className="mr-2 size-4" />
            Print / Save PDF
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Tip: Use your browser&apos;s &quot;Save as PDF&quot; option in the print dialog to export as PDF.
        </p>
      </CardContent>
    </Card>
  )
}

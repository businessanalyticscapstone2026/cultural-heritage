"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Printer, CheckSquare, Square, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "summary-metrics", label: "Summary Metrics" },
  { id: "visitor-trend", label: "Visitor Trend" },
  { id: "visitor-trend-comparison", label: "Current vs Prior Period" },
  { id: "weekday", label: "Visits by Day of Week" },
  { id: "visits-by-attraction", label: "Visitors by Attraction" },
  { id: "scan-device", label: "Scans by Device" },
  { id: "demographics", label: "Demographics" },
  { id: "top-sites", label: "Top Sites" },
  { id: "recommendation-funnel", label: "Recommendation Funnel" },
  { id: "filter-settings", label: "Filter Settings" },
] as const

interface ExportPanelProps {
  buttonVariant?: "default" | "outline" | "secondary" | "ghost"
  buttonSize?: "default" | "sm" | "lg"
  className?: string
}

export default function ExportPanel({
  buttonVariant = "outline",
  buttonSize = "sm",
  className,
}: ExportPanelProps) {
  const [open, setOpen] = useState(false)
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
    setOpen(false)
    setTimeout(() => {
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
    }, 150)
  }

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setOpen(true)}
        className={cn("gap-1.5 shadow-xs", className)}
      >
        <Printer className="size-4" />
        <span>Export Report</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-primary" />
              Export Analytics Report
            </DialogTitle>
            <DialogDescription>
              Choose which sections to include in your printed report or PDF document.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between border-b pb-2 text-xs text-muted-foreground">
            <span>{selected.size} of {SECTIONS.length} sections selected</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 px-2 text-xs">
                <CheckSquare className="mr-1 size-3.5" /> Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={selectNone} className="h-7 px-2 text-xs">
                <Square className="mr-1 size-3.5" /> None
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-[320px] overflow-y-auto py-2 pr-1">
            {SECTIONS.map((section) => {
              const isChecked = selected.has(section.id)
              return (
                <label
                  key={section.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-colors cursor-pointer select-none",
                    isChecked
                      ? "border-primary/40 bg-primary/5 text-foreground font-medium"
                      : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(section.id)}
                    className="size-4 rounded border-muted-foreground/40 accent-primary"
                  />
                  <span>{section.label}</span>
                </label>
              )
            })}
          </div>

          <div className="rounded-md bg-muted/60 p-2.5 text-xs text-muted-foreground">
            💡 <span className="font-medium text-foreground">Tip:</span> Set destination to &quot;Save as PDF&quot; in the print window to download.
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePrint}
              disabled={selected.size === 0}
              size="sm"
              className="gap-1.5"
            >
              <Printer className="size-3.5" />
              Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

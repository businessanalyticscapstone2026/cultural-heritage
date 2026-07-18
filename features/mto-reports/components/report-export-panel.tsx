"use client"

import { useState } from "react"
import { Printer, ChevronDown, ChevronUp } from "lucide-react"
import type { ExportSection } from "../types"

interface ReportExportPanelProps {
  sections: ExportSection[]
}

export default function ReportExportPanel({ sections }: ReportExportPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  )
  const [expanded, setExpanded] = useState(true)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(sections.map((s) => s.id)))
  const selectNone = () => setSelected(new Set())

  const handlePrint = () => {
    document.documentElement.setAttribute("data-exporting", "true")
    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) {
        el.setAttribute(
          "data-export-visible",
          selected.has(section.id) ? "true" : "false",
        )
      }
    }

    window.print()

    document.documentElement.removeAttribute("data-exporting")
    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) el.removeAttribute("data-export-visible")
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-sm font-medium"
      >
        <span>Export Report</span>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <>
          <p className="mt-2 text-xs text-muted-foreground">
            Select sections to include in the print/PDF output.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              All
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              None
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            {sections.map((section) => (
              <label
                key={section.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={selected.has(section.id)}
                  onChange={() => toggle(section.id)}
                  className="size-3.5 rounded border-muted-foreground/40 accent-primary"
                />
                <span>{section.label}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            disabled={selected.size === 0}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Printer className="size-4" />
            Print / Save PDF
          </button>

          <p className="mt-2 text-[10px] text-muted-foreground">
            Use your browser&apos;s &quot;Save as PDF&quot; option in the print dialog.
          </p>
        </>
      )}
    </div>
  )
}

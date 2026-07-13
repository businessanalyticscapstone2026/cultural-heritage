"use client"

import { Download } from "lucide-react"

interface ExportButtonProps {
  label: string
  onExport: () => void
}

export function ExportButton({ label, onExport }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      className="flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs transition-colors hover:bg-accent"
    >
      <Download className="size-3.5" />
      {label}
    </button>
  )
}

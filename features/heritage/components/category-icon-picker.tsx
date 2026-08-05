"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CATEGORY_ICON_OPTIONS } from "../constants/category-icons"

interface CategoryIconPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (value: string) => void
  current?: string | null
}

export default function CategoryIconPicker({
  open,
  onOpenChange,
  onSelect,
  current,
}: CategoryIconPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
          <DialogDescription>
            Pick an icon for this heritage category. The preview updates instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
          {CATEGORY_ICON_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = current === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  onOpenChange(false)
                }}
                aria-pressed={isSelected}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-muted"
                }`}
              >
                <Icon className="size-6" />
                <span className="text-xs leading-tight">{option.label}</span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

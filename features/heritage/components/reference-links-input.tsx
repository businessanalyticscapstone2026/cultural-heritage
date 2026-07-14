"use client"

import { useCallback } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ReferenceLink {
  id?: string
  url: string
  label?: string | null
}

interface ReferenceLinksInputProps {
  links: ReferenceLink[]
  onChange: (links: ReferenceLink[]) => void
  disabled?: boolean
}

export default function ReferenceLinksInput({ links, onChange, disabled }: ReferenceLinksInputProps) {
  const addLink = useCallback(() => {
    onChange([...links, { url: "", label: "" }])
  }, [links, onChange])

  const removeLink = useCallback(
    (index: number) => {
      onChange(links.filter((_, i) => i !== index))
    },
    [links, onChange],
  )

  const updateLink = useCallback(
    (index: number, field: "url" | "label", value: string) => {
      const updated = links.map((link, i) =>
        i === index ? { ...link, [field]: value || null } : link,
      )
      onChange(updated)
    },
    [links, onChange],
  )

  return (
    <div className="space-y-3">
      {links.map((link, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 space-y-1.5">
            <Input
              placeholder="https://example.com"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              disabled={disabled}
            />
            <Input
              placeholder="Label (optional)"
              value={link.label ?? ""}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              disabled={disabled}
              className="text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => removeLink(i)}
            disabled={disabled}
            className="mt-1 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addLink} disabled={disabled}>
        <PlusIcon className="size-4 mr-1" />
        Add Link
      </Button>
    </div>
  )
}

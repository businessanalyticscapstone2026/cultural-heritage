"use client"

import { useState, useCallback } from "react"
import { XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  tags: { tag: string }[]
  onChange: (tags: { tag: string }[]) => void
  placeholder?: string
  disabled?: boolean
}

export default function TagInput({ tags, onChange, placeholder = "Type a tag and press Enter", disabled }: TagInputProps) {
  const [input, setInput] = useState("")

  const addTag = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (tags.some((t) => t.tag.toLowerCase() === trimmed.toLowerCase())) return
    onChange([...tags, { tag: trimmed }])
    setInput("")
  }, [input, tags, onChange])

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index))
    },
    [tags, onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        addTag()
      }
      if (e.key === "Backspace" && !input && tags.length > 0) {
        removeTag(tags.length - 1)
      }
    },
    [addTag, removeTag, input, tags.length],
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span
            key={`${t.tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {t.tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              disabled={disabled}
              className="inline-flex items-center justify-center rounded-sm hover:bg-primary/20 transition-colors"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag() }}
        placeholder={tags.length > 0 ? undefined : placeholder}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">Press Enter to add a tag</p>
    </div>
  )
}

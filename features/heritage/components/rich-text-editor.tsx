"use client"

import { useCallback, useRef } from "react"
import { BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, LinkIcon } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export default function RichTextEditor({ value, onChange, placeholder, disabled, rows = 8 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }, [])

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-0.5 rounded-t-lg border border-b-0 bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => exec("bold")}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Bold"
        >
          <BoldIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Italic"
        >
          <ItalicIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Underline"
        >
          <UnderlineIcon className="size-3.5" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-border" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Bullet List"
        >
          <ListIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter link URL:")
            if (url) exec("createLink", url)
          }}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Insert Link"
        >
          <LinkIcon className="size-3.5" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[120px] w-full rounded-b-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] disabled:cursor-not-allowed disabled:opacity-50 [&_a]:text-primary [&_a]:underline"
        style={{ height: `${rows * 20}px`, overflowY: "auto" }}
      />
    </div>
  )
}

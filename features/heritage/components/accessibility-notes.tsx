import { Accessibility } from "lucide-react"

interface AccessibilityNotesProps {
  accessibilityInfo: string | null
}

export default function AccessibilityNotes({ accessibilityInfo }: AccessibilityNotesProps) {
  if (!accessibilityInfo) return null

  const lines = accessibilityInfo.split("\n").filter((line) => line.trim())

  return (
    <section
      aria-labelledby="accessibility-heading"
      className="rounded-xl border border-secondary/20 bg-secondary/5 p-5"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
          <Accessibility className="h-4 w-4 text-secondary" />
        </div>
        <h2
          id="accessibility-heading"
          className="font-heading text-lg font-semibold text-heading"
        >
          Accessibility Information
        </h2>
      </div>

      <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-body">
        {lines.length === 1 ? (
          <p>{lines[0]}</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

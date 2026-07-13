"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface AboutSectionProps {
  shortDescription: string | null
  detailedDescription: string | null
}

export default function AboutSection({
  shortDescription,
  detailedDescription,
}: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false)

  if (!shortDescription && !detailedDescription) return null

  return (
    <section aria-labelledby="about-heading">
      <h2
        id="about-heading"
        className="font-heading text-lg font-semibold text-heading"
      >
        About
      </h2>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-body">
        {shortDescription && <p>{shortDescription}</p>}

        {detailedDescription && (
          <>
            <div
              className={`relative overflow-hidden transition-all duration-300 ${
                expanded ? "max-h-none" : "max-h-24"
              }`}
            >
              <p className="whitespace-pre-line">{detailedDescription}</p>

              {!expanded && shortDescription && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-warm-white to-transparent" />
              )}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
              aria-expanded={expanded}
            >
              {expanded ? "Read less" : "Read more"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </>
        )}
      </div>
    </section>
  )
}

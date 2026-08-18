import type { ReactNode } from "react"
import Link from "next/link"

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  variant?: "primary" | "outline"
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actions?: EmptyStateAction[]
  className?: string
}

const actionBase =
  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"

function primaryClasses(): string {
  return `${actionBase} bg-ink text-cream hover:bg-ink/90`
}

function outlineClasses(): string {
  return `${actionBase} border border-ink/15 bg-transparent text-ink hover:bg-ink/5`
}

/**
 * Polished tourist-facing empty state: icon in a ringed circle, bold title,
 * soft description, and pill actions on a dashed parchment card.
 */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-parchment/30 px-8 py-16 text-center ${
        className ?? ""
      }`}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 ring-1 ring-ink/10">
          {icon}
        </div>
      )}
      <p className="mt-5 text-display text-xl text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {actions && actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => {
            const classes =
              action.variant === "outline" ? outlineClasses() : primaryClasses()
            const content = (
              <>
                {action.icon}
                {action.label}
              </>
            )
            if (action.href) {
              return (
                <Link key={action.label} href={action.href} className={classes}>
                  {content}
                </Link>
              )
            }
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={classes}
              >
                {content}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
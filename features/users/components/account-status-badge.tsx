import type { AccountStatus } from "../types"

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const isActive = status === "active"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-success/10 text-success"
          : "bg-muted/30 text-muted-foreground"
      }`}
    >
      <span
        className={`inline-block size-1.5 rounded-full ${
          isActive ? "bg-success" : "bg-muted"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  )
}

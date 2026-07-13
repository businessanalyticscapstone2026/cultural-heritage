import { Badge } from "@/components/ui/badge"
import type { MunicipalityStatus } from "../types"

const STATUS_CONFIG: Record<MunicipalityStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "destructive" },
}

export function MunicipalityStatusBadge({ status }: { status: MunicipalityStatus | undefined }) {
  const config = STATUS_CONFIG[status ?? "pending"] ?? { label: "Unknown", variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

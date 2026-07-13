"use client"

import { MapPin, Pencil, ToggleLeft, ToggleRight, History } from "lucide-react"
import { MunicipalityStatusBadge } from "./municipality-status-badge"
import type { Municipality } from "../types"

type MunicipalityTableProps = {
  municipalities: Municipality[]
  onEdit: (municipality: Municipality) => void
  onToggleStatus: (municipality: Municipality) => void
  onViewAuditLog: (municipality: Municipality) => void
  togglingId: string | null
}

export function MunicipalityTable({
  municipalities,
  onEdit,
  onToggleStatus,
  onViewAuditLog,
  togglingId,
}: MunicipalityTableProps) {
  if (municipalities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <MapPin className="mb-3 size-10" />
        <p className="text-sm">No municipalities registered yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Province</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Map Center</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registered</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {municipalities.map((m) => (
            <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-medium">{m.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.province}</td>
              <td className="px-4 py-3">
                <MunicipalityStatusBadge status={m.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {m.default_map_center
                  ? `${m.default_map_center.lat.toFixed(4)}, ${m.default_map_center.long.toFixed(4)}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(m)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewAuditLog(m)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Audit Log"
                  >
                    <History className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(m)}
                    disabled={togglingId === m.id}
                    className={`rounded-md p-1.5 transition-colors disabled:opacity-50 ${
                      m.status === "active"
                        ? "text-success hover:bg-success/10"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={m.status === "active" ? "Deactivate" : "Activate"}
                  >
                    {togglingId === m.id ? (
                      <span className="size-4 animate-pulse">...</span>
                    ) : m.status === "active" ? (
                      <ToggleRight className="size-4" />
                    ) : (
                      <ToggleLeft className="size-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

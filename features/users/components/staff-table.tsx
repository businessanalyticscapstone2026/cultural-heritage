"use client"

import { Users, Trash2 } from "lucide-react"
import { AccountStatusBadge } from "./account-status-badge"
import type { StaffProfileWithRelations } from "../types"

type StaffTableProps = {
  staff: StaffProfileWithRelations[]
  onEdit: (profile: StaffProfileWithRelations) => void
  onToggleStatus: (profile: StaffProfileWithRelations) => void
  onDelete: (profile: StaffProfileWithRelations) => void
  togglingId: string | null
}

export function StaffTable({ staff, onEdit, onToggleStatus, onDelete, togglingId }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="mb-3 size-10" />
        <p className="text-sm">No staff accounts yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Username</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Municipality</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((profile) => (
            <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-medium">
                {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {profile.username || "—"}
              </td>
              <td className="px-4 py-3">
                {profile.role ? (
                  <span className="inline-flex items-center rounded-md bg-secondary/30 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {profile.role.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {profile.municipality?.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                <AccountStatusBadge status={profile.account_status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(profile)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(profile)}
                    disabled={togglingId === profile.id}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      profile.account_status === "active"
                        ? "text-error hover:bg-error/10"
                        : "text-success hover:bg-success/10"
                    } disabled:opacity-50`}
                  >
                    {togglingId === profile.id
                      ? "..."
                      : profile.account_status === "active"
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(profile)}
                    className="rounded-md p-1 text-error transition-colors hover:bg-error/10"
                    aria-label={`Delete ${profile.username ?? "staff account"}`}
                  >
                    <Trash2 className="size-4" />
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

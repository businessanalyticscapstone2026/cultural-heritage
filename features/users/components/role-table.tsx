"use client"

import { Shield } from "lucide-react"
import { AccountStatusBadge } from "./account-status-badge"
import type { Role } from "../types"

type RoleTableProps = {
  roles: Role[]
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Shield className="mb-3 size-10" />
        <p className="text-sm">No roles yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-medium">{role.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{role.description ?? "—"}</td>
              <td className="px-4 py-3">
                <AccountStatusBadge status={role.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(role)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(role)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-error transition-colors hover:bg-error/10"
                  >
                    Delete
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

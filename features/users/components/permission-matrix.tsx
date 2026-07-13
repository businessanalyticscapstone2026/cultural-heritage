"use client"

import { useState, useRef } from "react"
import { Shield } from "lucide-react"
import type { Role, PermissionMatrixCell } from "../types"
import { apiClient } from "@/lib/api-client"

const KNOWN_ACTIONS = ["view", "add", "edit", "delete", "export", "approve", "manage"] as const

type PermissionMatrixProps = {
  roles: Role[]
  initialRoleId?: string
}

export function PermissionMatrix({ roles, initialRoleId }: PermissionMatrixProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId ?? "")
  const [cells, setCells] = useState<PermissionMatrixCell[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const lastRequestId = useRef(0)

  const loadMatrix = async (roleId: string) => {
    const requestId = ++lastRequestId.current
    setLoading(true)
    setError(null)

    try {
      const [perms, rolePerms] = await Promise.all([
        apiClient<{ id: string; module: string; action: string }[]>("/permissions"),
        apiClient<{ permission_id: string; granted: boolean }[]>(
          `/role-permissions?roleId=${encodeURIComponent(roleId)}`
        ),
      ])

      if (requestId !== lastRequestId.current) return

      const grantedMap = new Map(
        rolePerms.filter((rp) => rp.granted).map((rp) => [rp.permission_id, true])
      )
      setCells(
        perms.map((p) => ({
          module: p.module,
          action: p.action,
          permission_id: p.id,
          granted: grantedMap.has(p.id),
        }))
      )
    } catch (err) {
      if (requestId !== lastRequestId.current) return
      setError(err instanceof Error ? err.message : "Failed to load permissions")
    } finally {
      if (requestId === lastRequestId.current) {
        setLoading(false)
      }
    }
  }

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId)
    if (roleId) {
      loadMatrix(roleId)
    } else {
      setCells([])
      setError(null)
    }
  }

  const toggleCell = (permissionId: string) => {
    setCells((prev) =>
      prev.map((c) => (c.permission_id === permissionId ? { ...c, granted: !c.granted } : c))
    )
  }

  const handleSave = async () => {
    if (!selectedRoleId) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await apiClient("/role-permissions", {
        method: "PUT",
        body: {
          roleId: selectedRoleId,
          permissions: cells.map((c) => ({
            permission_id: c.permission_id,
            granted: c.granted,
          })),
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permissions")
    } finally {
      setSaving(false)
    }
  }

  const toggleColumn = (action: string, value: boolean) => {
    setCells((prev) =>
      prev.map((c) => (c.action === action ? { ...c, granted: value } : c))
    )
  }

  const toggleRow = (module: string, value: boolean) => {
    setCells((prev) =>
      prev.map((c) => (c.module === module ? { ...c, granted: value } : c))
    )
  }

  const modules = [...new Set(cells.map((c) => c.module))].sort()
  const actions = [...new Set(cells.map((c) => c.action))].sort(
    (a, b) => KNOWN_ACTIONS.indexOf(a as typeof KNOWN_ACTIONS[number]) - KNOWN_ACTIONS.indexOf(b as typeof KNOWN_ACTIONS[number])
  )

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Shield className="mb-3 size-10" />
        <p className="text-sm">No roles available. Create a role first to manage permissions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="perm-role-select" className="text-sm font-medium">
          Role:
        </label>
        <select
          id="perm-role-select"
          value={selectedRoleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select a role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
          Permissions saved successfully
        </div>
      )}

      {selectedRoleId && !loading && cells.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Module</th>
                  {actions.map((action) => (
                    <th key={action} className="px-3 py-2.5 text-center font-medium text-muted-foreground capitalize">
                      <div className="flex flex-col items-center gap-1">
                        <span>{action}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const allOn = cells.filter((c) => c.action === action).every((c) => c.granted)
                            toggleColumn(action, !allOn)
                          }}
                          className="rounded p-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                          title={`Toggle all ${action}`}
                        >
                          {cells.filter((c) => c.action === action).every((c) => c.granted) ? "☑" : "☐"}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium capitalize">
                      <div className="flex items-center gap-2">
                        <span>{module.replace(/_/g, " ")}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const allOn = cells.filter((c) => c.module === module).every((c) => c.granted)
                            toggleRow(module, !allOn)
                          }}
                          className="rounded p-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                          title={`Toggle all ${module}`}
                        >
                          {cells.filter((c) => c.module === module).every((c) => c.granted) ? "☑" : "☐"}
                        </button>
                      </div>
                    </td>
                    {actions.map((action) => {
                      const cell = cells.find((c) => c.module === module && c.action === action)
                      return (
                        <td key={`${module}-${action}`} className="px-3 py-2.5 text-center">
                          {cell ? (
                            <input
                              type="checkbox"
                              checked={cell.granted}
                              onChange={() => toggleCell(cell.permission_id)}
                              className="size-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                            />
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </>
      )}

      {selectedRoleId && loading && (
        <div className="flex justify-center py-8 text-sm text-muted-foreground">Loading permissions...</div>
      )}

      {selectedRoleId && !loading && cells.length === 0 && (
        <div className="flex justify-center py-8 text-sm text-muted-foreground">
          No permissions found in the system.
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { UserPlus, Shield, Key } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { stripEmptyStrings } from "../utils"
import { StaffTable } from "./staff-table"
import { StaffForm } from "./staff-form"
import { RoleTable } from "./role-table"
import { RoleForm } from "./role-form"
import { PermissionMatrix } from "./permission-matrix"
import { apiClient } from "@/lib/api-client"
import type {
  StaffProfileWithRelations,
  StaffProfile,
  Role,
} from "../types"
import type { Municipality } from "@/features/municipalities/types"

type Tab = "staff" | "roles" | "permissions"

type UsersClientProps = {
  initialStaff: StaffProfileWithRelations[]
  roles: Role[]
  municipalities: Municipality[]
}

export function UsersClient({ initialStaff, roles, municipalities }: UsersClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("staff")
  const [staff, setStaff] = useState<StaffProfileWithRelations[]>(initialStaff)
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<StaffProfileWithRelations | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "staff", label: "Staff Accounts", icon: UserPlus },
    { key: "roles", label: "Roles", icon: Shield },
    { key: "permissions", label: "Permissions", icon: Key },
  ]

  const handleStaffFormSave = async (data: Record<string, unknown>) => {
    try {
      if (editingProfile) {
        // Omit untouched empties (NULL-backed profile fields surface as "") so
        // server-side min(1) validation can't fail on values the user never set.
        const payload = stripEmptyStrings({
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          role_id: data.role_id,
        })
        const updated = await apiClient<StaffProfileWithRelations>(
          `/users/${editingProfile.id}`,
          {
            method: "PATCH",
            body: {
              ...payload,
              municipality_id: data.municipality_id || null,
            },
          }
        )
        setStaff((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        notifySuccess("Staff account updated.")
      } else {
        const created = await apiClient<StaffProfileWithRelations>("/users", {
          method: "POST",
          body: data,
        })
        setStaff((prev) => [created, ...prev])
        notifySuccess("Staff account created.")
      }
      setShowStaffForm(false)
      setEditingProfile(null)
    } catch (err) {
      notifyError(errorReason(err, "Failed to save staff account. Please try again."))
    }
  }

  const handleDeleteStaff = async (profile: StaffProfileWithRelations) => {
    const displayName =
      profile.username ||
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "this staff account"
    if (!confirm(`Delete staff account "${displayName}"? This action cannot be undone.`)) return

    try {
      await apiClient(`/users/${profile.id}`, { method: "DELETE" })
      setStaff((prev) => prev.filter((p) => p.id !== profile.id))
      notifySuccess("Staff account deleted.")
    } catch (err) {
      notifyError(errorReason(err, "Failed to delete staff account. Please try again."))
    }
  }

  const handleToggleStatus = useCallback(async (profile: StaffProfileWithRelations) => {
    const previousStatus = profile.account_status
    const flippedStatus: StaffProfile["account_status"] =
      previousStatus === "active" ? "inactive" : "active"

    setTogglingId(profile.id)
    setStaff((prev) =>
      prev.map((p) =>
        p.id === profile.id ? { ...p, account_status: flippedStatus } : p
      )
    )

    try {
      const updated = await apiClient<StaffProfileWithRelations>(
        `/users/${profile.id}/status`,
        { method: "PATCH" }
      )
      setStaff((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )
      notifySuccess(`Account status updated to ${flippedStatus}.`)
    } catch (err) {
      notifyError(errorReason(err, "Failed to update account status. Please try again."))
      setStaff((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, account_status: previousStatus } : p
        )
      )
    } finally {
      setTogglingId(null)
    }
  }, [])

  const [roleList, setRoleList] = useState<Role[]>(roles)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const handleRoleSave = async (data: Record<string, unknown>) => {
    try {
      if (editingRole) {
        const updated = await apiClient<Role>(`/roles/${editingRole.id}`, {
          method: "PATCH",
          body: data,
        })
        setRoleList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        notifySuccess("Role updated.")
      } else {
        const created = await apiClient<Role>("/roles", {
          method: "POST",
          body: data,
        })
        setRoleList((prev) => [...prev, created])
        notifySuccess("Role created.")
      }
      setShowRoleForm(false)
      setEditingRole(null)
    } catch (err) {
      notifyError(errorReason(err, "Failed to save role. Please try again."))
    }
  }

  const handleRoleDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"? This action cannot be undone.`)) return
    try {
      await apiClient(`/roles/${role.id}`, { method: "DELETE" })
      setRoleList((prev) => prev.filter((r) => r.id !== role.id))
      notifySuccess(`Role "${role.name}" deleted.`)
    } catch (err) {
      notifyError(errorReason(err, "Failed to delete role. Please try again."))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">User & Role Management</h1>
        <p className="mt-1 text-sm opacity-80">Manage staff accounts, roles, and permissions</p>
      </div>

      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {staff.length} staff account{staff.length !== 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingProfile(null)
                setShowStaffForm(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <UserPlus className="size-4" />
              Add Staff
            </button>
          </div>

          <StaffTable
            staff={staff}
            onEdit={(profile) => {
              setEditingProfile(profile)
              setShowStaffForm(true)
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteStaff}
            togglingId={togglingId}
          />
        </div>
      )}

      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {roleList.length} role{roleList.length !== 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingRole(null)
                setShowRoleForm(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Shield className="size-4" />
              Add Role
            </button>
          </div>

          <RoleTable
            roles={roleList}
            onEdit={(role) => {
              setEditingRole(role)
              setShowRoleForm(true)
            }}
            onDelete={handleRoleDelete}
          />
        </div>
      )}

      {activeTab === "permissions" && <PermissionMatrix roles={roleList} />}

      {showStaffForm && (
        <StaffForm
          editingProfile={editingProfile}
          roles={roleList}
          municipalities={municipalities}
          onSave={handleStaffFormSave}
          onCancel={() => {
            setShowStaffForm(false)
            setEditingProfile(null)
          }}
        />
      )}

      {showRoleForm && (
        <RoleForm
          editingRole={editingRole}
          onSave={handleRoleSave}
          onCancel={() => {
            setShowRoleForm(false)
            setEditingRole(null)
          }}
        />
      )}
    </div>
  )
}

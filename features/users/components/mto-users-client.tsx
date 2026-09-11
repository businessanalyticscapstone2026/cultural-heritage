"use client"

import { useState, useCallback } from "react"
import { UserPlus, X } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { stripEmptyStrings } from "../utils"
import { StaffTable } from "./staff-table"
import { StaffForm } from "./staff-form"
import { AccountStatusBadge } from "./account-status-badge"
import { apiClient } from "@/lib/api-client"
import type {
  StaffProfileWithRelations,
  StaffProfile,
  Role,
} from "../types"
import type { Municipality } from "@/features/municipalities/types"

type MtoUsersClientProps = {
  initialStaff: StaffProfileWithRelations[]
  roles: Role[]
  municipality: Pick<Municipality, "id" | "name">
}

function formatDateTime(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function MtoUsersClient({ initialStaff, roles, municipality }: MtoUsersClientProps) {
  const [staff, setStaff] = useState<StaffProfileWithRelations[]>(initialStaff)
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<StaffProfileWithRelations | null>(null)
  const [viewingProfile, setViewingProfile] = useState<StaffProfileWithRelations | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

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
              municipality_id: municipality.id,
            },
          }
        )
        setStaff((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        notifySuccess("Staff account updated.")
      } else {
        const created = await apiClient<StaffProfileWithRelations>("/users", {
          method: "POST",
          body: {
            ...data,
            municipality_id: municipality.id,
          },
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

  const viewingName =
    viewingProfile == null
      ? ""
      : [viewingProfile.first_name, viewingProfile.last_name].filter(Boolean).join(" ") ||
        viewingProfile.username ||
        "Staff account"

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm opacity-80">
          Manage user accounts and roles for {municipality.name}.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {staff.length} staff account{staff.length !== 1 ? "s" : ""} in {municipality.name}
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
          onView={(profile) => setViewingProfile(profile)}
          onEdit={(profile) => {
            setEditingProfile(profile)
            setShowStaffForm(true)
          }}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteStaff}
          togglingId={togglingId}
        />
      </div>

      {showStaffForm && (
        <StaffForm
          editingProfile={editingProfile}
          roles={roles}
          municipalities={[{ ...municipality } as Municipality]}
          fixedMunicipalityId={municipality.id}
          onSave={handleStaffFormSave}
          onCancel={() => {
            setShowStaffForm(false)
            setEditingProfile(null)
          }}
        />
      )}

      {viewingProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mto-user-details-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="mto-user-details-title" className="text-lg font-semibold">
                {viewingName}
              </h2>
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close user details"
              >
                <X className="size-5" />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Username</dt>
                <dd className="mt-0.5 font-medium">{viewingProfile.username || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <AccountStatusBadge status={viewingProfile.account_status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Role</dt>
                <dd className="mt-0.5 font-medium">{viewingProfile.role?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Municipality</dt>
                <dd className="mt-0.5 font-medium">{viewingProfile.municipality?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Last login</dt>
                <dd className="mt-0.5 font-medium">{formatDateTime(viewingProfile.last_login)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Created</dt>
                <dd className="mt-0.5 font-medium">{formatDateTime(viewingProfile.created_at)}</dd>
              </div>
            </dl>
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(viewingProfile)
                  setViewingProfile(null)
                  setShowStaffForm(true)
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Edit account
              </button>
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

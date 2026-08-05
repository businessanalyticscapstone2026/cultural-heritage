"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { MunicipalityTable } from "./municipality-table"
import { MunicipalityForm } from "./municipality-form"
import { AuditLogDialog } from "./audit-log-dialog"
import {
  listMunicipalitiesAction,
  createMunicipalityAction,
  updateMunicipalityAction,
  updateMunicipalityStatusAction,
} from "../actions/municipality"
import type { Municipality, MunicipalityStatus } from "../types"

type MunicipalityClientProps = {
  initialMunicipalities: Municipality[]
}

export function MunicipalityClient({ initialMunicipalities }: MunicipalityClientProps) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>(initialMunicipalities)
  const [showForm, setShowForm] = useState(false)
  const [editingMunicipality, setEditingMunicipality] = useState<Municipality | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [auditLogOpen, setAuditLogOpen] = useState(false)
  const [auditLogMunicipality, setAuditLogMunicipality] = useState<{ id: string; name: string } | null>(null)

  const handleSave = async (data: { name: string; default_map_center?: { lat: number; long: number } }) => {
    try {
      if (editingMunicipality) {
        const updated = await updateMunicipalityAction(editingMunicipality.id, data)
        setMunicipalities((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        notifySuccess("Municipality updated.")
      } else {
        const created = await createMunicipalityAction(data)
        setMunicipalities((prev) => [...prev, created])
        notifySuccess("Municipality registered.")
      }
    } catch (err) {
      notifyError(errorReason(err, "Failed to save municipality. Please try again."))
      throw err
    }
  }

  const handleToggleStatus = async (municipality: Municipality) => {
    const newStatus: MunicipalityStatus = municipality.status === "active" ? "inactive" : "active"

    setTogglingId(municipality.id)
    setMunicipalities((prev) =>
      prev.map((m) => (m.id === municipality.id ? { ...m, status: newStatus } : m))
    )

    try {
      const updated = await updateMunicipalityStatusAction(municipality.id, newStatus)
      setMunicipalities((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      notifySuccess(`"${municipality.name}" is now ${newStatus}.`)
    } catch (err) {
      setMunicipalities((prev) =>
        prev.map((m) => (m.id === municipality.id ? { ...m, status: municipality.status } : m))
      )
      notifyError(errorReason(err, "Failed to update status. Please try again."))
    } finally {
      setTogglingId(null)
    }
  }

  const handleRefresh = async () => {
    try {
      const fresh = await listMunicipalitiesAction()
      setMunicipalities(fresh)
    } catch (err) {
      notifyError(errorReason(err, "Failed to refresh municipalities."))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Municipality Management</h1>
        <p className="mt-1 text-sm opacity-80">
          Register and manage participating municipalities in the First District of Batangas
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {municipalities.length} municipalit{municipalities.length !== 1 ? "ies" : "y"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingMunicipality(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Register Municipality
          </button>
        </div>
      </div>

      <MunicipalityTable
        municipalities={municipalities}
        onEdit={(m) => {
          setEditingMunicipality(m)
          setShowForm(true)
        }}
        onToggleStatus={handleToggleStatus}
        onViewAuditLog={(m) => {
          setAuditLogMunicipality({ id: m.id, name: m.name })
          setAuditLogOpen(true)
        }}
        togglingId={togglingId}
      />

      {showForm && (
        <MunicipalityForm
          open={showForm}
          onOpenChange={setShowForm}
          editingMunicipality={editingMunicipality}
          onSave={handleSave}
        />
      )}

      {auditLogOpen && auditLogMunicipality && (
        <AuditLogDialog
          open={auditLogOpen}
          onOpenChange={setAuditLogOpen}
          municipalityId={auditLogMunicipality.id}
          municipalityName={auditLogMunicipality.name}
        />
      )}
    </div>
  )
}

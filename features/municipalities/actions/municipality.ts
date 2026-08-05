"use server"

import {
  getMunicipalities as getMunicipalitiesService,
  getMunicipalityById as getMunicipalityByIdService,
  createMunicipality as createMunicipalityService,
  updateMunicipality as updateMunicipalityService,
  updateMunicipalityStatus as updateMunicipalityStatusService,
  getMunicipalityAuditLog as getMunicipalityAuditLogService,
} from "../services"
import { logAuditEvent } from "@/features/audit/services"
import type { MunicipalityStatus } from "../types"

export async function listMunicipalitiesAction(statusFilter?: MunicipalityStatus) {
  return getMunicipalitiesService(statusFilter)
}

export async function getMunicipalityAction(id: string) {
  return getMunicipalityByIdService(id)
}

export async function createMunicipalityAction(input: {
  name: string
  default_map_center?: { lat: number; long: number }
}) {
  const municipality = await createMunicipalityService(input)

  try {
    await logAuditEvent({
      category: "municipality",
      action: "municipality_created",
      targetType: "municipality",
      targetId: municipality.id,
      detail: { name: municipality.name, status: municipality.status },
    })
  } catch {}

  return municipality
}

export async function updateMunicipalityAction(
  id: string,
  input: { name?: string; default_map_center?: { lat: number; long: number } }
) {
  const municipality = await updateMunicipalityService(id, input)

  try {
    await logAuditEvent({
      category: "municipality",
      action: "municipality_updated",
      targetType: "municipality",
      targetId: municipality.id,
      detail: { name: municipality.name },
    })
  } catch {}

  return municipality
}

export async function updateMunicipalityStatusAction(id: string, status: MunicipalityStatus) {
  const municipality = await updateMunicipalityStatusService(id, status)

  try {
    await logAuditEvent({
      category: "municipality",
      action: "municipality_status_changed",
      targetType: "municipality",
      targetId: municipality.id,
      detail: { status: municipality.status },
    })
  } catch {}

  return municipality
}

export async function getMunicipalityAuditLogAction(municipalityId: string) {
  return getMunicipalityAuditLogService(municipalityId)
}

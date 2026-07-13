"use server"

import {
  getMunicipalities as getMunicipalitiesService,
  getMunicipalityById as getMunicipalityByIdService,
  createMunicipality as createMunicipalityService,
  updateMunicipality as updateMunicipalityService,
  updateMunicipalityStatus as updateMunicipalityStatusService,
  getMunicipalityAuditLog as getMunicipalityAuditLogService,
} from "../services"
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
  return createMunicipalityService(input)
}

export async function updateMunicipalityAction(
  id: string,
  input: { name?: string; default_map_center?: { lat: number; long: number } }
) {
  return updateMunicipalityService(id, input)
}

export async function updateMunicipalityStatusAction(id: string, status: MunicipalityStatus) {
  return updateMunicipalityStatusService(id, status)
}

export async function getMunicipalityAuditLogAction(municipalityId: string) {
  return getMunicipalityAuditLogService(municipalityId)
}

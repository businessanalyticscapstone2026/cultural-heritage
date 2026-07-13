export type MunicipalityStatus = "pending" | "active" | "inactive"

export interface Municipality {
  id: string
  name: string
  province: string
  status: MunicipalityStatus
  default_map_center: { lat: number; long: number } | null
  created_at: string
  updated_at: string
}

export interface MunicipalityAuditLog {
  id: string
  municipality_id: string
  action: "created" | "status_changed" | "updated"
  performed_by: string | null
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown>
  created_at: string
}

export interface CreateMunicipalityInput {
  name: string
  default_map_center?: { lat: number; long: number }
}

export interface UpdateMunicipalityInput {
  name?: string
  default_map_center?: { lat: number; long: number }
}

export interface MunicipalityWithStaffCount extends Municipality {
  staff_count: number
  heritage_site_count: number
}

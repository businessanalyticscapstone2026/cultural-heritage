export interface StaffProfile {
  id: string
  first_name: string | null
  last_name: string | null
  username: string | null
  role_id: string | null
  municipality_id: string | null
  account_status: "active" | "inactive"
  created_by: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

export type AccountStatus = "active" | "inactive"

export interface StaffProfileWithRelations extends StaffProfile {
  role: { id: string; name: string } | null
  municipality: { id: string; name: string } | null
  creator: { id: string; first_name: string | null; last_name: string | null } | null
}

export interface Role {
  id: string
  name: string
  description: string | null
  status: AccountStatus
  created_at: string
}

export interface Permission {
  id: string
  module: string
  action: string
  created_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  granted: boolean
}

export interface CreateStaffInput {
  email: string
  password: string
  first_name: string
  last_name: string
  username: string
  role_id: string
  municipality_id: string
}

export interface UpdateStaffInput {
  first_name?: string
  last_name?: string
  username?: string
  role_id?: string
  municipality_id?: string
}

export interface CreateRoleInput {
  name: string
  description?: string
  status?: AccountStatus
}

export interface UpdateRoleInput {
  name?: string
  description?: string
  status?: AccountStatus
}

export interface PermissionMatrixCell {
  module: string
  action: string
  permission_id: string
  granted: boolean
}

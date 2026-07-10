import type { Profile, UserRole } from "@/types/user"

export type { Profile, UserRole }

export interface UserFilters {
  role?: UserRole
  municipalityId?: string
  search?: string
}

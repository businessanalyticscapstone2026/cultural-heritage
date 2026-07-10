export type UserRole = "ptcao_admin" | "mto" | "tourist"

export interface Profile {
  id: string
  email: string
  role: UserRole
  fullName: string
  municipalityId?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  user: Profile
  accessToken: string
}

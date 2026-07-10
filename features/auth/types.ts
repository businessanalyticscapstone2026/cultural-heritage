export type { Profile, Session, UserRole } from "@/types/user"

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  fullName: string
  role: "tourist"
}

import type { Profile, UserFilters } from "../types"

export async function getUsers(filters?: UserFilters): Promise<Profile[]> {
  return []
}

export async function getUserById(id: string): Promise<Profile | null> {
  return null
}

export async function updateUserRole(id: string, role: Profile["role"]): Promise<Profile> {
  throw new Error("Not implemented")
}

export async function deleteUser(id: string): Promise<void> {}

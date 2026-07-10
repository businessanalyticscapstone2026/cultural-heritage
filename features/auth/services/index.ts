import type { LoginCredentials, SignupData } from "../types"
import type { Session } from "@/types/user"

export async function signIn(credentials: LoginCredentials): Promise<Session> {
  throw new Error("Not implemented")
}

export async function signUp(data: SignupData): Promise<Session> {
  throw new Error("Not implemented")
}

export async function signOut(): Promise<void> {}

export async function getSession(): Promise<Session | null> {
  return null
}

export async function resetPassword(email: string): Promise<void> {}

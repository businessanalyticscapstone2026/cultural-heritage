"use server"

export async function resolveLoginRoleAction(userId: string): Promise<{
  role: "tourist" | "staff" | "none"
}> {
  return { role: "none" }
}

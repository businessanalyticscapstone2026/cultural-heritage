"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/auth/clerk-bridge-register"
      signUpFallbackRedirectUrl="/auth/clerk-bridge-register"
    />
  )
}

import { UserCircle } from "lucide-react"
import Link from "next/link"
import { getGlobalSettingsPublic } from "@/features/settings/services"
import RegisterForm from "./register-form"

export default async function TouristRegisterPage() {
  const settings = await getGlobalSettingsPublic()
  const registrationDisabled = settings.allowUserRegistration === false

  if (registrationDisabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
            <UserCircle className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Registration Closed</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            New account registration is currently disabled. Please contact your administrator for access.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return <RegisterForm />
}

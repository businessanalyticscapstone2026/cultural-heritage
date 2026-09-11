"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { apiClient } from "@/lib/api-client"
import { AccountStatusBadge } from "./account-status-badge"
import type { OwnAccountSettings } from "../services"

const accountSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
})

type AccountFormValues = z.infer<typeof accountSchema>

function formatDateTime(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function MtoAccountSettingsForm({
  profile,
}: {
  profile: OwnAccountSettings["profile"]
}) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      username: profile.username ?? "",
    },
  })

  const onSave = async (data: AccountFormValues) => {
    try {
      await apiClient(`/users/${profile.id}`, {
        method: "PATCH",
        body: data,
      })
      notifySuccess("Account updated.")
      router.refresh()
    } catch (err) {
      notifyError(errorReason(err, "Failed to update account. Please try again."))
    }
  }

  return (
    <section aria-labelledby="mto-account-heading" className="rounded-xl border bg-card p-6">
      <h2 id="mto-account-heading" className="text-lg font-semibold">
        My Account
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your personal profile information.
      </p>

      <form
        onSubmit={handleSubmit(onSave, () =>
          notifyError("Please fix the highlighted fields and try again.")
        )}
        className="mt-4 space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="account-first-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              First Name *
            </label>
            <input
              id="account-first-name"
              {...register("first_name")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.first_name && <p className="mt-1 text-xs text-error">{errors.first_name.message}</p>}
          </div>
          <div>
            <label htmlFor="account-last-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Last Name *
            </label>
            <input
              id="account-last-name"
              {...register("last_name")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.last_name && <p className="mt-1 text-xs text-error">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="account-username" className="mb-1 block text-xs font-medium text-muted-foreground">
            Username *
          </label>
          <input
            id="account-username"
            {...register("username")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-xs"
          />
          {errors.username && <p className="mt-1 text-xs text-error">{errors.username.message}</p>}
        </div>

        <dl className="grid grid-cols-1 gap-4 border-t pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Role</dt>
            <dd className="mt-0.5 font-medium">{profile.role?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <AccountStatusBadge status={profile.account_status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Last login</dt>
            <dd className="mt-0.5 font-medium">{formatDateTime(profile.last_login)}</dd>
          </div>
        </dl>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  )
}

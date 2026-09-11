"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import { notifyError } from "@/lib/toast"
import type { StaffProfileWithRelations, Role } from "../types"
import type { Municipality } from "@/features/municipalities/types"

const staffSchema = z.object({
  // Email is create-only (hidden in edit mode): optional at base level,
  // required + valid format enforced for create in superRefine below.
  email: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  // Optional at the schema level so edit mode can leave NULL-backed fields
  // untouched; required-ness for create mode is enforced in superRefine below.
  // Edit callers strip "" values and the PATCH endpoints keep existing values.
  first_name: z.string().optional().or(z.literal("")),
  last_name: z.string().optional().or(z.literal("")),
  username: z.string().optional().or(z.literal("")),
  role_id: z.string().optional().or(z.literal("")),
  municipality_id: z.string().optional().or(z.literal("")),
})

type StaffFormValues = z.infer<typeof staffSchema>

type StaffFormProps = {
  editingProfile: StaffProfileWithRelations | null
  roles: Role[]
  municipalities: Municipality[]
  onSave: (data: StaffFormValues) => Promise<void>
  onCancel: () => void
  /** When set, the municipality is locked to this id (MTO-scoped creation). */
  fixedMunicipalityId?: string
}

export function StaffForm({ editingProfile, roles, municipalities, onSave, onCancel, fixedMunicipalityId }: StaffFormProps) {
  const isMtoRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role?.name === "MTO Staff"
  }

  const resolver = zodResolver(
    staffSchema.superRefine((values, ctx) => {
      // Create mode keeps strict required fields with inline errors.
      if (!editingProfile) {
        if (!values.email || !z.string().email().safeParse(values.email).success) {
          ctx.addIssue({ code: "custom", path: ["email"], message: "Invalid email" })
        }
        if (!values.first_name) {
          ctx.addIssue({ code: "custom", path: ["first_name"], message: "First name is required" })
        }
        if (!values.last_name) {
          ctx.addIssue({ code: "custom", path: ["last_name"], message: "Last name is required" })
        }
        if (!values.username) {
          ctx.addIssue({ code: "custom", path: ["username"], message: "Username is required" })
        }
        if (!values.role_id) {
          ctx.addIssue({ code: "custom", path: ["role_id"], message: "Role is required" })
        }
      }
      if (isMtoRole(values.role_id || "") && !values.municipality_id) {
        ctx.addIssue({
          code: "custom",
          path: ["municipality_id"],
          message: "Municipality is required for MTO Staff accounts",
        })
      }
    })
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver,
    defaultValues: editingProfile
      ? {
          email: "",
          password: "",
          first_name: editingProfile.first_name ?? "",
          last_name: editingProfile.last_name ?? "",
          username: editingProfile.username ?? "",
          role_id: editingProfile.role_id ?? "",
          municipality_id: editingProfile.municipality_id ?? fixedMunicipalityId ?? "",
        }
      : {
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          username: "",
          role_id: "",
          municipality_id: fixedMunicipalityId ?? "",
        },
  })

  const mtoRequiresMunicipality = isMtoRole(watch("role_id") || "")
  const municipalityOptions = fixedMunicipalityId
    ? municipalities.filter((m) => m.id === fixedMunicipalityId)
    : municipalities

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editingProfile ? "Edit Staff Account" : "Create Staff Account"}
          </h2>
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSave, () =>
            notifyError("Please fix the highlighted fields and try again.")
          )}
          className="space-y-4"
        >
          {!editingProfile && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-xs font-medium text-muted-foreground">
                First Name *
              </label>
              <input
                id="first_name"
                {...register("first_name")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.first_name && <p className="mt-1 text-xs text-error">{errors.first_name.message}</p>}
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-xs font-medium text-muted-foreground">
                Last Name *
              </label>
              <input
                id="last_name"
                {...register("last_name")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.last_name && <p className="mt-1 text-xs text-error">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-medium text-muted-foreground">
              Username *
            </label>
            <input
              id="username"
              {...register("username")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.username && <p className="mt-1 text-xs text-error">{errors.username.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="role_id" className="mb-1 block text-xs font-medium text-muted-foreground">
                Role *
              </label>
              <select
                id="role_id"
                {...register("role_id")}
                disabled={roles.length === 0}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {roles.length === 0 ? (
                <p className="mt-1 text-xs text-error">
                  No assignable roles available — contact your PTCAO administrator.
                </p>
              ) : (
                errors.role_id && <p className="mt-1 text-xs text-error">{errors.role_id.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="municipality_id" className="mb-1 block text-xs font-medium text-muted-foreground">
                Municipality{mtoRequiresMunicipality || fixedMunicipalityId ? " *" : ""}
              </label>
              <select
                id="municipality_id"
                {...register("municipality_id")}
                disabled={!!fixedMunicipalityId}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">{mtoRequiresMunicipality ? "Select municipality" : "All / Provincial"}</option>
                {municipalityOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.municipality_id && <p className="mt-1 text-xs text-error">{errors.municipality_id.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editingProfile ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

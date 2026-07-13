"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import type { StaffProfileWithRelations, Role, Municipality } from "../types"

const staffSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  role_id: z.string().min(1, "Role is required"),
  municipality_id: z.string().optional().or(z.literal("")),
})

type StaffFormValues = z.infer<typeof staffSchema>

type StaffFormProps = {
  editingProfile: StaffProfileWithRelations | null
  roles: Role[]
  municipalities: Municipality[]
  onSave: (data: StaffFormValues) => Promise<void>
  onCancel: () => void
}

export function StaffForm({ editingProfile, roles, municipalities, onSave, onCancel }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: editingProfile
      ? {
          email: "",
          password: "",
          first_name: editingProfile.first_name ?? "",
          last_name: editingProfile.last_name ?? "",
          username: editingProfile.username ?? "",
          role_id: editingProfile.role_id ?? "",
          municipality_id: editingProfile.municipality_id ?? "",
        }
      : {
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          username: "",
          role_id: "",
          municipality_id: "",
        },
  })

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

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
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
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.role_id && <p className="mt-1 text-xs text-error">{errors.role_id.message}</p>}
            </div>
            <div>
              <label htmlFor="municipality_id" className="mb-1 block text-xs font-medium text-muted-foreground">
                Municipality
              </label>
              <select
                id="municipality_id"
                {...register("municipality_id")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All / Provincial</option>
                {municipalities.map((m) => (
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

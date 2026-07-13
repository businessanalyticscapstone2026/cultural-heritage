"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import type { Role } from "../types"

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
})

type RoleFormValues = z.infer<typeof roleSchema>

type RoleFormProps = {
  editingRole: Role | null
  onSave: (data: RoleFormValues) => Promise<void>
  onCancel: () => void
}

export function RoleForm({ editingRole, onSave, onCancel }: RoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: editingRole
      ? {
          name: editingRole.name,
          description: editingRole.description ?? "",
          status: editingRole.status,
        }
      : {
          name: "",
          description: "",
          status: "active",
        },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editingRole ? "Edit Role" : "Create Role"}
          </h2>
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label htmlFor="role-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Role Name *
            </label>
            <input
              id="role-name"
              {...register("name")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="role-description" className="mb-1 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              id="role-description"
              rows={3}
              {...register("description")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.description && <p className="mt-1 text-xs text-error">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="role-status" className="mb-1 block text-xs font-medium text-muted-foreground">
              Status
            </label>
            <select
              id="role-status"
              {...register("status")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="mt-1 text-xs text-error">{errors.status.message}</p>}
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
              {isSubmitting ? "Saving..." : editingRole ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

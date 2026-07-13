"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Municipality } from "../types"

const municipalitySchema = z.object({
  name: z.string().min(1, "Municipality name is required"),
  lat: z.string().optional(),
  long: z.string().optional(),
})

type MunicipalityFormValues = z.infer<typeof municipalitySchema>

type MunicipalityFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingMunicipality: Municipality | null
  onSave: (data: { name: string; default_map_center?: { lat: number; long: number } }) => Promise<void>
}

export function MunicipalityForm({
  open,
  onOpenChange,
  editingMunicipality,
  onSave,
}: MunicipalityFormProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MunicipalityFormValues>({
    resolver: zodResolver(municipalitySchema),
    defaultValues: editingMunicipality
      ? {
          name: editingMunicipality.name,
          lat: editingMunicipality.default_map_center?.lat?.toString() ?? "",
          long: editingMunicipality.default_map_center?.long?.toString() ?? "",
        }
      : { name: "", lat: "", long: "" },
  })

  const handleSave = async (data: MunicipalityFormValues) => {
    const lat = data.lat ? parseFloat(data.lat) : NaN
    const long = data.long ? parseFloat(data.long) : NaN
    const hasCoords = !isNaN(lat) && !isNaN(long)

    setSaving(true)
    try {
      await onSave({
        name: data.name,
        default_map_center: hasCoords
          ? { lat, long }
          : editingMunicipality?.default_map_center ?? undefined,
      })
      reset()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingMunicipality ? "Edit Municipality" : "Register Municipality"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Municipality Name *
            </label>
            <input
              id="name"
              {...register("name")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Taal"
            />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="mb-1 block text-xs font-medium text-muted-foreground">
                Latitude
              </label>
              <input
                id="lat"
                {...register("lat")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="13.8833"
              />
            </div>
            <div>
              <label htmlFor="long" className="mb-1 block text-xs font-medium text-muted-foreground">
                Longitude
              </label>
              <input
                id="long"
                {...register("long")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="120.9239"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingMunicipality ? "Update" : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Save } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import type { GlobalSettings } from "../types"

type GlobalSettingsFormValues = {
  defaultLanguage: "en" | "fil" | "tl"
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  timeZone: string
  itemsPerPage: number
  sessionTimeout: number
  defaultDashboard: "admin" | "mto"
  maintenanceMode: boolean
  allowUserRegistration: boolean
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fil", label: "Filipino" },
  { value: "tl", label: "Tagalog" },
] as const

const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
] as const

const TIMEZONE_OPTIONS = [
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Tokyo",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
] as const

const DASHBOARD_OPTIONS = [
  { value: "admin", label: "Admin Dashboard" },
  { value: "mto", label: "MTO Dashboard" },
] as const

type GlobalSettingsFormProps = {
  settings: GlobalSettings
}

export default function GlobalSettingsForm({ settings }: GlobalSettingsFormProps) {
  const [saving, setSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      defaultLanguage: settings.defaultLanguage as "en" | "fil" | "tl",
      dateFormat: settings.dateFormat as "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD",
      timeZone: settings.timeZone,
      itemsPerPage: settings.itemsPerPage,
      sessionTimeout: settings.sessionTimeout,
      defaultDashboard: settings.defaultDashboard as "admin" | "mto",
      maintenanceMode: settings.maintenanceMode,
      allowUserRegistration: settings.allowUserRegistration,
    },
  })

  async function onSubmit(values: GlobalSettingsFormValues) {
    setSaving(true)
    try {
      const { updateGlobalSettings } = await import("../actions")
      await updateGlobalSettings(values)
      notifySuccess("Global settings saved.")
    } catch (err) {
      notifyError(errorReason(err, "Failed to save global settings."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Display Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Display</h3>
            <p className="text-xs text-muted-foreground">
              Language, date format, time zone, and pagination defaults.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <select
                id="defaultLanguage"
                {...form.register("defaultLanguage")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateFormat">Date Format</Label>
              <select
                id="dateFormat"
                {...form.register("dateFormat")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timeZone">Time Zone</Label>
              <select
                id="timeZone"
                {...form.register("timeZone")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Input
                id="itemsPerPage"
                type="number"
                min={5}
                max={100}
                {...form.register("itemsPerPage", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Session & Dashboard */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Session & Dashboard</h3>
            <p className="text-xs text-muted-foreground">
              Session timeout and default landing page.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min={5}
                max={480}
                {...form.register("sessionTimeout", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="defaultDashboard">Default Dashboard</Label>
              <select
                id="defaultDashboard"
                {...form.register("defaultDashboard")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {DASHBOARD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Toggles */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Access Control</h3>
            <p className="text-xs text-muted-foreground">
              Maintenance mode and user registration toggles. Changes apply immediately via optimistic UI.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, the system displays a maintenance page to non-admin users.
                </p>
              </div>
              <Switch
                checked={form.watch("maintenanceMode")}
                onCheckedChange={(checked) => {
                  form.setValue("maintenanceMode", checked, { shouldValidate: true })
                  // Optimistic UI: fire-and-forget server action for boolean toggle
                  import("../actions").then(({ updateMaintenanceMode }) =>
                    updateMaintenanceMode(checked).then(() => {
                      notifySuccess("Maintenance mode updated.")
                    }).catch((err) => {
                      form.setValue("maintenanceMode", !checked, { shouldValidate: true })
                      notifyError(errorReason(err, "Failed to update maintenance mode."))
                    })
                  )
                }}
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Allow User Registration</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, tourists can create new accounts through the registration flow.
                </p>
              </div>
              <Switch
                checked={form.watch("allowUserRegistration")}
                onCheckedChange={(checked) => {
                  form.setValue("allowUserRegistration", checked, { shouldValidate: true })
                  // Optimistic UI: fire-and-forget server action for boolean toggle
                  import("../actions").then(({ updateAllowUserRegistration }) =>
                    updateAllowUserRegistration(checked).then(() => {
                      notifySuccess("User registration setting updated.")
                    }).catch((err) => {
                      form.setValue("allowUserRegistration", !checked, { shouldValidate: true })
                      notifyError(errorReason(err, "Failed to update user registration setting."))
                    })
                  )
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save General Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}

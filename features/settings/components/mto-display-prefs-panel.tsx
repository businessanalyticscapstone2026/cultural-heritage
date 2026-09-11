"use client"

import { useState } from "react"
import { notifySuccess } from "@/lib/toast"
import { useMtoDisplayPrefs, type MtoDisplayPrefs } from "../hooks/use-mto-display-prefs"

export function MtoDisplayPrefsPanel() {
  const { prefs, loaded, savePrefs } = useMtoDisplayPrefs()
  const [draft, setDraft] = useState<MtoDisplayPrefs | null>(null)

  const values = draft ?? prefs

  const handleSave = () => {
    savePrefs(values)
    setDraft(null)
    notifySuccess("Display preferences saved on this device.")
  }

  return (
    <section aria-labelledby="mto-prefs-heading" className="rounded-xl border bg-card p-6">
      <h2 id="mto-prefs-heading" className="text-lg font-semibold">
        Display Preferences
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Personalize how information is shown. Saved on this device only.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="prefs-language" className="mb-1 block text-xs font-medium text-muted-foreground">
            Language
          </label>
          <select
            id="prefs-language"
            value={values.language}
            disabled={!loaded}
            onChange={(e) =>
              setDraft({ ...values, language: e.target.value as MtoDisplayPrefs["language"] })
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            <option value="en">English</option>
            <option value="fil">Filipino</option>
            <option value="tl">Tagalog</option>
          </select>
        </div>
        <div>
          <label htmlFor="prefs-date-format" className="mb-1 block text-xs font-medium text-muted-foreground">
            Date Format
          </label>
          <select
            id="prefs-date-format"
            value={values.dateFormat}
            disabled={!loaded}
            onChange={(e) =>
              setDraft({ ...values, dateFormat: e.target.value as MtoDisplayPrefs["dateFormat"] })
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label htmlFor="prefs-rows" className="mb-1 block text-xs font-medium text-muted-foreground">
            Rows Per Page
          </label>
          <select
            id="prefs-rows"
            value={values.rowsPerPage}
            disabled={!loaded}
            onChange={(e) =>
              setDraft({ ...values, rowsPerPage: Number(e.target.value) })
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!loaded}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Save preferences
        </button>
      </div>
    </section>
  )
}

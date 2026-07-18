"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Plus,
  Trash2,
  Plug,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { IntegrationRecord } from "../types"

type IntegrationCreateFormValues = {
  name: string
  category: string
  status: "active" | "inactive" | "error"
  apiKeyMasked?: string
}

const INTEGRATION_CATEGORIES = [
  "Maps & Geolocation",
  "Analytics",
  "Communication",
  "Storage",
  "Payment",
  "Authentication",
  "Other",
] as const

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
}

function maskApiKey(raw: string): string {
  if (raw.length <= 8) return "••••••••"
  return `${raw.slice(0, 4)}${"•".repeat(raw.length - 8)}${raw.slice(-4)}`
}

function maskExistingKey(key: string | null): string {
  if (!key) return "Not configured"
  return key
}

type IntegrationsPanelProps = {
  integrations: IntegrationRecord[]
}

export default function IntegrationsPanel({ integrations }: IntegrationsPanelProps) {
  const [localIntegrations, setLocalIntegrations] = useState(integrations)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<IntegrationRecord | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { loading: boolean; message: string | null; error: boolean }>>({})
  const [editTarget, setEditTarget] = useState<IntegrationRecord | null>(null)

  const addForm = useForm<IntegrationCreateFormValues>({
    defaultValues: {
      name: "",
      category: "Other",
      status: "inactive",
      apiKeyMasked: "",
    },
  })

  async function handleAdd(values: IntegrationCreateFormValues) {
    try {
      const { createIntegrationAction } = await import("../actions")
      await createIntegrationAction({
        name: values.name,
        category: values.category,
        status: values.status,
        api_key_masked: values.apiKeyMasked ? maskApiKey(values.apiKeyMasked) : null,
      })
      // Re-fetch page to get fresh data
      window.location.reload()
    } catch {
      // Error handled by parent page revalidation
    }
    setAddDialogOpen(false)
    addForm.reset()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const { deleteIntegrationAction } = await import("../actions")
      await deleteIntegrationAction(deleteTarget.id)
      setLocalIntegrations((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    } catch {
      // Error handled by parent page revalidation
    }
    setDeleteTarget(null)
  }

  async function handleTestConnection(id: string) {
    setTestResults((prev) => ({
      ...prev,
      [id]: { loading: true, message: null, error: false },
    }))
    try {
      const { testIntegrationConnectionAction } = await import("../actions")
      const result = await testIntegrationConnectionAction(id)
      setTestResults((prev) => ({
        ...prev,
        [id]: { loading: false, message: result.message, error: !result.success },
      }))
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          message: err instanceof Error ? err.message : "Connection test failed.",
          error: true,
        },
      }))
    }
  }

  async function handleToggleStatus(integration: IntegrationRecord) {
    const newStatus = integration.status === "active" ? "inactive" : "active"
    try {
      const { updateIntegrationAction } = await import("../actions")
      await updateIntegrationAction(integration.id, { status: newStatus })
      setLocalIntegrations((prev) =>
        prev.map((i) => (i.id === integration.id ? { ...i, status: newStatus } : i))
      )
    } catch {
      // Error handled by parent page revalidation
    }
  }

  async function handleUpdateApiKey(integrationId: string, rawKey: string) {
    try {
      const { updateIntegrationAction } = await import("../actions")
      const masked = rawKey ? maskApiKey(rawKey) : null
      await updateIntegrationAction(integrationId, { api_key_masked: masked })
      setLocalIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, apiKeyMasked: masked } : i))
      )
      setEditTarget(null)
    } catch {
      // Error handled by parent page revalidation
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Third-Party Integrations</h3>
          <p className="text-xs text-muted-foreground">
            Manage external service connections. API keys are masked and never sent to the client.
          </p>
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="size-3.5" />
          Add Integration
        </Button>
      </div>

      {localIntegrations.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Plug className="mx-auto size-8 text-muted-foreground/70" />
          <p className="mt-2 text-sm text-muted-foreground">No integrations configured yet.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setAddDialogOpen(true)}>
            <Plus className="size-3.5" />
            Add Your First Integration
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {localIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">{integration.name}</h4>
                    <Badge
                      className={STATUS_STYLES[integration.status] ?? STATUS_STYLES.inactive}
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  {integration.category && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{integration.category}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">API Key:</span>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {maskExistingKey(integration.apiKeyMasked)}
                      </code>
                    </div>
                    {integration.lastSync && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="text-foreground">
                          {new Date(integration.lastSync).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {testResults[integration.id]?.message && (
                    <div
                      className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                        testResults[integration.id].error
                          ? "bg-destructive/5 text-destructive"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <AlertCircle className="size-3.5 shrink-0" />
                      {testResults[integration.id].message}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="icon-xs"
                    variant="outline"
                    title="Test Connection"
                    disabled={testResults[integration.id]?.loading || integration.status === "inactive"}
                    onClick={() => handleTestConnection(integration.id)}
                  >
                    {testResults[integration.id]?.loading ? (
                      <RefreshCw className="size-3 animate-spin" />
                    ) : (
                      <Plug className="size-3" />
                    )}
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="outline"
                    title="Edit API Key"
                    onClick={() => setEditTarget(integration)}
                  >
                    <ExternalLink className="size-3" />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="destructive"
                    title="Toggle Status"
                    onClick={() => handleToggleStatus(integration)}
                  >
                    {integration.status === "active" ? "On" : "Off"}
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="destructive"
                    title="Delete Integration"
                    onClick={() => setDeleteTarget(integration)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Integration Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Configure a new third-party service integration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Service Name</Label>
              <input
                id="add-name"
                {...addForm.register("name")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="e.g. Google Maps Platform"
              />
              {addForm.formState.errors.name && (
                <p className="text-xs text-destructive">{addForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-category">Category</Label>
              <select
                id="add-category"
                {...addForm.register("category")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {INTEGRATION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-apikey">API Key (optional, will be masked)</Label>
              <input
                id="add-apikey"
                type="password"
                {...addForm.register("apiKeyMasked")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Enter API key"
              />
              <p className="text-xs text-muted-foreground">
                The key will be masked before storage. Only the first 4 and last 4 characters are retained.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Integration</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update API Key</DialogTitle>
            <DialogDescription>
              Update the API key for &ldquo;{editTarget?.name}&rdquo;. Leave empty to remove.
            </DialogDescription>
          </DialogHeader>
          <ApiKeyEditForm
            integrationId={editTarget?.id ?? ""}
            currentKey={editTarget?.apiKeyMasked ?? null}
            onSave={handleUpdateApiKey}
            onCancel={() => setEditTarget(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApiKeyEditForm({
  integrationId,
  currentKey,
  onSave,
  onCancel,
}: {
  integrationId: string
  currentKey: string | null
  onSave: (id: string, rawKey: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-apikey">New API Key</Label>
        <input
          id="edit-apikey"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder={currentKey ? `Current: ${currentKey}` : "Enter new API key"}
        />
        <p className="text-xs text-muted-foreground">
          The key will be masked before storage. Only the first 4 and last 4 characters are retained.
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(integrationId, value)}>
          Save Key
        </Button>
      </DialogFooter>
    </div>
  )
}

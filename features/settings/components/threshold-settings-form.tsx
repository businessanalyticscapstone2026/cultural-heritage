"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Save, RotateCcw } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { ThresholdSettings, RecommendationWeights } from "../types"

type RecommendationWeightsFormValues = {
  categoryMatch: number
  historicalSignificance: number
  accessibility: number
  distance: number
  popularity: number
}

type RoutingConfigFormValues = {
  maxStops: number
  maxTravelTimeMinutes: number
  preferShortestDistance: boolean
}

const DEFAULT_WEIGHTS: RecommendationWeights = {
  categoryMatch: 0.3,
  historicalSignificance: 0.25,
  accessibility: 0.2,
  distance: 0.15,
  popularity: 0.1,
}

type ThresholdSettingsFormProps = {
  settings: ThresholdSettings
}

export default function ThresholdSettingsForm({ settings }: ThresholdSettingsFormProps) {
  const [weightsSaving, setWeightsSaving] = useState(false)
  const [routingSaving, setRoutingSaving] = useState(false)

  const weightsForm = useForm<RecommendationWeightsFormValues>({
    defaultValues: {
      categoryMatch: settings.recommendationWeights.categoryMatch,
      historicalSignificance: settings.recommendationWeights.historicalSignificance,
      accessibility: settings.recommendationWeights.accessibility,
      distance: settings.recommendationWeights.distance,
      popularity: settings.recommendationWeights.popularity,
    },
  })

  const routingForm = useForm<RoutingConfigFormValues>({
    defaultValues: {
      maxStops: settings.routingConfig.maxStops,
      maxTravelTimeMinutes: settings.routingConfig.maxTravelTimeMinutes,
      preferShortestDistance: settings.routingConfig.preferShortestDistance,
    },
  })

  const watchedWeights = weightsForm.watch()
  const totalWeight = Object.values(watchedWeights).reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0)
  const weightsValid = Math.abs(totalWeight - 1) < 0.01

  async function onSubmitWeights(values: RecommendationWeightsFormValues) {
    if (!weightsValid) {
      notifyError("Weights must sum to 1.0.")
      return
    }
    setWeightsSaving(true)
    try {
      const { updateRecommendationWeights } = await import("../actions")
      await updateRecommendationWeights(values)
      notifySuccess("Recommendation weights saved.")
    } catch (err) {
      notifyError(errorReason(err, "Failed to save recommendation weights."))
    } finally {
      setWeightsSaving(false)
    }
  }

  function resetWeights() {
    weightsForm.reset(DEFAULT_WEIGHTS)
  }

  async function onSubmitRouting(values: RoutingConfigFormValues) {
    setRoutingSaving(true)
    try {
      const { updateRoutingConfig } = await import("../actions")
      await updateRoutingConfig(values)
      notifySuccess("Routing config saved.")
    } catch (err) {
      notifyError(errorReason(err, "Failed to save routing config."))
    } finally {
      setRoutingSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Recommendation Weights */}
      <form onSubmit={weightsForm.handleSubmit(onSubmitWeights)} className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Recommendation Engine Weights</h3>
          <p className="text-xs text-muted-foreground">
            Weights for the hybrid recommendation scoring algorithm (CHTS-024). All weights must sum to 1.0.
            These values are read by the recommendation engine at
            <code className="mx-1 rounded bg-muted px-1 font-mono text-xs">system_settings.key = &apos;recommendation_weights&apos;</code>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="categoryMatch">Category Match</Label>
            <Input
              id="categoryMatch"
              type="number"
              step="0.05"
              min={0}
              max={1}
              {...weightsForm.register("categoryMatch", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="historicalSignificance">Historical Significance</Label>
            <Input
              id="historicalSignificance"
              type="number"
              step="0.05"
              min={0}
              max={1}
              {...weightsForm.register("historicalSignificance", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accessibility">Accessibility</Label>
            <Input
              id="accessibility"
              type="number"
              step="0.05"
              min={0}
              max={1}
              {...weightsForm.register("accessibility", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="distance">Distance</Label>
            <Input
              id="distance"
              type="number"
              step="0.05"
              min={0}
              max={1}
              {...weightsForm.register("distance", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="popularity">Popularity</Label>
            <Input
              id="popularity"
              type="number"
              step="0.05"
              min={0}
              max={1}
              {...weightsForm.register("popularity", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${weightsValid ? "text-emerald-600" : "text-destructive"}`}>
            Total: {totalWeight.toFixed(2)} {weightsValid ? "(valid)" : "(must equal 1.00)"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={weightsSaving || !weightsValid}>
            <Save className="size-3.5" />
            {weightsSaving ? "Saving..." : "Save Weights"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={resetWeights}>
            <RotateCcw className="size-3.5" />
            Reset to Defaults
          </Button>
        </div>
      </form>

      <Separator />

      {/* Routing Config */}
      <form onSubmit={routingForm.handleSubmit(onSubmitRouting)} className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Route Optimization Config</h3>
          <p className="text-xs text-muted-foreground">
            Limits for the tourist Route Planner (CHTS-025). Dijkstra computes each leg; the visiting order is then optimized.
            Stored in
            <code className="mx-1 rounded bg-muted px-1 font-mono text-xs">system_settings.key = &apos;routing_config&apos;</code>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="maxStops">Max Stops Per Route</Label>
            <Input
              id="maxStops"
              type="number"
              min={1}
              max={50}
              {...routingForm.register("maxStops", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Tourists cannot plan a route with more stops than this; they are asked to remove some.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxTravelTimeMinutes">Max Travel Time (minutes)</Label>
            <Input
              id="maxTravelTimeMinutes"
              type="number"
              min={15}
              max={1440}
              {...routingForm.register("maxTravelTimeMinutes", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Route options longer than this are marked &quot;Over time limit&quot;, and &quot;Highlights first&quot; tries to stay under it.
            </p>
          </div>
        </div>

        <label className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Prefer Shortest Distance</p>
            <p className="text-xs text-muted-foreground">
              When on, the Shortest route is recommended and selected first. When off, the Fastest route is.
            </p>
          </div>
          <input
            type="checkbox"
            {...routingForm.register("preferShortestDistance")}
            className="size-4 accent-primary"
          />
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={routingSaving}>
            <Save className="size-3.5" />
            {routingSaving ? "Saving..." : "Save Routing Config"}
          </Button>
        </div>
      </form>
    </div>
  )
}

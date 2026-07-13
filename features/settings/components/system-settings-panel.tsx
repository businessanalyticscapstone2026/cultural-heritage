"use client"

import { Settings, Sliders, Plug } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GlobalSettingsForm from "./global-settings-form"
import ThresholdSettingsForm from "./threshold-settings-form"
import IntegrationsPanel from "./integrations-panel"
import type { SettingsData } from "../types"

type SystemSettingsPanelProps = {
  data: SettingsData
}

export default function SystemSettingsPanel({ data }: SystemSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="mt-1 text-sm opacity-80">
          Manage global configuration, recommendation thresholds, and third-party integrations.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="general">
            <Settings className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="thresholds">
            <Sliders className="size-4" />
            Thresholds
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="size-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-4">
          <div className="rounded-xl border bg-card p-6">
            <GlobalSettingsForm settings={data.globalSettings} />
          </div>
        </TabsContent>

        <TabsContent value="thresholds" className="pt-4">
          <div className="rounded-xl border bg-card p-6">
            <ThresholdSettingsForm settings={data.thresholdSettings} />
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="pt-4">
          <div className="rounded-xl border bg-card p-6">
            <IntegrationsPanel integrations={data.integrations} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

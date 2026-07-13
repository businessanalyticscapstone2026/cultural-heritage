import { getGisConfig, getHeritageCategories, getGoogleMapsIntegration } from "@/features/gis/services"
import GisAdminPanel from "@/features/gis/components/gis-admin-panel"

export default async function GISAdminPage() {
  const [gisConfig, categories, googleMapsIntegration] = await Promise.all([
    getGisConfig(),
    getHeritageCategories(),
    getGoogleMapsIntegration(),
  ])

  return (
    <GisAdminPanel
      gisConfig={gisConfig}
      categories={categories}
      googleMapsIntegration={googleMapsIntegration}
    />
  )
}

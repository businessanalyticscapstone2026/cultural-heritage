import {
  getGisConfig,
  getHeritageCategories,
  getGoogleMapsIntegration,
  getAllMapSites,
  hasGoogleMapsServerApiKey,
} from "@/features/gis/services"
import GisAdminPanel from "@/features/gis/components/gis-admin-panel"

export default async function GISAdminPage() {
  const [gisConfig, categories, googleMapsIntegration, sites] = await Promise.all([
    getGisConfig(),
    getHeritageCategories(),
    getGoogleMapsIntegration(),
    getAllMapSites(),
  ])

  return (
    <GisAdminPanel
      gisConfig={gisConfig}
      categories={categories}
      googleMapsIntegration={googleMapsIntegration}
      googleMapsApiKeyConfigured={hasGoogleMapsServerApiKey()}
      sites={sites}
    />
  )
}

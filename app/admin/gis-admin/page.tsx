import {
  getGisConfig,
  getHeritageCategories,
  getGoogleMapsIntegration,
  getAllMapSites,
  hasGoogleMapsServerApiKey,
  getMunicipalBoundaryStatuses,
  getMunicipalityBoundaries,
} from "@/features/gis/services"
import { getMunicipalityOptions } from "@/features/municipalities/services"
import GisAdminPanel from "@/features/gis/components/gis-admin-panel"

export default async function GISAdminPage() {
  const [gisConfig, categories, googleMapsIntegration, sites, municipalities, boundaryStatuses, boundaries] =
    await Promise.all([
      getGisConfig(),
      getHeritageCategories(),
      getGoogleMapsIntegration(),
      getAllMapSites(),
      getMunicipalityOptions(),
      getMunicipalBoundaryStatuses(),
      getMunicipalityBoundaries(),
    ])

  return (
    <GisAdminPanel
      gisConfig={gisConfig}
      categories={categories}
      googleMapsIntegration={googleMapsIntegration}
      googleMapsApiKeyConfigured={hasGoogleMapsServerApiKey()}
      sites={sites}
      municipalities={municipalities}
      boundaryStatuses={boundaryStatuses}
      boundaries={boundaries}
    />
  )
}

import { MunicipalityClient } from "@/features/municipalities/components/municipality-client"
import { getMunicipalities } from "@/features/municipalities/services"

export default async function MunicipalitiesPage() {
  const municipalities = await getMunicipalities()

  return <MunicipalityClient initialMunicipalities={municipalities} />
}

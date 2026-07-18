import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { getMtoSiteById, getActiveCategories, getBarangays } from "@/features/heritage/services/mto-sites"
import MtoHeritageFormClient from "@/features/heritage/components/mto-heritage-form-client"

interface EditHeritageSitePageProps {
  params: Promise<{ id: string }>
}

export default async function EditHeritageSitePage({ params }: EditHeritageSitePageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user?.id ?? "")
    .maybeSingle()

  const municipalityId = profile?.municipality_id ?? ""

  if (!municipalityId) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p>No municipality assigned to your profile.</p>
      </div>
    )
  }

  const { data: municipality } = await supabase
    .from("municipalities")
    .select("name")
    .eq("id", municipalityId)
    .maybeSingle()

  const site = await getMtoSiteById(id, municipalityId)
  if (!site) notFound()

  const [categories, barangays] = await Promise.all([
    getActiveCategories(),
    getBarangays(municipalityId),
  ])

  // Convert reference_links from the service to the form format
  const referenceLinks = (site as unknown as { referenceLinks?: { url: string; label?: string | null }[] }).referenceLinks ?? []

  return (
    <MtoHeritageFormClient
      site={{
        id: site.id,
        siteName: site.siteName,
        alternativeName: site.alternativeName,
        categoryId: site.categoryId,
        municipalityId: site.municipalityId,
        barangay: site.barangay,
        exactAddress: site.exactAddress,
        shortDescription: site.shortDescription,
        detailedDescription: site.detailedDescription,
        historicalPeriod: site.historicalPeriod,
        yearEstablished: site.yearEstablished,
        architectBuilder: site.architectBuilder,
        architecturalStyle: site.architecturalStyle,
        historicalSignificance: site.historicalSignificance,
        culturalSignificance: site.culturalSignificance,
        latitude: site.latitude,
        longitude: site.longitude,
        elevation: site.elevation,
        geoAccuracy: site.geoAccuracy,
        accessibilityInfo: site.accessibilityInfo,
        operatingHours: site.operatingHours,
        entranceFee: site.entranceFee,
        designation: site.designation,
        publicationStatus: site.publicationStatus,
        isFeatured: site.isFeatured,
        visibility: site.visibility,
        createdBy: site.createdBy,
        createdAt: site.createdAt,
        updatedAt: site.updatedAt,
        category: site.category,
        municipalityName: site.municipalityName,
        tags: site.tags,
        media: site.media,
        averageRating: 0,
        reviewCount: 0,
      }}
      categories={categories}
      municipalityId={municipalityId}
      municipalityName={municipality?.name ?? ""}
      barangays={barangays}
      tags={site.tags.map((t) => ({ tag: t.tag }))}
      referenceLinks={referenceLinks}
    />
  )
}

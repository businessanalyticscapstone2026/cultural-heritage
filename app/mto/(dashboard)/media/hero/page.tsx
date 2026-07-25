import HeroImageManager from "@/features/media/components/hero-image-manager"

export default function HeroImagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hero Image</h1>
        <p className="text-sm text-muted-foreground">
          Set the background image displayed on the home page hero section.
        </p>
      </div>
      <HeroImageManager />
    </div>
  )
}

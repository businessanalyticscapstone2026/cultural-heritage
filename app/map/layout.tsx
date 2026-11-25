import PublicNavbar from "@/components/layout/public-navbar"

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <PublicNavbar />
      <main className="relative grid flex-1 min-h-0 overflow-hidden pt-14 max-md:pb-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}

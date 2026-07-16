import PublicNavbar from "@/components/layout/public-navbar"

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <div className="h-screen pt-16 max-md:pb-20">{children}</div>
    </>
  )
}

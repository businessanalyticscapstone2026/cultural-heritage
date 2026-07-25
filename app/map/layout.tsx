import PublicNavbar from "@/components/layout/public-navbar"

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <div className="h-screen pt-14 max-md:pb-20 md:pt-0">{children}</div>
    </>
  )
}

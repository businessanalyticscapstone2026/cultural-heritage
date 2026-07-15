import Header from "@/components/layout/header"
import SiteFooter from "@/components/layout/site-footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">{children}</main>
      <SiteFooter />
    </>
  )
}

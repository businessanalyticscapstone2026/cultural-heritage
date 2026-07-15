import Header from "@/components/layout/header"

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="h-screen pt-[72px]">{children}</div>
    </>
  )
}

import TouristSidebar from "@/components/layout/tourist-sidebar"
import TouristTopbar from "@/components/layout/tourist-topbar"

export default function TouristLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <TouristSidebar />
      <div className="flex flex-1 flex-col">
        <TouristTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

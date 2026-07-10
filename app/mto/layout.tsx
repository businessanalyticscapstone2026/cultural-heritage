import MTOSidebar from "@/components/layout/mto-sidebar"
import MTOTopbar from "@/components/layout/mto-topbar"

export default function MTOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <MTOSidebar />
      <div className="flex flex-1 flex-col">
        <MTOTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

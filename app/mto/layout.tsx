import MTOSidebar from "@/components/layout/mto-sidebar"
import MTOTopbar from "@/components/layout/mto-topbar"
import RoleGuard from "@/components/auth/role-guard"

export default function MTOLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="mto" redirectTo="/admin/dashboard">
      <div className="flex h-screen">
        <MTOSidebar />
        <div className="flex flex-1 flex-col">
          <MTOTopbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}

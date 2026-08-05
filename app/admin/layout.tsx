import AdminSidebar from "@/components/layout/admin-sidebar"
import AdminTopbar from "@/components/layout/admin-topbar"
import RoleGuard from "@/components/auth/role-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="ptcao_admin" redirectTo="/mto/dashboard">
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}

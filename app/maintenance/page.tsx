import { Wrench } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
          <Wrench className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">System Under Maintenance</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The system is currently undergoing scheduled maintenance. Please try again later or contact your administrator.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Tourism Cultural Decision Support System
        </p>
      </div>
    </div>
  )
}

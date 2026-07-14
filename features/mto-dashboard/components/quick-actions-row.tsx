import Link from "next/link"
import { Landmark, Image, Map, FileText, QrCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/lib/constants"

const actions = [
  {
    label: "Add Heritage Site",
    description: "Add a new heritage site record",
    href: ROUTES.MTO.SITES,
    icon: Landmark,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Upload Media",
    description: "Upload images, brochures, documents",
    href: ROUTES.MTO.MEDIA,
    icon: Image,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Open GIS Map",
    description: "Manage heritage locations on map",
    href: ROUTES.MTO.GIS,
    icon: Map,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Generate Report",
    description: "Create tourism reports & analytics",
    href: ROUTES.MTO.REPORTS,
    icon: FileText,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Generate QR Code",
    description: "Create QR code for heritage profile",
    href: ROUTES.MTO.QR_CODES,
    icon: QrCode,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]

export default function QuickActionsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-start gap-3 py-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}>
                <action.icon className={`size-4 ${action.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{action.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

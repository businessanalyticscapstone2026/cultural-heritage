import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import type { UnderPromotedSite } from "../types"

interface UnderPromotedCalloutProps {
  sites: UnderPromotedSite[]
}

export default function UnderPromotedCallout({ sites }: UnderPromotedCalloutProps) {
  if (sites.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800/20 dark:bg-amber-950/10">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500" />
        <CardTitle className="text-base font-semibold">
          Sites Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          These heritage sites have the fewest visits in the selected period.
        </p>
        <ul className="space-y-2">
          {sites.map((site) => (
            <li key={site.siteId} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{site.siteName}</p>
                <p className="text-xs text-muted-foreground">{site.categoryName}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {site.visits.toLocaleString()} visits
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

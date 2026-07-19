"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { getAllDashboardDataAction } from "../actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Pencil, Landmark } from "lucide-react"
import type { RecentSite } from "@/types/mto-dashboard"
import { ROUTES } from "@/lib/constants"

const statusStyles: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
}

const selectData = (data: { recentSites: RecentSite[] }) => data.recentSites

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

export default function RecentSitesTable({ municipalityId }: { municipalityId: string }) {
  const { data: sites, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Heritage Sites</CardTitle>
        <Link href={ROUTES.MTO.SITES} className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isError && (
          <div className="text-sm text-destructive">
            <p>{error instanceof Error ? error.message : "Failed to load"}</p>
            <button type="button" onClick={() => refetch()} className="mt-1 text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        )}
        {isPending && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {sites && sites.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No heritage sites yet</p>
        )}
        {sites && sites.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-3 text-left font-medium text-muted-foreground">Site</th>
                  <th className="pb-2 pr-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="hidden pb-2 pr-3 text-left font-medium text-muted-foreground sm:table-cell">Location</th>
                  <th className="hidden pb-2 pr-3 text-left font-medium text-muted-foreground sm:table-cell">Added</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        {site.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={site.thumbnailUrl}
                            alt={site.siteName}
                            className="size-8 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Landmark className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{site.siteName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      {site.categoryName ? (
                        <Badge variant="secondary" className="text-[10px]">{site.categoryName}</Badge>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="hidden py-2.5 pr-3 text-muted-foreground sm:table-cell">
                      {site.barangay ?? "\u2014"}
                    </td>
                    <td className="hidden py-2.5 pr-3 text-muted-foreground sm:table-cell">
                      {formatRelativeDate(site.createdAt)}
                    </td>
                    <td className="py-2.5">
                      <Badge variant="secondary" className={statusStyles[site.status]}>
                        {site.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`${ROUTES.MTO.SITES}/${site.id}`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`View ${site.siteName}`}
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <Link
                          href={`${ROUTES.MTO.SITES}/${site.id}/edit`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${site.siteName}`}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

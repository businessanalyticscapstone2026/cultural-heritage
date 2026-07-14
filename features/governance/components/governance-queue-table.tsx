"use client"

import { useState, useMemo } from "react"
import { Inbox, Search, ChevronDown, Eye, Clock, CheckCircle, XCircle, Archive } from "lucide-react"
import type { GovernanceReviewWithSite } from "@/types/heritage"

interface GovernanceQueueTableProps {
  reviews: GovernanceReviewWithSite[]
  municipalities: { id: string; name: string }[]
  onViewReview: (review: GovernanceReviewWithSite) => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_CONFIG = {
  submitted: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "Approved", className: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800", icon: XCircle },
  archived: { label: "Archived", className: "bg-gray-100 text-gray-600", icon: Archive },
} as const

export default function GovernanceQueueTable({
  reviews,
  municipalities,
  onViewReview,
}: GovernanceQueueTableProps) {
  const [search, setSearch] = useState("")
  const [filterMunicipality, setFilterMunicipality] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const filtered = useMemo(() => {
    return reviews.filter((review) => {
      if (search && !review.siteName.toLowerCase().includes(search.toLowerCase())) return false
      if (filterMunicipality && review.municipalityName !== municipalities.find((m) => m.id === filterMunicipality)?.name) return false
      if (filterStatus && review.status !== filterStatus) return false
      return true
    })
  }, [reviews, search, filterMunicipality, filterStatus, municipalities])

  const statusCounts = useMemo(() => {
    const counts = { submitted: 0, approved: 0, rejected: 0, archived: 0 }
    reviews.forEach((r) => {
      counts[r.status as keyof typeof counts]++
    })
    return counts
  }, [reviews])

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(
          ([status, config]) => {
            const Icon = config.icon
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  filterStatus === status
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <Icon className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{statusCounts[status]}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </button>
            )
          }
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by site name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-9 pr-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={filterMunicipality}
          onChange={(e) => setFilterMunicipality(e.target.value)}
        >
          <option value="">All Municipalities</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} review{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Inbox className="mb-3 size-10" />
          <p className="text-sm">No reviews found</p>
          <p className="text-xs mt-1">Submissions from municipalities will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Site Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Municipality</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted By</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => {
                const statusConfig = STATUS_CONFIG[review.status as keyof typeof STATUS_CONFIG]
                return (
                  <tr key={review.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{review.siteName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{review.municipalityName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{review.categoryName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{review.submittedByName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>{formatDate(review.submittedAt)}</span>
                        {review.status === "submitted" && review.daysPending > 0 && (
                          <span className="ml-1 text-xs text-yellow-600">
                            ({review.daysPending}d)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReview(review)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="View Details"
                      >
                        <Eye className="size-4" />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useMemo, useCallback, startTransition } from "react"
import Image from "next/image"
import SiteThumbnail from "@/components/ui/site-thumbnail"
import {
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QrCodeIcon,
  ClockIcon,
  SmartphoneIcon,
} from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/confirm-dialog"
import QRCodeDetailPanel from "./qr-code-detail-panel"
import type { QRCodeWithSite, QRKpiCounts, QRScanLogEntry, QRCodeStatus, SiteOption } from "../types"

interface QRCodeListClientProps {
  initialQrCodes: QRCodeWithSite[]
  kpiCounts: QRKpiCounts
  initialScans: QRScanLogEntry[]
  sites?: SiteOption[]
}

const PAGE_SIZE = 10

function getStatusBadge(status: QRCodeStatus) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active</Badge>
    case "inactive":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Inactive</Badge>
    case "revoked":
      return <Badge variant="destructive">Revoked</Badge>
  }
}

export default function QRCodeListClient({
  initialQrCodes,
  kpiCounts: initialKpiCounts,
  initialScans,
}: QRCodeListClientProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeWithSite[]>(initialQrCodes)
  const [kpiCounts, setKpiCounts] = useState(initialKpiCounts)
  const [recentScans] = useState(initialScans)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null)
  const [selectedQrSvg, setSelectedQrSvg] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [regenerateTarget, setRegenerateTarget] = useState<QRCodeWithSite | null>(null)

  const filtered = useMemo(() => {
    return qrCodes.filter((qr) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !qr.siteName.toLowerCase().includes(q) &&
          !qr.codeValue.toLowerCase().includes(q)
        ) return false
      }
      if (statusFilter && qr.status !== statusFilter) return false
      return true
    })
  }, [qrCodes, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Derived so the detail panel always reflects the latest status/code
  const selectedQrCode = useMemo(
    () => qrCodes.find((q) => q.id === selectedQrId) ?? null,
    [qrCodes, selectedQrId],
  )

  // Refresh KPI counts from server row count (approximate)
  const computedKpiCounts = useMemo(() => {
    const total = qrCodes.length
    const active = qrCodes.filter((q) => q.status === "active").length
    const inactive = qrCodes.filter((q) => q.status === "inactive" || q.status === "revoked").length
    return { total, active, inactive, scansThisMonth: kpiCounts.scansThisMonth }
  }, [qrCodes, kpiCounts.scansThisMonth])

  const openDetailPanel = useCallback(async (qrCode: QRCodeWithSite) => {
    setSelectedQrId(qrCode.id)
    setSelectedQrSvg(null)
    setPanelOpen(true)

    try {
      const { generateQrCodePreviewAction } = await import("../actions/qr-management")
      const svgUrl = await generateQrCodePreviewAction(qrCode.codeValue)
      setSelectedQrSvg(svgUrl)
    } catch {
      // QR preview unavailable — fallback to placeholder
    }
  }, [])

  const closeDetailPanel = useCallback(() => {
    setPanelOpen(false)
    setSelectedQrId(null)
    setSelectedQrSvg(null)
  }, [])

  const handleStatusChange = useCallback(async (qrCodeId: string, newStatus: QRCodeStatus) => {
    startTransition(() => {
      setQrCodes((prev) =>
        prev.map((q) =>
          q.id === qrCodeId ? { ...q, status: newStatus } : q,
        ),
      )
    })

    try {
      const { updateQrCodeStatusAction } = await import("../actions/qr-management")
      await updateQrCodeStatusAction(qrCodeId, newStatus)
      notifySuccess(newStatus === "active" ? "QR code reactivated." : "QR code deactivated.")
    } catch (error) {
      try {
        const { getMtoQrCodesAction } = await import("../actions/qr-management")
        const fresh = await getMtoQrCodesAction()
        setQrCodes(fresh)
      } catch {
        // Silent fail — user can refresh
      }
      notifyError(errorReason(error, "Failed to update QR code status. Please try again."))
      throw error
    }
  }, [])

  const handleRegenerate = useCallback(async (qrCode: QRCodeWithSite) => {
    setRegenerateTarget(qrCode)
  }, [])

  const handleRegenerateConfirm = useCallback(async () => {
    if (!regenerateTarget) return
    const qr = regenerateTarget
    try {
      const { regenerateQrCodeAction, generateQrCodePreviewAction } = await import(
        "../actions/qr-management"
      )
      const updatedQrCode = await regenerateQrCodeAction(qr.id)
      setQrCodes((prev) =>
        prev.map((q) => (q.id === updatedQrCode.id ? updatedQrCode : q)),
      )
      setSelectedQrSvg(null)
      const svgUrl = await generateQrCodePreviewAction(updatedQrCode.codeValue)
      setSelectedQrSvg(svgUrl)
      notifySuccess(`QR code for "${qr.siteName}" regenerated.`)
    } catch (error) {
      notifyError(errorReason(error, "Failed to regenerate QR code. Please try again."))
    } finally {
      setRegenerateTarget(null)
    }
  }, [regenerateTarget])

  const handleDeactivate = useCallback(async (qrCode: QRCodeWithSite) => {
    await handleStatusChange(qrCode.id, "inactive")
  }, [handleStatusChange])

  const handleReactivate = useCallback(async (qrCode: QRCodeWithSite) => {
    await handleStatusChange(qrCode.id, "active")
  }, [handleStatusChange])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Dashboard</span>
          <span className="text-muted-foreground">/</span>
          <span>QR Code Management</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total QR Codes</p>
          <p className="mt-1 text-3xl font-bold">{computedKpiCounts.total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{computedKpiCounts.active}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Inactive / Revoked</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{computedKpiCounts.inactive}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scans This Month</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{computedKpiCounts.scansThisMonth}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by site name or code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-9 pr-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="size-4 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      )}

      {/* Main Content: Table + Recent Scans */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* QR Codes Table */}
        <div className="xl:col-span-2">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground">
              <QrCodeIcon className="size-10 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No QR codes found</p>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
                QR codes are automatically generated when new heritage sites are added.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Site Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code Value</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created Date</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">View</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((qr) => (
                    <tr
                      key={qr.id}
                      className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => openDetailPanel(qr)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                      <SiteThumbnail
                        src={qr.siteThumbnail}
                        alt={qr.siteName}
                        className="size-10 rounded-lg"
                      />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{qr.siteName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {qr.codeValue.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(qr.status)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(qr.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetailPanel(qr)
                            }}
                            aria-label={`View QR code details for ${qr.siteName}`}
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {paginated.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
              <p>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to{" "}
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} codes
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                            p === currentPage
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>
                <select
                  className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                >
                  <option value={10}>10/page</option>
                  <option value={20}>20/page</option>
                  <option value={50}>50/page</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Recent QR Code Scans — consumes qr_scan_logs (written by CHTS-028) */}
        <div className="rounded-xl border">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ClockIcon className="size-4 text-muted-foreground" />
              Recent QR Code Scans
            </h3>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {recentScans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <SmartphoneIcon className="size-8 mb-2 text-muted-foreground" />
                <p className="text-xs">No scans recorded yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Scan logging is handled by the tourist app (CHTS-028)
                </p>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div key={scan.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{scan.siteName}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(scan.scannedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {scan.deviceType && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{scan.deviceType}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-in Detail Panel */}
      <QRCodeDetailPanel
        qrCode={selectedQrCode}
        qrSvgUrl={selectedQrSvg}
        open={panelOpen}
        onClose={closeDetailPanel}
        onRegenerate={(qr) => setRegenerateTarget(qr)}
        onStatusChange={handleStatusChange}
      />

      {/* Regenerate Confirmation */}
      <ConfirmDialog
        open={regenerateTarget !== null}
        title="Regenerate QR code?"
        description={
          regenerateTarget ? (
            <>
              A new code will replace the current one for "
              {regenerateTarget.siteName}". The old code will stop working
              immediately.
            </>
          ) : null
        }
        confirmLabel="Regenerate"
        variant="destructive"
        isConfirming={false}
        onConfirm={handleRegenerateConfirm}
        onCancel={() => setRegenerateTarget(null)}
      />
    </div>
  )
}

/* eslint-disable react/no-unescaped-entities */
"use client"

import { useEffect, useCallback, useState } from "react"
import { XIcon, QrCodeIcon, RefreshCwIcon, DownloadIcon, BanIcon, CheckCircleIcon, ExternalLinkIcon, ChevronDownIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { QRCodeWithSite, QRCodeStatus } from "../types"

interface QRCodeDetailPanelProps {
  qrCode: QRCodeWithSite | null
  qrSvgUrl: string | null
  open: boolean
  onClose: () => void
  onRegenerate: (qrCode: QRCodeWithSite) => void
  onStatusChange: (qrCodeId: string, newStatus: QRCodeStatus) => Promise<void>
}

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

export default function QRCodeDetailPanel({
  qrCode,
  qrSvgUrl,
  open,
  onClose,
  onRegenerate,
  onStatusChange,
}: QRCodeDetailPanelProps) {
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  const handleToggleStatus = useCallback(async () => {
    if (!qrCode || togglingStatus) return
    setTogglingStatus(true)
    setToggleError(null)

    const nextStatus: QRCodeStatus =
      qrCode.status === "active" ? "inactive"
      : qrCode.status === "inactive" ? "active"
      : "active"

    try {
      await onStatusChange(qrCode.id, nextStatus)
    } catch {
      setToggleError("Failed to update QR code status. Please try again.")
    } finally {
      setTogglingStatus(false)
      setDeactivateConfirm(false)
    }
  }, [qrCode, togglingStatus, onStatusChange])

  const handleDownload = useCallback(async (format: "png" | "svg") => {
    if (!qrCode || downloading) return
    setDownloading(true)
    try {
      const { generateQrCodeDownloadAction } = await import("../actions/qr-management")
      const { dataUrl, extension } = await generateQrCodeDownloadAction(qrCode.codeValue, format)
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `qr-${qrCode.siteName.replace(/\s+/g, "-").toLowerCase()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error("Failed to generate download. Please try again.")
    } finally {
      setDownloading(false)
    }
  }, [qrCode, downloading])

  const handleViewSite = useCallback(() => {
    if (!qrCode) return
    window.open(`/heritage/${qrCode.siteId}`, "_blank")
  }, [qrCode])

  if (!qrCode) return null

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[480px] max-w-full bg-background shadow-xl border-l transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-base font-semibold">QR Code Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* QR Preview */}
            <div className="flex items-center justify-center p-8 bg-muted/30">
              {qrSvgUrl ? (
                <img
                  src={qrSvgUrl}
                  alt={`QR Code for ${qrCode.siteName}`}
                  className="size-48"
                />
              ) : (
                <div className="size-48 flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30">
                  <QrCodeIcon className="size-12 text-muted-foreground/60" />
                </div>
              )}
            </div>

            {/* Linked Site Info */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                    {qrCode.siteThumbnail ? (
                      <img src={qrCode.siteThumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground/60 text-xs">No img</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{qrCode.siteName}</p>
                    <p className="text-xs text-muted-foreground truncate">ID: {qrCode.codeValue.slice(0, 8)}...</p>
                  </div>
                </div>
                {getStatusBadge(qrCode.status)}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code Value</span>
                  <span className="font-mono text-xs">{qrCode.codeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Scans</span>
                  <span className="font-medium">{qrCode.scanCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-xs">
                    {new Date(qrCode.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {qrCode.creatorName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by</span>
                    <span className="text-xs">{qrCode.creatorName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-5 pb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRegenerate(qrCode)}
                  disabled={qrCode.status === "revoked"}
                >
                  <RefreshCwIcon className="size-3.5 mr-1.5" />
                  Regenerate
                </Button>
                <div className="flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-r-none"
                    onClick={() => handleDownload("png")}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <DownloadIcon className="size-3.5 mr-1.5" />
                    )}
                    Download
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-l-none border-l-0 px-2"
                          aria-label="Download QR code as"
                          disabled={downloading}
                        >
                          <ChevronDownIcon className="size-3.5" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload("png")}>
                        <DownloadIcon className="size-3.5" /> PNG (Recommended)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("svg")}>
                        <DownloadIcon className="size-3.5" /> SVG
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {qrCode.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeactivateConfirm(true)}
                    disabled={togglingStatus}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <BanIcon className="size-3.5 mr-1.5" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={togglingStatus}
                  >
                    <CheckCircleIcon className="size-3.5 mr-1.5" />
                    Reactivate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewSite}
                >
                  <ExternalLinkIcon className="size-3.5 mr-1.5" />
                  View Site
                </Button>
              </div>
              {toggleError && (
                <p className="mt-2 text-xs text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  {toggleError}
                </p>
              )}
            </div>

            {/* Usage Info */}
            <div className="px-5 pb-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Scan Target
              </h4>
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 break-all font-mono">
                /heritage/{qrCode.siteId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={deactivateConfirm}
        title="Deactivate QR code?"
        description={
          qrCode ? (
            <>
              The QR code for "{qrCode.siteName}" will be deactivated. Scanning
              will no longer work until it is reactivated.
            </>
          ) : null
        }
        confirmLabel="Deactivate"
        variant="destructive"
        isConfirming={togglingStatus}
        onConfirm={handleToggleStatus}
        onCancel={() => setDeactivateConfirm(false)}
      />
    </>
  )
}

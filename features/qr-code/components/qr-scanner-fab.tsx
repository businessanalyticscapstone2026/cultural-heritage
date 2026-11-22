"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ScanBarcode } from "lucide-react"
import QRScannerOverlay from "./qr-scanner-overlay"

export default function QRScannerFAB() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Do not display the floating scanner button if the user is already on the dedicated scan page
  if (pathname === "/scan") {
    return null
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
        aria-label="Scan QR code"
      >
        <ScanBarcode className="h-6 w-6" />
      </button>

      {open && <QRScannerOverlay open={open} onClose={() => setOpen(false)} />}
    </>
  )
}

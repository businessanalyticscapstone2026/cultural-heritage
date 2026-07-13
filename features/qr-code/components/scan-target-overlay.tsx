"use client"

import { motion } from "motion/react"

interface ScanTargetOverlayProps {
  isScanning: boolean
}

export function ScanTargetOverlay({ isScanning }: ScanTargetOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="h-64 w-64 rounded-2xl border-2 border-white/60 sm:h-72 sm:w-72">
          <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-2xl border-t-2 border-l-2 border-white" />
          <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-2xl border-t-2 border-r-2 border-white" />
          <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-2 border-l-2 border-white" />
          <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-2 border-r-2 border-white" />

          {isScanning && (
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_rgba(46,91,255,0.6)]"
              animate={{ top: ["8%", "88%", "8%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <p className="mt-4 text-center text-sm font-medium text-white drop-shadow-lg">
          Point your camera at the QR code
        </p>
      </div>
    </div>
  )
}

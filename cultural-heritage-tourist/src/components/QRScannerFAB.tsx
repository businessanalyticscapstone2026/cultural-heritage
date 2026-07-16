import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SCANNER_ID = "qr-scanner-region";

export function QRScannerFAB() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          setOpen(false);

          if (decodedText.startsWith("http")) {
            window.location.href = decodedText;
          } else if (decodedText.startsWith("/")) {
            navigate({ to: decodedText as never });
          } else {
            navigate({ to: "/explore", search: { q: decodedText } });
          }
        },
        () => {},
      )
      .catch(() => {
        setError("Camera access denied or unavailable.");
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current?.clear();
    };
  }, [open, navigate]);

  return (
    <>
      {/* FAB — mobile only */}
      <button
        onClick={() => { setError(null); setOpen(true); }}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
        aria-label="Scan QR code"
      >
        <ScanLine size={24} strokeWidth={1.5} />
      </button>

      {/* Scanner overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
              <p className="text-sm font-medium text-primary-foreground">
                Scan a QR code
              </p>
              <button
                onClick={() => {
                  if (scannerRef.current?.isScanning) {
                    scannerRef.current.stop().catch(() => {});
                  }
                  setOpen(false);
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Camera viewport */}
            <div className="relative flex-1 overflow-hidden">
              <div id={SCANNER_ID} className="h-full w-full" />

              {/* Viewfinder overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-60 w-60">
                  {/* Corner brackets */}
                  <span className="absolute left-0 top-0 h-8 w-8 border-t-2 border-l-2 border-accent rounded-tl-lg" />
                  <span className="absolute right-0 top-0 h-8 w-8 border-t-2 border-r-2 border-accent rounded-tr-lg" />
                  <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent rounded-bl-lg" />
                  <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-accent rounded-br-lg" />

                  {/* Scan line animation */}
                  <motion.span
                    animate={{ y: [0, 230, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-2 right-2 h-0.5 bg-accent/80 shadow-[0_0_12px_rgba(0,210,211,0.6)]"
                  />
                </div>
              </div>

              {error && (
                <div className="absolute inset-x-0 bottom-0 bg-ink/90 px-6 py-4 text-center">
                  <p className="text-sm text-white">{error}</p>
                  <button
                    onClick={() => { setError(null); setOpen(false); }}
                    className="mt-2 text-xs text-accent underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
              <p className="text-xs text-white/60">
                Point your camera at a heritage site QR code to view details
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

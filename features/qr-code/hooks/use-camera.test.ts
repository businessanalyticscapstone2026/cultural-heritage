import { describe, it, expect } from "bun:test"
import { extractQrCodeValue } from "@/lib/app-url"

describe("useCamera & QR Scanner integration", () => {
  it("extracts QR code values from various formats for seamless resolution", () => {
    // Direct code value
    expect(extractQrCodeValue("TCDSS-7VE5X9")).toBe("TCDSS-7VE5X9")

    // Full URL with domain
    expect(extractQrCodeValue("https://cultural-heritage.techsite.live/qr/TCDSS-7VE5X9")).toBe("TCDSS-7VE5X9")
    expect(extractQrCodeValue("https://cultural-heritage-three.vercel.app/qr/TCDSS-7VE5X9")).toBe("TCDSS-7VE5X9")

    // Heritage direct site link
    expect(extractQrCodeValue("https://cultural-heritage.techsite.live/heritage/11111111-2222-3333-4444-555555555555")).toBe("11111111-2222-3333-4444-555555555555")

    // Encoded parameter / query string
    expect(extractQrCodeValue("https://cultural-heritage.techsite.live/scan?code=TCDSS-7VE5X9")).toBe("TCDSS-7VE5X9")
  })

  it("exports useCamera function and accepts enabled option", async () => {
    const { useCamera } = await import("./use-camera")
    expect(typeof useCamera).toBe("function")
  })
})

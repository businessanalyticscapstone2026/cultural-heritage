import { describe, it, expect } from "bun:test"
import { getAppBaseUrl, getQrCodeUrl, extractQrCodeValue } from "./app-url"

describe("app-url", () => {
  it("generates a full QR code URL from a code value", () => {
    const url = getQrCodeUrl("TCDSS-ABC123")
    expect(url).toContain("/qr/TCDSS-ABC123")
  })

  it("extracts code value from full URL", () => {
    expect(extractQrCodeValue("https://cultural-heritage-three.vercel.app/qr/TCDSS-ABC123")).toBe("TCDSS-ABC123")
    expect(extractQrCodeValue("http://localhost:3000/qr/TCDSS-XYZ999")).toBe("TCDSS-XYZ999")
    expect(extractQrCodeValue("/qr/TCDSS-123456")).toBe("TCDSS-123456")
  })

  it("extracts raw code value when not a URL", () => {
    expect(extractQrCodeValue("TCDSS-ABC123")).toBe("TCDSS-ABC123")
    expect(extractQrCodeValue("  TCDSS-TRIMMED  ")).toBe("TCDSS-TRIMMED")
  })
})

import { describe, it, expect } from "bun:test"
import { getAppBaseUrl, getQrCodeUrl, extractQrCodeValue } from "./app-url"

describe("app-url", () => {
  it("defaults to cultural-heritage.techsite.live when no env variable is set", () => {
    const url = getAppBaseUrl()
    expect(url).toBe("https://cultural-heritage.techsite.live")
  })

  it("generates a full QR code URL from a code value", () => {
    const url = getQrCodeUrl("TCDSS-ABC123")
    expect(url).toBe("https://cultural-heritage.techsite.live/qr/TCDSS-ABC123")
  })

  it("extracts code value from full URL across various domains", () => {
    expect(extractQrCodeValue("https://cultural-heritage.techsite.live/qr/TCDSS-7VE5NH")).toBe("TCDSS-7VE5NH")
    expect(extractQrCodeValue("https://cultural-heritage-three.vercel.app/qr/TCDSS-7VE5NH")).toBe("TCDSS-7VE5NH")
    expect(extractQrCodeValue("http://localhost:3000/qr/TCDSS-XYZ999")).toBe("TCDSS-XYZ999")
    expect(extractQrCodeValue("/qr/TCDSS-123456")).toBe("TCDSS-123456")
    expect(extractQrCodeValue("https://cultural-heritage.techsite.live/qr/TCDSS-ABC123/")).toBe("TCDSS-ABC123")
    expect(extractQrCodeValue("https://cultural-heritage.techsite.live/qr/TCDSS-ABC123?utm_source=scan")).toBe("TCDSS-ABC123")
  })

  it("extracts and normalizes raw code values", () => {
    expect(extractQrCodeValue("TCDSS-ABC123")).toBe("TCDSS-ABC123")
    expect(extractQrCodeValue("tcdss-7ve5nh")).toBe("TCDSS-7VE5NH")
    expect(extractQrCodeValue("  tcdss-trimmed  ")).toBe("TCDSS-TRIMMED")
  })

  it("extracts heritage site UUID when direct site URL is provided", () => {
    const uuid = "833188bf-e4aa-42b2-a482-ef6e551d1838"
    expect(extractQrCodeValue(`https://cultural-heritage.techsite.live/heritage/${uuid}`)).toBe(uuid)
    expect(extractQrCodeValue(`/heritage/${uuid}`)).toBe(uuid)
  })
})

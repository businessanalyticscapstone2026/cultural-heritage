const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "br",
  "p",
  "div",
  "a",
])

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"]

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, "\u00A0")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\u00A0/g, " ")
}

function sanitizeAttributes(tag: string, attrs: string): string {
  const hrefMatch = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs)
  if (!hrefMatch) return tag

  const href = hrefMatch[1] ?? hrefMatch[2] ?? ""
  const url = decodeEntities(href).replace(/\u00A0/g, " ").trim()

  const protocol = /^[a-z][a-z0-9+.-]*:/i.exec(url)
  if (protocol && !SAFE_PROTOCOLS.includes(protocol[0].toLowerCase())) return tag

  if (/^\s*javascript:/i.test(url)) return tag

  return `${tag} href="${escapeText(url)}" rel="noopener noreferrer" target="_blank"`
}

export function sanitizeHtml(input: string): string {
  const source = input ?? ""

  const strippedDangerousBlocks = source.replace(
    /<(script|style|iframe|object|embed|form)\b[\s\S]*?<\/\1\s*>/gi,
    "",
  )

  return strippedDangerousBlocks.replace(
    /<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi,
    (full, tagName: string, attrs: string) => {
      const tag = tagName.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return ""

      const isClosing = full.charAt(1) === "/"
      const selfClosing = /\/\s*$/.test(full)

      if (isClosing) {
        return `</${tag}>`
      }

      const sanitizedAttrs = tag === "a" ? sanitizeAttributes(tag, attrs) : tag
      if (selfClosing) return `<${sanitizedAttrs} />`
      return `<${sanitizedAttrs}>`
    },
  )
}
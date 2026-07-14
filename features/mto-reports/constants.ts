import type { ReportTypeDefinition } from "./types"

export const REPORT_TYPES: ReportTypeDefinition[] = [
  {
    id: "tourism_trend",
    title: "Tourism Trend Report",
    description: "Visitor trends over time, visits by attraction, and visitor type breakdown",
    icon: "TrendingUp",
    sections: [
      { id: "summary-metrics", label: "Summary Metrics" },
      { id: "visitor-trend", label: "Visitor Trend" },
      { id: "visits-by-attraction", label: "Visits by Attraction" },
      { id: "demographics", label: "Demographics" },
    ],
  },
  {
    id: "heritage_inventory",
    title: "Heritage Inventory Report",
    description: "Complete list of heritage sites with category, status, and key details",
    icon: "Landmark",
    sections: [
      { id: "inventory-summary", label: "Inventory Summary" },
      { id: "inventory-table", label: "Heritage Sites Table" },
    ],
  },
  {
    id: "visitor_statistics",
    title: "Visitor Statistics Report",
    description: "Total visitors, local/domestic/international split, top-visited sites",
    icon: "BarChart3",
    sections: [
      { id: "visitor-summary", label: "Visitor Summary" },
      { id: "visitor-types", label: "Visitor Type Breakdown" },
      { id: "top-sites", label: "Top Visited Sites" },
    ],
  },
  {
    id: "recommendation_qr",
    title: "Recommendation & QR Activity Report",
    description: "Recommendation performance funnel and QR scan activity summary",
    icon: "QrCode",
    sections: [
      { id: "rec-funnel", label: "Recommendation Funnel" },
      { id: "qr-activity", label: "QR Scan Activity" },
      { id: "site-performance", label: "Site Performance" },
    ],
  },
]

export const REPORT_TYPE_MAP = Object.fromEntries(
  REPORT_TYPES.map((r) => [r.id, r]),
) as Record<string, ReportTypeDefinition>

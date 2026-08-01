import type { Metadata } from "next"
import { Playfair_Display, Inter, Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/auth-context"
import { RoleProvider } from "@/context/role-context"
import { QueryProvider } from "@/components/providers/query-provider"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
})

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Batangas Heritage | Cultural Heritage Decision Support System",
  description:
    "Discover the First District of Batangas — explore cultural heritage sites, interactive GIS maps, and personalized recommendations.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", playfairDisplay.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <RoleProvider>
            <QueryProvider>{children}</QueryProvider>
          </RoleProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}

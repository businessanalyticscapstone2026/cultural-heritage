import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/auth-context"
import { RoleProvider } from "@/context/role-context"
import { QueryProvider } from "@/components/providers/query-provider"
import { MotionProvider } from "@/components/providers/motion-provider"

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
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
      className={cn("h-full", "antialiased", playfairDisplay.variable, inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <RoleProvider>
            <QueryProvider>
              <MotionProvider>{children}</MotionProvider>
            </QueryProvider>
          </RoleProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}

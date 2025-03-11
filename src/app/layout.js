import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { QueryProvider } from "@/context/query-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for water supply management",
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}


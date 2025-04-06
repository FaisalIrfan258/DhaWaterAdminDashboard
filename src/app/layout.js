import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'
import { UserProvider } from '../context/UserContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Water Management System",
  description: "IoT-based water management system",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <UserProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
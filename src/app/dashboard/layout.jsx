import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import DashboardSidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}) {
  // Check for auth token on the server
  const cookieStore = cookies()
  const hasToken = cookieStore.has("access_token")

  if (!hasToken) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}


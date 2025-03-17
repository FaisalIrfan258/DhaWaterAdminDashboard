import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import TopBar from "@/components/dashboard/top-bar"

export default function DashboardLayout({ children }) {
  // Check for authentication on the server
  const cookieStore = cookies()
  const token = cookieStore.get("access_token")

  if (!token) {
    redirect("/login")
  }

  // Get sidebar state from cookies
  const sidebarState = cookieStore.get("sidebar:state")
  const defaultOpen = sidebarState?.value === "true" || true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <TopBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}


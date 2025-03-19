import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import TopBar from "@/components/dashboard/top-bar"

export default async function DashboardLayout({ children }) {
  // Check for authentication on the server
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")

  if (!token) {
    redirect("/login")
  }

  // Get sidebar state from cookies
  const sidebarState = cookieStore.get("sidebar:state")
  const defaultOpen = sidebarState?.value === "true" || true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen">
        <DashboardSidebar className="w-64" />
        <div className="flex flex-col flex-1">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}


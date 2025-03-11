"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Droplet, CheckSquare, Truck, Users, ShieldCheck, LogOut } from "lucide-react"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path) => pathname === path

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Droplet className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="font-semibold">Water Admin</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/water-supply")}>
              <Link href="/dashboard/water-supply">
                <Droplet className="h-4 w-4" />
                <span>Water Supply Request</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/confirm-booking")}>
              <Link href="/dashboard/confirm-booking">
                <CheckSquare className="h-4 w-4" />
                <span>Confirm Booking</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/tanker-management")}>
              <Link href="/dashboard/tanker-management">
                <Truck className="h-4 w-4" />
                <span>Tanker Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/users")}>
              <Link href="/dashboard/users">
                <Users className="h-4 w-4" />
                <span>Users Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {user?.isSuper && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/admins")}>
                <Link href="/dashboard/admins">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}


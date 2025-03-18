"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Droplet, Calendar, Truck, Users, Shield, LogOut, Cpu } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Cookies from "js-cookie"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  // Initialize with null to prevent hydration mismatch
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // Move the cookie check to useEffect to ensure it only runs client-side
    const userType = Cookies.get("user_type")
    setUser({ isSuper: userType === "superAdmin" })
  }, [])

  const handleLogout = () => {
    Cookies.remove("admin_token", { path: '/' })
    Cookies.remove("user_type", { path: '/' })
    router.push("/login")
  }

  // Define base nav items
  const baseNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Water Supply Request",
      icon: Droplet,
      href: "/dashboard/requests",
    },
    {
      title: "Confirm Booking",
      icon: Calendar,
      href: "/dashboard/bookings",
    },
    {
      title: "Tanker Management",
      icon: Truck,
      href: "/dashboard/tankers",
    },
    {
      title: "IOT Devices",
      icon: Cpu,
      href: "/dashboard/devices",
    },
    {
      title: "Users Management",
      icon: Users,
      href: "/dashboard/users",
    },
  ]

  // Only render the component once user state is initialized
  if (user === null) {
    return null // or a loading spinner
  }

  const navItems = user.isSuper 
    ? [...baseNavItems, {
        title: "Admin Management",
        icon: Shield,
        href: "/dashboard/admins",
      }]
    : baseNavItems

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <div className="font-semibold">Admin Dashboard</div>
        </div>
        <div className="md:hidden px-2">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}


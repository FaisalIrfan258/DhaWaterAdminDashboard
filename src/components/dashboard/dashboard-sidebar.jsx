"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Droplet, Calendar, Truck, Users, Shield, LogOut, Cpu, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
    Cookies.remove("admin_token", { path: "/" })
    Cookies.remove("user_type", { path: "/" })
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
    // {
    //   title: "Confirm Booking",
    //   icon: Calendar,
    //   href: "/dashboard/bookings",
    // },
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
    ? [
        ...baseNavItems,
        {
          title: "Admin Management",
          icon: Shield,
          href: "/dashboard/admins",
        },
      ]
    : baseNavItems

  return (
    <Sidebar className="text-white border-r-0 bg-gradient-to-b from-[#004D77] to-[#43A2B3]">
      <SidebarHeader className="bg-[#004D77] border-b-0 p-0">
        <div className="flex items-center h-16 px-6">
          <div className="text-2xl font-bold">
            <Image src="/assets/water.png" alt="logo" width={48} height={48} className="rounded-full" />
          </div>
          <div className="md:hidden ml-auto">
            <SidebarTrigger className="text-white hover:text-white hover:bg-transparent" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-2 md:space-y-4">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="text-white hover:bg-[#43A2B3] rounded-md p-2 transition-colors duration-200 data-[active=true]:bg-[#43A2B3]"
              >
                <Link href={item.href}>
                  <item.icon size={20} />
                  <span className="text-sm md:text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t-0">
        <SidebarMenu className="space-y-2 md:space-y-4">
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center space-x-2 text-white hover:bg-[#43A2B3] rounded-md p-2 transition-colors duration-200">
              <Settings size={20} />
              <span className="text-sm md:text-base">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center space-x-2 text-white hover:bg-[#43A2B3] rounded-md p-2 transition-colors duration-200"
            >
              <LogOut size={20} />
              <span className="text-sm md:text-base">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}


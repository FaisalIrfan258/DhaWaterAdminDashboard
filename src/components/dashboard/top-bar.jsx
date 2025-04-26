"use client"

import { useEffect, useState } from "react"
import { Bell, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import Link from "next/link"

export default function TopBar() {
  const router = useRouter()
  const [user, setUser] = useState({ fullname: "", email: "", isSuper: false })

  useEffect(() => {
    // Get admin_id from cookies
    const fullname = Cookies.get("admin_name") || ""
    const email = Cookies.get("admin_email") || ""
    const isSuper = Cookies.get("is_super") === "true"

    setUser({ fullname, email, isSuper })
  }, [])

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "is_super=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"

    // Redirect to login page
    router.push("/login")
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">HydraTrack  Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.fullname?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullname}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.isSuper ? "Super Admin" : "Admin"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

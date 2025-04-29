"use client"

import { useEffect, useState } from "react"
import { Bell, User, Mail, Shield, FileText } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import Link from "next/link"

export default function TopBar() {
  const router = useRouter()
  const [user, setUser] = useState({ 
    fullname: "", 
    email: "", 
    isSuper: false,
    id: "",
    userType: ""
  })
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    // Get user data from cookies
    const id = Cookies.get("admin_id") || ""
    const fullname = Cookies.get("admin_name") || ""
    const email = Cookies.get("admin_email") || ""
    const isSuper = Cookies.get("is_super") === "true"
    const userType = Cookies.get("user_type") || ""

    setUser({ id, fullname, email, isSuper, userType })
  }, [])

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "is_super=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"

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

          <Link href="/dashboard/system-logs">
            <Button variant="ghost" size="icon" className="relative">
              <FileText className="h-5 w-5" />
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
              <DropdownMenuItem onClick={() => setShowProfileModal(true)}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Your account information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center pb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{user.fullname?.charAt(0) || <User className="h-8 w-8" />}</AvatarFallback>
              </Avatar>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.fullname}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user.isSuper ? "Super Admin" : "Admin"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                  ID
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admin ID</p>
                  <p className="font-medium">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

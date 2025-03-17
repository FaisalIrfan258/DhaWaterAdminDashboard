"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminList() {
  const [user, setUser] = useState({ isSuper: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Redirect if not a super admin (this would be better handled in middleware)
      if (!parsedUser.isSuper) {
        window.location.href = "/dashboard"
      }
    }
    setIsLoading(false)
  }, [])

  // Sample data - in a real app, you would fetch this from your API
  const admins = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
      createdAt: "2023-10-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Admin",
      status: "Active",
      createdAt: "2023-10-20",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert@example.com",
      role: "Admin",
      status: "Inactive",
      createdAt: "2023-11-05",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "Admin",
      status: "Active",
      createdAt: "2023-11-10",
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user.isSuper) {
    return <div>You do not have permission to view this page.</div>
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4 font-medium">{admin.name}</td>
                <td className="p-4">{admin.email}</td>
                <td className="p-4">{admin.role}</td>
                <td className="p-4">
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      admin.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.status}
                  </div>
                </td>
                <td className="p-4">{admin.createdAt}</td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


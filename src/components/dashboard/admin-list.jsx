"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Edit, Trash, Shield, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'

export default function AdminList({ admins, onEdit, onDelete }) {
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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  if (admins.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No administrators found. Add your first administrator to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User Type</TableHead>
              {user.isSuper && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.admin_id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{admin.admin_id}</TableCell>
                <TableCell>{admin.full_name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={admin.UserType?.description === "Super Admin" || admin.is_super ? "default" : "outline"}
                    className="flex w-fit items-center gap-1"
                  >
                    {admin.UserType?.description === "Super Admin" || admin.is_super ? 
                      <Shield className="h-3 w-3" /> : 
                      <User className="h-3 w-3" />
                    }
                    {admin.UserType?.description || (admin.is_super ? "Super Admin" : "Admin")}
                  </Badge>
                </TableCell>
                {user.isSuper && (
                  <TableCell className="text-right">
                    <Button onClick={() => onEdit(admin)} variant="ghost" size="sm" className="h-8 w-8 p-0 mr-1">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      onClick={() => onDelete(admin.admin_id)} 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


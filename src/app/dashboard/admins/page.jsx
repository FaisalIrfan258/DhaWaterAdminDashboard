"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react"

// Mock admin data - would be fetched from API in real app
const mockAdmins = [
  { id: 1, fullname: "John Admin", email: "john@example.com", createdAt: "2023-01-15" },
  { id: 2, fullname: "Sarah Manager", email: "sarah@example.com", createdAt: "2023-02-20" },
  { id: 3, fullname: "Mike Supervisor", email: "mike@example.com", createdAt: "2023-03-10" },
]

export default function AdminManagementPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    fullname: "",
    email: "",
    password: "",
  })

  const isSuperAdmin = user?.isSuper === true

  // Fetch admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      // In a real app, fetch from API
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admins`)
      // return res.json()

      // Using mock data for demo
      return new Promise((resolve) => setTimeout(() => resolve(mockAdmins), 500))
    },
    enabled: isSuperAdmin,
  })

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (adminData) => {
      // In a real app, post to API
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admins`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(adminData),
      // })
      // return res.json()

      // Mock success for demo
      return new Promise((resolve) =>
        setTimeout(
          () => resolve({ id: Date.now(), ...adminData, createdAt: new Date().toISOString().split("T")[0] }),
          500,
        ),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      setOpen(false)
      setNewAdmin({ fullname: "", email: "", password: "" })
      toast.success("Admin created", {
        description: "New admin account has been created successfully",
      })
    },
    onError: () => {
      toast.error("Failed to create admin", {
        description: "There was an error creating the admin account",
      })
    },
  })

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId) => {
      // In a real app, delete via API
      // await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admins/${adminId}`, {
      //   method: "DELETE",
      // })

      // Mock success for demo
      return new Promise((resolve) => setTimeout(() => resolve({}), 500))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      toast.success("Admin deleted", {
        description: "Admin account has been deleted successfully",
      })
    },
    onError: () => {
      toast.error("Failed to delete admin", {
        description: "There was an error deleting the admin account",
      })
    },
  })

  const handleCreateAdmin = (e) => {
    e.preventDefault()
    createAdminMutation.mutate(newAdmin)
  }

  const handleDeleteAdmin = (adminId) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      deleteAdminMutation.mutate(adminId)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You need Super Admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new admin user to the system. They will receive login credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={newAdmin.fullname}
                    onChange={(e) => setNewAdmin({ ...newAdmin, fullname: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createAdminMutation.isPending}>
                  {createAdminMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.fullname}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.createdAt}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      disabled={deleteAdminMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}


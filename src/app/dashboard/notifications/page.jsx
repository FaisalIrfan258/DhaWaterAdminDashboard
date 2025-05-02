"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bell, Search, RefreshCw, X, Plus, Pencil, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Cookies from "js-cookie"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function NotificationsPage() {
  const [adminId, setAdminId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editMessage, setEditMessage] = useState("")
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedNotifications, setPaginatedNotifications] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    // Access the admin_id cookie on the client side
    const id = Cookies.get("admin_id")
    setAdminId(id)
    fetchNotifications()
  }, [])

  // Apply pagination whenever notifications or pagination settings change
  useEffect(() => {
    paginateNotifications()
  }, [filteredNotifications, currentPage, itemsPerPage])

  // Paginate notifications function
  const paginateNotifications = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem)
    
    setPaginatedNotifications(currentNotifications)
    setTotalPages(Math.ceil(filteredNotifications.length / itemsPerPage))
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/notification/all-notifications`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data || [])
      setFilteredNotifications(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications. Please try again.")
      toast.error("Failed to load notifications", {
        description: "Please refresh the page to try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch single notification
  const fetchSingleNotification = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/notification/single-notification/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notification details")
      }

      const data = await response.json()
      setSelectedNotification(data)
      setIsViewDialogOpen(true)
    } catch (err) {
      console.error("Error fetching notification details:", err)
      toast.error("Failed to load notification details")
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredNotifications(notifications)
      return
    }

    const filtered = notifications.filter(
      (notification) =>
        notification.title?.toLowerCase().includes(query) ||
        notification.message?.toLowerCase().includes(query) ||
        notification.notification_id?.toString().includes(query) ||
        notification.Admin?.full_name?.toLowerCase().includes(query) ||
        notification.Admin?.email?.toLowerCase().includes(query),
    )

    setFilteredNotifications(filtered)
  }

  // Sort notifications in descending order by date
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Update filtered notifications to use sorted notifications
  useEffect(() => {
    setFilteredNotifications(sortedNotifications)
  }, [notifications])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchNotifications()
      toast.success("Notifications refreshed successfully")
    } catch (error) {
      console.error("Error refreshing notifications:", error)
      toast.error("Failed to refresh notifications")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle delete notification
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return

    try {
      const response = await fetch(
        `${baseUrl}/api/notification/delete-notification/${selectedNotification.notification_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) throw new Error("Failed to delete notification")

      setIsDeleteDialogOpen(false)
      toast.success("Notification deleted successfully")
      await fetchNotifications() // Refresh the list
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
  }

  // Handle update notification
  const handleUpdateNotification = async () => {
    if (!selectedNotification || !editTitle.trim() || !editMessage.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `${baseUrl}/api/notification/update-notification/${selectedNotification.notification_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            message: editMessage,
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to update notification")

      toast.success("Notification updated successfully")
      setIsEditDialogOpen(false)
      await fetchNotifications() // Refresh the list
    } catch (error) {
      console.error("Error updating notification:", error)
      toast.error("Failed to update notification")
    } finally {
      setLoading(false)
    }
  }

  // Handle send to all
  const handleSendToAll = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim() || !adminId) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/notification/create-notification-for-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          admin_id: Number.parseInt(adminId),
        }),
      })

      if (!response.ok) throw new Error("Failed to send notification")

      toast.success("Notification sent to all customers successfully")
      setNotificationTitle("")
      setNotificationMessage("")
      setCustomerId("")
      setIsCreateDialogOpen(false)
      await fetchNotifications()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Failed to send notification")
    } finally {
      setLoading(false)
    }
  }

  // Handle send to specific customer
  const handleSendToCustomer = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim() || !customerId.trim() || !adminId) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/notification/create-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          admin_id: Number.parseInt(adminId),
          customer_id: Number.parseInt(customerId),
        }),
      })

      if (!response.ok) throw new Error("Failed to send notification")

      toast.success("Notification sent to customer successfully")
      setNotificationTitle("")
      setNotificationMessage("")
      setCustomerId("")
      setIsCreateDialogOpen(false)
      await fetchNotifications()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Failed to send notification")
    } finally {
      setLoading(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (notification) => {
    setSelectedNotification(notification)
    setEditTitle(notification.title)
    setEditMessage(notification.message)
    setIsEditDialogOpen(true)
  }

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="Manage and send notifications to customers">
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Notification</DialogTitle>
                <DialogDescription>Send a notification to all customers or a specific customer.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Notification message"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer-id">Customer ID (Optional)</Label>
                  <Input
                    id="customer-id"
                    placeholder="Leave empty to send to all customers"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a customer ID to send to a specific customer, or leave empty to send to all.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleSendToAll} disabled={loading || !notificationTitle || !notificationMessage}>
                    Send to All
                  </Button>
                  <Button
                    onClick={handleSendToCustomer}
                    disabled={loading || !notificationTitle || !notificationMessage || !customerId}
                  >
                    Send to Customer
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 w-full">
        <Card className="max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Customer Notifications
            </CardTitle>
            <CardDescription>View and manage notifications sent to customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredNotifications.length}{" "}
                  {filteredNotifications.length === 1 ? "notification" : "notifications"}
                </div>
              )}
            </div>

            {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "No notifications found matching your search" : "No notifications found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedNotifications.map((notification) => (
                        <TableRow key={notification.notification_id}>
                          <TableCell className="font-medium">#{notification.notification_id}</TableCell>
                          <TableCell>{notification.title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{notification.message}</TableCell>
                          <TableCell>{formatDate(notification.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{notification.Admin?.full_name}</span>
                              <span className="text-xs text-muted-foreground">{notification.Admin?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost">...</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => fetchSingleNotification(notification.notification_id)}>
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(notification)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedNotification(notification)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
                    </p>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">per page</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Notification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>View the details of this notification.</DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">ID:</span>
                <span className="col-span-3">#{selectedNotification.notification_id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Title:</span>
                <span className="col-span-3">{selectedNotification.title}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium col-span-1">Message:</span>
                <span className="col-span-3">{selectedNotification.message}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Date:</span>
                <span className="col-span-3">{formatDate(selectedNotification.created_at)}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium col-span-1">Admin:</span>
                <div className="col-span-3">
                  <div className="font-medium">{selectedNotification.Admin?.full_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedNotification.Admin?.email}</div>
                </div>
              </div>
              {selectedNotification.customer_id && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium col-span-1">Customer:</span>
                  <span className="col-span-3">ID: {selectedNotification.customer_id}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>Update the title and message of this notification.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Notification title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                placeholder="Notification message"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNotification} disabled={loading || !editTitle || !editMessage}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notification. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotification}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}

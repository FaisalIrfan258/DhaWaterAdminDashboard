"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  useNotifications,
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, RefreshCw, X, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import {
  DataTable,
  commonActions,
  badgeVariants,
} from "@/components/common/data-table";
import { toast } from "sonner";
import { usePagination } from "@/hooks";
import { Pagination } from "@/components/common/pagination";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function NotificationsPage() {
  const { user } = useUser();
  const [adminId, setAdminId] = useState(null);

  // React Query hooks
  const {
    data: notifications = [],
    isLoading: loading,
    error,
    refetch,
  } = useNotifications();
  const createNotificationMutation = useCreateNotification();
  const updateNotificationMutation = useUpdateNotification();
  const deleteNotificationMutation = useDeleteNotification();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  // Get admin_id from UserContext
  useEffect(() => {
    if (user?.id) {
      setAdminId(user.id);
    }
  }, [user]);

  // Sort notifications in descending order by date
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [notifications]);

  // Search functionality
  const {
    searchQuery,
    filteredData: filteredNotificationsList,
    handleSearch,
    clearSearch,
  } = useSearch(sortedNotifications, ["title", "message"], {
    resetPageOnSearch: true,
    onPageReset: () => handlePageChange(1),
  });

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedNotifications,
    itemsPerPage,
    goToNextPage,
    goToPreviousPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(filteredNotificationsList, 10);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle view notification
  const handleViewNotification = useCallback((notification) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
  }, []);

  // Handle refresh
  const handleRefreshData = async () => {
    try {
      await refetch();
      toast.success("Notifications refreshed successfully");
    } catch (error) {
      console.error("Error refreshing notifications:", error);
      toast.error("Failed to refresh notifications");
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      await deleteNotificationMutation.mutateAsync(
        selectedNotification.notification_id
      );
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle update notification
  const handleUpdateNotification = async () => {
    if (!selectedNotification || !editTitle.trim() || !editMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await updateNotificationMutation.mutateAsync({
        id: selectedNotification.notification_id,
        data: {
          title: editTitle,
          message: editMessage,
        },
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  // Handle send to all
  const handleSendToAll = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim() || !adminId) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createNotificationMutation.mutateAsync({
        title: notificationTitle,
        message: notificationMessage,
        admin_id: Number.parseInt(adminId),
      });
      setNotificationTitle("");
      setNotificationMessage("");
      setCustomerId("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Handle send to specific customer
  const handleSendToCustomer = async () => {
    if (
      !notificationTitle.trim() ||
      !notificationMessage.trim() ||
      !customerId.trim() ||
      !adminId
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createNotificationMutation.mutateAsync({
        title: notificationTitle,
        message: notificationMessage,
        admin_id: Number.parseInt(adminId),
        customer_id: Number.parseInt(customerId),
      });
      setNotificationTitle("");
      setNotificationMessage("");
      setCustomerId("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (notification) => {
    setSelectedNotification(notification);
    setEditTitle(notification.title);
    setEditMessage(notification.message);
    setIsEditDialogOpen(true);
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Notifications"
        text="Manage and send notifications to customers"
      >
        <div className="flex items-center gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to all customers or a specific customer.
                </DialogDescription>
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
                    Enter a customer ID to send to a specific customer, or leave
                    empty to send to all.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendToAll}
                    disabled={
                      loading || !notificationTitle || !notificationMessage
                    }
                  >
                    Send to All
                  </Button>
                  <Button
                    onClick={handleSendToCustomer}
                    disabled={
                      loading ||
                      !notificationTitle ||
                      !notificationMessage ||
                      !customerId
                    }
                  >
                    Send to Customer
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
            <CardDescription>
              View and manage notifications sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <SearchInput
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64"
              />

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredNotificationsList.length}{" "}
                  {filteredNotificationsList.length === 1
                    ? "notification"
                    : "notifications"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <DataTable
                  data={paginatedNotifications}
                  columns={[
                    {
                      key: "notification_id",
                      header: "ID",
                      accessor: "notification_id",
                      cellClassName: "font-medium",
                      render: (value) => `#${value}`,
                    },
                    {
                      key: "title",
                      header: "Title",
                      accessor: "title",
                    },
                    {
                      key: "message",
                      header: "Message",
                      accessor: "message",
                      cellClassName: "max-w-[200px] truncate",
                    },
                    {
                      key: "created_at",
                      header: "Date",
                      render: (_, notification) =>
                        formatDate(notification.created_at),
                    },
                    {
                      key: "admin",
                      header: "Admin",
                      render: (_, notification) => (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {notification.Admin?.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {notification.Admin?.email}
                          </span>
                        </div>
                      ),
                    },
                  ]}
                  actions={[
                    commonActions.view((notification) =>
                      handleViewNotification(notification)
                    ),
                    commonActions.edit((notification) =>
                      openEditDialog(notification)
                    ),
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: (notification) => {
                        setSelectedNotification(notification);
                        setIsDeleteDialogOpen(true);
                      },
                      variant: "destructive",
                    },
                  ]}
                  isLoading={loading}
                  emptyMessage="No notifications found"
                  searchQuery={searchQuery}
                  searchEmptyMessage="No notifications found matching your search"
                  className="w-full mt-4"
                />

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredNotificationsList.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  className="mt-6"
                />
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
            <DialogDescription>
              View the details of this notification.
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">ID:</span>
                <span className="col-span-3">
                  #{selectedNotification.notification_id}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Title:</span>
                <span className="col-span-3">{selectedNotification.title}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium col-span-1">Message:</span>
                <span className="col-span-3">
                  {selectedNotification.message}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Date:</span>
                <span className="col-span-3">
                  {formatDate(selectedNotification.created_at)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium col-span-1">Admin:</span>
                <div className="col-span-3">
                  <div className="font-medium">
                    {selectedNotification.Admin?.full_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedNotification.Admin?.email}
                  </div>
                </div>
              </div>
              {selectedNotification.customer_id && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium col-span-1">
                    Customer:
                  </span>
                  <span className="col-span-3">
                    ID: {selectedNotification.customer_id}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
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
            <DialogDescription>
              Update the title and message of this notification.
            </DialogDescription>
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotification}
              disabled={loading || !editTitle || !editMessage}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notification. This action cannot
              be undone.
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
  );
}

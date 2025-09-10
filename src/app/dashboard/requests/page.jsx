"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Droplets, RefreshCw } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/usePagination";

import { toast } from "sonner";
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
import AcceptRequestModal from "@/components/modals/booking/accept-request-modal";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useRequests, useAcceptRequest, useRejectRequest, useCreateNotification } from "@/hooks";

export default function RequestsPage() {
  const { user } = useUser();
  const [adminId, setAdminId] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [rejectReason, setRejectReason] = useState("hydrant closed");
  const [notificationTitle, setNotificationTitle] = useState("");



  useEffect(() => {
    // Get admin_id from UserContext
    if (user?.id) {
      setAdminId(user.id);
    }
  }, [user]);

  // React Query hooks
  const { data: requests = [], isLoading: loading, error, refetch } = useRequests();
  const acceptRequestMutation = useAcceptRequest();
  const rejectRequestMutation = useRejectRequest();
  const createNotificationMutation = useCreateNotification();

  // Search functionality
  const {
    searchQuery,
    filteredData: searchFilteredRequests,
    handleSearch,
    clearSearch
  } = useSearch(requests, ['Customer.full_name', 'request_id', 'request_status', 'description']);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = [...searchFilteredRequests];
    
    // Sort by request date (newest first)
    filtered.sort((a, b) => new Date(b.request_date) - new Date(a.request_date));
    
    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(request => request.request_status === statusFilter);
    }
    
    return filtered;
  }, [searchFilteredRequests, statusFilter]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedRequests,
    itemsPerPage,
    goToNextPage,
    goToPreviousPage,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredRequests, 10);







  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Requests refreshed successfully");
    } catch (error) {
      console.error("Error refreshing requests:", error);
      toast.error("Failed to refresh requests");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle accept request
  const handleAccept = async (requestId) => {
    try {
      await acceptRequestMutation.mutateAsync({
        request_id: requestId,
        admin_id: adminId,
        customer_id: selectedCustomerId,
      });
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // Handle reject request
  const handleReject = async () => {
    try {
      if (!selectedRequestId || !selectedCustomerId) return;

      // Reject the request
      await rejectRequestMutation.mutateAsync(selectedRequestId);

      // Send notification with customer_id included
      await createNotificationMutation.mutateAsync({
        title: notificationTitle,
        message: rejectReason,
        admin_id: adminId,
        customer_id: selectedCustomerId,
      });

      setRejectDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleAcceptClick = useCallback((requestId, customerId) => {
    setSelectedRequestId(requestId);
    setSelectedCustomerId(customerId);
    setIsModalOpen(true);
  }, []);



  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: "warning",
      "in progress": "default",
      accepted: "success",
      rejected: "destructive",
    };
    return variants[status?.toLowerCase()] || "secondary";
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
        heading="Water Supply Requests"
        text="Manage water supply requests from customers"
      >
        <div className="flex items-center gap-2">
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 w-full">
        <Card className="max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="mr-2 h-5 w-5" />
              Water Supply Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <SearchInput
                placeholder="Search requests..."
                value={searchQuery}
                onChange={handleSearch}
              />

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredRequests.length}{" "}
                  {filteredRequests.length === 1 ? "request" : "requests"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {error?.message || "Failed to load requests. Please try again."}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Request Date</TableHead>
                      
                      {/* <TableHead>Payment Mode</TableHead> */}
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No requests found matching your search"
                            : "No requests found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((request) => (
                        <TableRow key={request.request_id}>
                          <TableCell className="font-medium">
                            #{request.request_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {request.Customer.full_name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ID: {request.Customer.customer_id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(request.request_date)}
                          </TableCell>
                          
                          {/* <TableCell>
                            {request.description.replace('Payment Mode:', '').trim()}
                          </TableCell> */}
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(
                                request.request_status
                              )}
                            >
                              {request.request_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleAcceptClick(
                                    request.request_id,
                                    request.Customer.customer_id
                                  )
                                }
                                disabled={
                                  request.request_status.toLowerCase() !==
                                  "in progress"
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequestId(request.request_id);
                                  setSelectedCustomerId(
                                    request.Customer.customer_id
                                  );
                                  setRejectDialogOpen(true);
                                }}
                                disabled={
                                  request.request_status.toLowerCase() !==
                                  "in progress"
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredRequests.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reject the water supply request. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mb-4">
            <label
              htmlFor="reject-reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reject Reason
            </label>
            <Select
              value={rejectReason}
              onValueChange={setRejectReason}
              className="mt-1 w-full"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hydrant closed">Hydrant Closed</SelectItem>
                <SelectItem value="no water available">
                  No Water Available
                </SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                {/* Add more reasons as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="notification-title"
              className="block text-sm font-medium text-gray-700"
            >
              Notification Title
            </label>
            <Input
              id="notification-title"
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="mt-1"
              placeholder="Enter notification title"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept Request Modal */}
      <AcceptRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestId={selectedRequestId}
        customerId={selectedCustomerId}
        adminId={adminId}
      />
    </DashboardShell>
  );
}

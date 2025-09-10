"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DataTable,
  commonActions,
  badgeVariants,
} from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, RefreshCw, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import {
  useComplaints,
  useUpdateComplaintRemarks,
  usePagination,
} from "@/hooks";
import { Pagination } from "@/components/common/pagination";

export default function ComplaintsPage() {
  const { user } = useUser();
  const {
    data: complaints = [],
    isLoading: loading,
    error,
    refetch,
  } = useComplaints();
  const updateComplaintMutation = useUpdateComplaintRemarks();

  const [statusFilter, setStatusFilter] = useState("All");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState("");
  // Search functionality
  const {
    searchQuery,
    filteredData: searchFilteredComplaints,
    handleSearch,
    clearSearch,
  } = useSearch(
    complaints,
    [
      "complain_id",
      "Customer.full_name",
      "Customer.phone_number",
      "complain_description",
    ],
    {
      resetPageOnSearch: true,
      onPageReset: () => handlePageChange(1),
    }
  );

  // Filter and sort complaints using useMemo
  const filteredComplaints = useMemo(() => {
    let filtered = searchFilteredComplaints;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (complaint) => complaint.status === statusFilter
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.complain_date) - new Date(a.complain_date)
    );
  }, [searchFilteredComplaints, statusFilter]);

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedComplaints,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(filteredComplaints, 10);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing complaints:", error);
    }
  };

  // Handle update complaint
  const handleUpdateComplaint = async () => {
    try {
      if (!selectedComplaint || !user?.id) return;

      await updateComplaintMutation.mutateAsync({
        complaintId: selectedComplaint.complain_id,
        remarksData: {
          remarks: remarks,
          adminId: user.id,
        },
      });

      setIsUpdateDialogOpen(false);
      await refetch(); // Refresh the list
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  const handleViewDetails = useCallback((complaint) => {
    setSelectedComplaint(complaint);
    setRemarks(complaint.remarks || "");
    setIsUpdateDialogOpen(true);
  }, []);

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    return status?.toLowerCase() === "resolved" ? "success" : "destructive";
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Customer Complaints"
        text="Manage customer complaints and resolve issues"
      >
        <div className="flex items-center gap-2">
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
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
              <MessageSquare className="mr-2 h-5 w-5" />
              Customer Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <SearchInput
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64"
              />

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredComplaints.length}{" "}
                  {filteredComplaints.length === 1 ? "complaint" : "complaints"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {error?.message ||
                  "Failed to load complaints. Please try again."}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <DataTable
                  data={paginatedComplaints}
                  columns={[
                    {
                      key: "complain_id",
                      header: "Complaint ID",
                      accessor: "complain_id",
                      cellClassName: "font-medium",
                      render: (value) => `#${value}`,
                    },
                    {
                      key: "customer",
                      header: "Customer",
                      render: (_, complaint) => (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {complaint.Customer.full_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {complaint.Customer.phone_number}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: "complain_date",
                      header: "Date",
                      render: (_, complaint) =>
                        formatDate(complaint.complain_date),
                    },
                    {
                      key: "complain_description",
                      header: "Description",
                      accessor: "complain_description",
                      cellClassName: "max-w-[200px] truncate",
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (_, complaint) => (
                        <Badge
                          variant={getStatusBadgeVariant(complaint.status)}
                        >
                          {complaint.status}
                        </Badge>
                      ),
                    },
                  ]}
                  actions={[
                    {
                      label: (complaint) =>
                        complaint.status === "Resolved"
                          ? "View Details"
                          : "Resolve",
                      variant: "outline",
                      onClick: (complaint) => handleViewDetails(complaint),
                    },
                  ]}
                  isLoading={loading}
                  emptyMessage="No complaints found"
                  searchQuery={searchQuery}
                  searchEmptyMessage="No complaints found matching your search"
                  className="w-full"
                />

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredComplaints.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  className="mt-6"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Complaint Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedComplaint?.status === "Resolved"
                ? "Complaint Details"
                : "Resolve Complaint"}
            </DialogTitle>
            <DialogDescription>
              {selectedComplaint?.status === "Resolved"
                ? "View the details of this complaint."
                : "Add remarks to resolve this customer complaint."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium col-span-1">ID:</span>
              <span className="col-span-3">
                #{selectedComplaint?.complain_id}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Customer:</span>
              <span className="col-span-3">
                {selectedComplaint?.Customer?.full_name}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Phone:</span>
              <span className="col-span-3">
                {selectedComplaint?.Customer?.phone_number}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Date:</span>
              <span className="col-span-3">
                {selectedComplaint &&
                  formatDate(selectedComplaint.complain_date)}
              </span>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-sm font-medium col-span-1">
                Description:
              </span>
              <span className="col-span-3">
                {selectedComplaint?.complain_description}
              </span>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-sm font-medium col-span-1">Remarks:</span>
              {selectedComplaint?.status === "Resolved" ? (
                <span className="col-span-3">
                  {selectedComplaint?.remarks || "No remarks added"}
                </span>
              ) : (
                <Textarea
                  className="col-span-3"
                  placeholder="Enter remarks to resolve this complaint"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              {selectedComplaint?.status === "Resolved" ? "Close" : "Cancel"}
            </Button>
            {selectedComplaint?.status !== "Resolved" && (
              <Button
                onClick={handleUpdateComplaint}
                disabled={!remarks.trim()}
              >
                Resolve Complaint
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

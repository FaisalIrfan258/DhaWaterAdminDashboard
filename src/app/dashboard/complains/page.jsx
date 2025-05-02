"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import Cookies from "js-cookie";

export default function ComplaintsPage() {
  useUser();
  const [adminId, setAdminId] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedComplaints, setPaginatedComplaints] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    // Access the admin_id cookie on the client side
    const id = Cookies.get("admin_id");
    setAdminId(id);
  }, []);

  // Apply pagination whenever complaints or pagination settings change
  useEffect(() => {
    paginateComplaints();
  }, [filteredComplaints, currentPage, itemsPerPage]);

  // Paginate complaints function
  const paginateComplaints = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentComplaints = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
    
    setPaginatedComplaints(currentComplaints);
    setTotalPages(Math.ceil(filteredComplaints.length / itemsPerPage));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Fetch all complaints
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/complain/all-complains`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(data || []);
      setFilteredComplaints(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints. Please try again.");
      toast.error("Failed to load complaints", {
        description: "Please refresh the page to try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredComplaints(complaints);
      return;
    }

    const filtered = complaints.filter(
      (complaint) =>
        complaint.Customer?.full_name?.toLowerCase().includes(query) ||
        complaint.complain_id?.toString().includes(query) ||
        complaint.status?.toLowerCase().includes(query) ||
        complaint.complain_description?.toLowerCase().includes(query)
    );

    setFilteredComplaints(filtered);
  };

  // Sort complaints in descending order by date
  const sortedComplaints = [...complaints].sort(
    (a, b) => new Date(b.complain_date) - new Date(a.complain_date)
  );

  // Update filtered complaints to use sorted complaints
  useEffect(() => {
    setFilteredComplaints(sortedComplaints);
  }, [complaints]);

  // Update filtered complaints based on status filter
  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredComplaints(sortedComplaints);
    } else {
      const status = statusFilter === "Pending" ? "Pending" : "Resolved";
      setFilteredComplaints(
        sortedComplaints.filter((complaint) => complaint.status === status)
      );
    }
  }, [statusFilter, complaints]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchComplaints();
      toast.success("Complaints refreshed successfully");
    } catch (error) {
      console.error("Error refreshing complaints:", error);
      toast.error("Failed to refresh complaints");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle update complaint
  const handleUpdateComplaint = async () => {
    try {
      if (!selectedComplaint || !adminId) return;

      const response = await fetch(
        `${baseUrl}/api/complain/update-complain-remarks/${selectedComplaint.complain_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            remarks: remarks,
            admin_id: adminId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update complaint");

      const data = await response.json();

      setIsUpdateDialogOpen(false);
      toast.success("Complaint updated successfully");
      await fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint");
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setRemarks(complaint.remarks || "");
    setIsUpdateDialogOpen(true);
  };

  useEffect(() => {
    fetchComplaints();
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
              <MessageSquare className="mr-2 h-5 w-5" />
              Customer Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search complaints..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredComplaints.length}{" "}
                  {filteredComplaints.length === 1 ? "complaint" : "complaints"}
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
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Complaint ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No complaints found matching your search"
                            : "No complaints found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedComplaints.map((complaint) => (
                        <TableRow key={complaint.complain_id}>
                          <TableCell className="font-medium">
                            #{complaint.complain_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {complaint.Customer.full_name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {complaint.Customer.phone_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(complaint.complain_date)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {complaint.complain_description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(complaint.status)}
                            >
                              {complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(complaint)}
                            >
                              {complaint.status === "Resolved"
                                ? "View Details"
                                : "Resolve"}
                            </Button>
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
                      Showing {paginatedComplaints.length} of {filteredComplaints.length} complaints
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

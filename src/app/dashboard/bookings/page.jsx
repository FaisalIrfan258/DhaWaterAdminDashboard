"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { useBookings, useUpdateBooking, useDeleteBooking } from "@/hooks";
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
import { Calendar, Search, RefreshCw, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BookingViewModal from "@/components/BookingViewModal";
import BookingEditModal from "@/components/BookingEditModal";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext"

export default function BookingsPage() {
  const { user } = useUser();
  
  // React Query hooks
  const { data: bookingsData = [], isLoading, error, refetch } = useBookings();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSuper, setIsSuper] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  


  // Check if user is super admin
  useEffect(() => {
    if (user?.user_type) {
      setIsSuper(user.user_type === "superAdmin");
    }
  }, [user]);

  // Sort bookings by scheduled date (newest first)
  const sortedBookings = useMemo(() => {
    return [...bookingsData].sort(
      (a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date)
    );
  }, [bookingsData]);

  // Filter bookings based on search query and status
  const filteredBookings = useMemo(() => {
    let filtered = sortedBookings;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.status.toLowerCase().includes(query) ||
          booking.scheduled_date.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [sortedBookings, searchQuery, statusFilter]);

  const totalPages = useMemo(() => Math.ceil(filteredBookings.length / itemsPerPage), [filteredBookings, itemsPerPage]);

  const paginatedBookings = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredBookings, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Bookings refreshed successfully");
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      toast.error("Failed to refresh bookings");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  }, []);

  const handleEditBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteBooking = useCallback((booking) => {
    // Check if user is a super admin before allowing delete
    if (!isSuper) {
      toast.error("You don't have permission to delete bookings");
      return;
    }
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  }, [isSuper]);

  const confirmDeleteBooking = async () => {
    if (!selectedBooking) return;

    // Double check super admin status before proceeding
    if (user?.user_type !== "superAdmin") {
      toast.error("You don't have permission to delete bookings");
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      await deleteBookingMutation.mutateAsync(selectedBooking.booking_id);
    } catch (error) {
      console.error("Error deleting booking:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  // Data is automatically fetched by React Query
  // Filtering is handled by useMemo

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Bookings"
        text="Manage your bookings for customers"
      >
        <div className="flex items-center gap-2">
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Confirmed Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bookings..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center gap-2"></div>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              <div className="flex items-center justify-between">
                <span>Error loading bookings: {error.message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div className="relative w-full overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead> ID </TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Tanker Name</TableHead>
                      <TableHead>Admin Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No bookings found matching your search"
                            : "No bookings found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBookings.map((booking) => (
                        <TableRow key={booking.booking_id}>
                          <TableCell>{booking.booking_id}</TableCell>
                          <TableCell>{booking.Customer.full_name}</TableCell>
                          <TableCell>{booking.Tanker.tanker_name}</TableCell>
                          <TableCell>{booking.Admin.full_name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "Pending"
                                  ? "default"
                                  : "success"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(booking.scheduled_date).toLocaleString()}
                          </TableCell>

                          <TableCell>
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" modal={false}>
                                <DropdownMenuItem
                                  onClick={() => handleViewBooking(booking)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                {isSuper && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleEditBooking(booking)}
                                    >
                                      Edit Booking
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteBooking(booking)}
                                      className="text-destructive"
                                    >
                                      Delete Booking
                                    </DropdownMenuItem>
                                  </>
                                )}
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
                      Showing {paginatedBookings.length} of {filteredBookings.length} bookings
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
          </div>
        </CardContent>
      </Card>

      <BookingViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={selectedBooking}
      />

      <BookingEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        booking={selectedBooking}
        onRefresh={refetch}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this booking?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBooking}
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

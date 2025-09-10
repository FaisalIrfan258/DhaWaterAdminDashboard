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
  DataTable,
  commonActions,
  badgeVariants,
} from "@/components/common/data-table";

import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Users,
  Plus,
  Search,
} from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import { toast } from "sonner";
import BookingViewModal from "@/components/modals/booking/BookingViewModal";
import BookingEditModal from "@/components/modals/booking/BookingEditModal";
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
import { useUser } from "@/context/UserContext";

export default function BookingsPage() {
  const { user } = useUser();

  // React Query hooks
  const { data: bookingsData = [], isLoading, error, refetch } = useBookings();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSuper, setIsSuper] = useState(false);
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

  // Filter bookings by status first
  const statusFilteredBookings = useMemo(() => {
    if (statusFilter === "All") {
      return sortedBookings;
    }
    return sortedBookings.filter((booking) => booking.status === statusFilter);
  }, [sortedBookings, statusFilter]);

  // Search functionality
  const {
    searchQuery,
    filteredData: filteredBookings,
    handleSearch,
    clearSearch,
  } = useSearch(statusFilteredBookings, [
    "status",
    "scheduled_date",
    "Customer.full_name",
    "Tanker.tanker_name",
    "Admin.full_name",
  ]);

  // Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData: paginatedBookings,
    goToNextPage,
    goToPreviousPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(filteredBookings, 10);

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

  const handleDeleteBooking = useCallback(
    (booking) => {
      // Check if user is a super admin before allowing delete
      if (!isSuper) {
        toast.error("You don't have permission to delete bookings");
        return;
      }
      setSelectedBooking(booking);
      setIsDeleteDialogOpen(true);
    },
    [isSuper]
  );

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
            <SearchInput
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-64"
            />
            <div className="flex items-center gap-2"></div>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              <div className="flex items-center justify-between">
                <span>Error loading bookings: {error.message}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
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
                <DataTable
                  data={paginatedBookings}
                  columns={[
                    {
                      key: "booking_id",
                      header: "ID",
                      accessor: "booking_id",
                    },
                    {
                      key: "customer_name",
                      header: "Customer Name",
                      render: (_, booking) => booking.Customer.full_name,
                    },
                    {
                      key: "tanker_name",
                      header: "Tanker Name",
                      render: (_, booking) => booking.Tanker.tanker_name,
                    },
                    {
                      key: "admin_name",
                      header: "Admin Name",
                      render: (_, booking) => booking.Admin.full_name,
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (_, booking) => (
                        <Badge
                          variant={
                            booking.status === "Pending" ? "default" : "success"
                          }
                        >
                          {booking.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "scheduled_date",
                      header: "Scheduled Date",
                      render: (_, booking) =>
                        new Date(booking.scheduled_date).toLocaleString(),
                    },
                  ]}
                  actions={[
                    commonActions.view(
                      (booking) => handleViewBooking(booking),
                      "View Details"
                    ),
                    ...(isSuper
                      ? [
                          commonActions.edit(
                            (booking) => handleEditBooking(booking),
                            "Edit Booking"
                          ),
                          {
                            label: "Delete Booking",
                            icon: Trash2,
                            onClick: (booking) => handleDeleteBooking(booking),
                            variant: "destructive",
                          },
                        ]
                      : []),
                  ]}
                  isLoading={isLoading}
                  emptyMessage="No bookings found"
                  searchQuery={searchQuery}
                  searchEmptyMessage="No bookings found matching your search"
                  className="w-full"
                />

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredBookings.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
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

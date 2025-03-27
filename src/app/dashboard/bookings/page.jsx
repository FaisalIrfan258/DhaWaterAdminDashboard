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
import { Calendar, Search, RefreshCw, MoreHorizontal } from "lucide-react";
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/bookings/all-bookings`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data);
      setFilteredBookings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter(
      (booking) =>
        booking.status.toLowerCase().includes(query) ||
        booking.scheduled_date.toLowerCase().includes(query)
    );

    setFilteredBookings(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    toast.success("Bookings refreshed successfully");
    setIsRefreshing(false);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/bookings/delete-booking/${selectedBooking.booking_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete booking");
      toast.success("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Bookings"
        text="Manage your bookings for customers"
      >
        <div className="flex items-center gap-2">
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
          <CardDescription>View and manage your bookings.</CardDescription>
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
              {error}
            </div>
          )}

          <div className="relative w-full overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
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
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchQuery
                          ? "No bookings found matching your search"
                          : "No bookings found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewBooking(booking)}
                              >
                                View Details
                              </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
        onRefresh={fetchBookings}
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

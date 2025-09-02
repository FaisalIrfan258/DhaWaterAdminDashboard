"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, RefreshCw, Users, Clock, Truck } from "lucide-react";
import { useBookings, useAdmins, useTankers } from "@/hooks";
import { toast } from "sonner";

export default function ShiftAssignmentsPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedShift, setSelectedShift] = useState("All");
  const [selectedAdmin, setSelectedAdmin] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  const { data: bookingsData = [], isLoading: isBookingsLoading, refetch: refetchBookings } = useBookings();
  const { data: adminsData, isLoading: isAdminsLoading } = useAdmins();
  const { data: tankersData, isLoading: isTankersLoading } = useTankers();

  const admins = adminsData?.admins || [];
  const tankers = tankersData || [];

  // Define shift time ranges
  const shifts = [
    { id: "morning", name: "Morning Shift", start: "07:00", end: "15:00" },
    { id: "evening", name: "Evening Shift", start: "15:00", end: "23:00" },
  ];

  // Helper function to determine shift based on time
  const getShiftFromTime = (dateTime) => {
    const hour = new Date(dateTime).getHours();
    if (hour >= 7 && hour < 15) return "morning";
    if (hour >= 15 && hour < 23) return "evening";
    return "morning"; // Default to morning for hours outside range
  };

  // Filter bookings by date and shift
  const filteredBookings = useMemo(() => {
    let filtered = bookingsData.filter((booking) => {
      const bookingDate = new Date(booking.scheduled_date).toISOString().split("T")[0];
      return bookingDate === selectedDate;
    });

    // Filter by shift
    if (selectedShift !== "All") {
      filtered = filtered.filter((booking) => {
        const shift = getShiftFromTime(booking.scheduled_date);
        return shift === selectedShift;
      });
    }

    // Filter by admin
    if (selectedAdmin !== "All") {
      filtered = filtered.filter((booking) => {
        return booking.Admin?.admin_id?.toString() === selectedAdmin;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((booking) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          booking.Customer?.full_name?.toLowerCase().includes(searchLower) ||
          booking.Tanker?.tanker_name?.toLowerCase().includes(searchLower) ||
          booking.Admin?.full_name?.toLowerCase().includes(searchLower) ||
          booking.booking_id?.toString().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [bookingsData, selectedDate, selectedShift, selectedAdmin, searchQuery]);

  // Group bookings by shift for summary
  const shiftSummary = useMemo(() => {
    const summary = {};
    
    shifts.forEach((shift) => {
      const shiftBookings = filteredBookings.filter((booking) => {
        const bookingShift = getShiftFromTime(booking.scheduled_date);
        return bookingShift === shift.id;
      });

      // Group by admin
      const adminAssignments = {};
      shiftBookings.forEach((booking) => {
        const adminId = booking.Admin?.admin_id;
        const adminName = booking.Admin?.full_name || "Unassigned";
        
        if (!adminAssignments[adminId]) {
          adminAssignments[adminId] = {
            adminName,
            bookings: [],
          };
        }
        
        adminAssignments[adminId].bookings.push(booking);
      });

      summary[shift.id] = {
        ...shift,
        totalBookings: shiftBookings.length,
        adminAssignments: Object.values(adminAssignments),
      };
    });

    return summary;
  }, [filteredBookings, shifts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBookings();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Shift-Based Tanker Assignments"
        text="Track and manage tanker assignments by admin users across different shifts"
      >
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </DashboardHeader>

      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full max-w-[200px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Shifts</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name} ({shift.start} - {shift.end})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin">Admin</Label>
                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Admins</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.admin_id} value={admin.admin_id.toString()}>
                        {admin.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(shiftSummary).map((shift) => (
            <Card key={shift.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {shift.name}
                  </div>
                  <Badge variant="outline">
                    {shift.start} - {shift.end}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Bookings</span>
                    <Badge variant="secondary">{shift.totalBookings}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Assigned Admins</span>
                    <Badge variant="outline">{shift.adminAssignments.length}</Badge>
                  </div>
                  
                  {shift.adminAssignments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium">Admin Assignments:</h4>
                      {shift.adminAssignments.map((assignment, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <div className="font-medium">{assignment.adminName}</div>
                          <div className="text-muted-foreground">
                            {assignment.bookings.length} bookings
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Detailed Assignments
            </CardTitle>
            <CardDescription>
              Showing {filteredBookings.length} assignments for {selectedDate}
              {selectedShift !== "All" && ` - ${shifts.find(s => s.id === selectedShift)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isBookingsLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading assignments...</div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assignments found for the selected criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Tanker</TableHead>
                      <TableHead>Assigned Admin</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const shift = getShiftFromTime(booking.scheduled_date);
                      const shiftInfo = shifts.find(s => s.id === shift);
                      
                      return (
                        <TableRow key={booking.booking_id}>
                          <TableCell className="font-medium">
                            #{booking.booking_id}
                          </TableCell>
                          <TableCell>
                            {formatTime(booking.scheduled_date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {shiftInfo?.name || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.Customer?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {booking.Tanker?.tanker_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {booking.Admin?.full_name || "Unassigned"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {booking.status || "Unknown"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
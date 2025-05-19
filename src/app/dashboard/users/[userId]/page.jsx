"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Improved WaterTank component with better visualization
const WaterTank = ({ waterLevel }) => {
  // Ensure water level is between 0 and 100
  const level = Math.max(0, Math.min(100, waterLevel));
  
  // Map water level to a color gradient
  const getWaterColor = (level) => {
    if (level < 20) return "bg-red-500"; // Critical
    if (level < 40) return "bg-orange-500"; // Low
    if (level < 60) return "bg-yellow-500"; // Medium
    return "bg-emerald-500"; // Good
  };

  const waterColor = getWaterColor(level);
  const fillHeight = `${level}%`;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-48 h-64 bg-gray-200 rounded-md relative overflow-hidden border-2 border-gray-300">
        <div
          className={`absolute bottom-0 left-0 right-0 ${waterColor} transition-all duration-500`}
          style={{ height: fillHeight }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white drop-shadow-md">{level}%</span>
        </div>
        
        {/* Water tank level indicators */}
        <div className="absolute top-1/4 right-0 w-2 h-1 bg-gray-400"></div>
        <div className="absolute top-1/2 right-0 w-2 h-1 bg-gray-400"></div>
        <div className="absolute top-3/4 right-0 w-2 h-1 bg-gray-400"></div>
      </div>
      <div className="mt-4 text-center">
        <Badge className={`${level < 20 ? 'bg-red-500' : level < 40 ? 'bg-orange-500' : level < 60 ? 'bg-yellow-500' : 'bg-emerald-500'} text-white py-1 px-3 text-sm font-medium`}>
          {level < 20 ? 'Critical' : level < 40 ? 'Low' : level < 60 ? 'Medium' : 'Good'}
        </Badge>
      </div>
    </div>
  );
};

// Loading skeleton for the user details page
const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <Skeleton className="h-12 w-1/3 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterLevel, setWaterLevel] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [tankStatus, setTankStatus] = useState([]);

  // Date state as Date objects
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/customer/customer-profile?customer_id=${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUser(data);

        // Check if WaterTanks exist and if WaterTankStatuses has data
        if (data?.WaterTanks && data.WaterTanks.length > 0) {
          // Handle case where WaterTankStatuses might be empty
          if (data.WaterTanks[0].WaterTankStatuses && 
              data.WaterTanks[0].WaterTankStatuses.length > 0) {
            setWaterLevel(
              data.WaterTanks[0].WaterTankStatuses[0].water_level || 0
            );
          } else {
            // Set default value if no statuses
            setWaterLevel(0);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentBookings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/my-bookings/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      }
    };

    fetchUserDetails();
    fetchRecentBookings();
  }, [userId]);

  const fetchHourlyTankStatus = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Format dates for API
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tankStatus/hourly-tank-status?customer_id=${userId}&start_date=${formattedStartDate}&end_date=${formattedEndDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch tank status");
      const data = await response.json();
      setTankStatus(data);
    } catch (error) {
      console.error("Error fetching tank status:", error);
      toast.error("Failed to load tank status");
    }
  };

  // Call fetchHourlyTankStatus when userId changes and dates are set
  useEffect(() => {
    if (userId && startDate && endDate) {
      fetchHourlyTankStatus();
    }
  }, [userId, startDate, endDate]);

  if (loading) return <LoadingSkeleton />;
  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-500">User Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">The requested user information could not be found.</p>
        </CardContent>
      </Card>
    </div>
  );

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          User Details
        </h1>
        <p className="text-slate-500 text-center mb-8">
          Manage user information and monitor tank status
        </p>

        {/* User Info + Water Tank Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-md h-full overflow-hidden border-0">
              <CardHeader className="bg-slate-50 border-b pb-3">
                <CardTitle className="text-slate-800 flex items-center">
                  <span className="inline-block w-2 h-6 bg-blue-500 mr-3 rounded"></span>
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Full Name</p>
                      <p className="font-medium text-slate-800">{user.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-800">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-800">{user.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Username</p>
                      <p className="font-medium text-slate-800">{user.username}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium text-slate-800">
                        {user.street_address}{" "}
                        {user.Phase?.phase_name 
                          ? `Phase ${user.Phase.phase_name}` 
                          : user.phase_number 
                          ? `Phase ${user.phase_number}` 
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Balance</p>
                      <p className="font-medium text-slate-800">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {user.balance?.toLocaleString() || 0}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">User Type</p>
                      <p className="font-medium text-slate-800">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {user.UserType?.description || "Unknown"}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tank Capacity</p>
                      <p className="font-medium text-slate-800">
                        {user.WaterTanks?.[0]?.capacity?.toLocaleString() || "N/A"} Gallons
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Account Created</p>
                      <p className="font-medium text-slate-800">
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Water Tank */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-md h-full border-0">
              <CardHeader className="bg-slate-50 border-b pb-3">
                <CardTitle className="text-slate-800 flex items-center">
                  <span className="inline-block w-2 h-6 bg-blue-500 mr-3 rounded"></span>
                  Water Tank Status
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-6">
                <div className="mb-4">
                  <p className="text-sm text-slate-500 text-center">Sensor</p>
                  <p className="font-medium text-slate-800 text-center">
                    {user.WaterTanks && user.WaterTanks.length > 0
                      ? user.WaterTanks[0].Sensor?.sensor_name || `Sensor ID: ${user.WaterTanks[0].sensor_id}`
                      : "No sensor assigned"}
                  </p>
                </div>
                <WaterTank waterLevel={waterLevel} />
                {user.WaterTanks && user.WaterTanks.length > 0 && 
                 user.WaterTanks[0].WaterTankStatuses && 
                 user.WaterTanks[0].WaterTankStatuses.length === 0 && (
                  <div className="mt-4 text-center text-amber-600">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      No recent tank status readings available
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Date Selection and Tank Status */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-slate-50 border-b pb-3">
              <CardTitle className="text-slate-800 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-500 mr-3 rounded"></span>
                Tank Status Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="start-date" className="text-sm text-slate-500">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                        id="start-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="end-date" className="text-sm text-slate-500">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                        id="end-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={fetchHourlyTankStatus}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
              
              {/* Hourly Tank Status Table */}
              {tankStatus.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {startDate && endDate 
                    ? "No data available for the selected date range" 
                    : "Select date range to view tank status"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Average Level (Gallons)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Daily Consumption (Gallons)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tankStatus.map((status, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(status.status_date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className="bg-blue-100 text-blue-800 border-0">
                              {status.avg_level_gallons.toFixed(2)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className="bg-emerald-100 text-emerald-800 border-0">
                              {status.daily_consumption_gallons.toFixed(2)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-slate-50 border-b pb-3">
              <CardTitle className="text-slate-800 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-500 mr-3 rounded"></span>
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No recent bookings found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Booking Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Scheduled Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Requested Gallons
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bookings.map((booking, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                            {booking.booking_code}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                            {new Date(booking.scheduled_date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={`${getStatusBadgeColor(booking.status)} text-white`}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                            {booking.Request?.requested_liters || "N/A"} Gallons
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserDetailsPage;

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Use useParams instead of useRouter for dynamic routes
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Assuming you have these components
import { Badge } from "@/components/ui/badge"; // Assuming this component is also available
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have this for loading states

// WaterTank component to display water level
const WaterTank = ({ waterLevel }) => {
  return (
    <div className="w-48 h-48 bg-blue-200 rounded-full flex justify-center items-center">
      <div
        className="w-40 h-40 rounded-full bg-blue-500 flex justify-center items-center text-white text-xl"
        style={{ transform: `scale(${waterLevel / 100})` }}
      >
        {waterLevel}%
      </div>
    </div>
  );
};

const UserDetailsPage = () => {
  const { userId } = useParams(); // Get the userId from the route params
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterLevel, setWaterLevel] = useState(0); // State for water level
  const [bookings, setBookings] = useState([]); // State for recent bookings

  useEffect(() => {
    if (!userId) return; // Exit early if userId is not available

    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/customer/customer-profile?customer_id=${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUser(data); // Set the entire user object

        // Assuming user.WaterTanks[0] exists and has a water level value
        if (data?.WaterTanks && data.WaterTanks.length > 0) {
          setWaterLevel(
            data.WaterTanks[0].WaterTankStatuses[0].water_level || 0
          ); // Default to 0 if undefined
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
        setBookings(data); // Set bookings data
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      }
    };

    fetchUserDetails();
    fetchRecentBookings();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <motion.h1
        className="text-3xl font-bold text-indigo-800 text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        User Details and Tank Status
      </motion.h1>

      {/* User Info + Water Tank Side by Side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* User Info */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
            <CardHeader>
              <CardTitle className="text-indigo-700">
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Full Name:</strong> {user.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone_number}
                </p>
                <p>
                  <strong>Address:</strong> {user.home_address}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Balance:</strong> ${user.balance}
                </p>
                <p>
                  <strong>Account Created:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Water Tank */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
            <CardHeader>
              <CardTitle className="text-indigo-700">
                Current Water Level
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              <WaterTank waterLevel={waterLevel} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tank Level Details + Recent Bookings Side by Side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tank Level Details */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
            <CardHeader>
              <CardTitle className="text-indigo-700">
                Tank Level Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-12" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-indigo-100">
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.WaterTanks.map((tank, index) => (
                        <tr key={index} className="border-b border-indigo-200">
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                tank.water_level > 50 ? "success" : "warning"
                              }
                            >
                              {(tank.water_level || 0).toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-indigo-800">
                            {new Date(
                              tank.WaterTankStatuses[0].status_date
                            ).toLocaleDateString()}
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
          className="flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
            <CardHeader>
              <CardTitle className="text-indigo-700">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div>No recent bookings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-indigo-100">
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">
                          Booking Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">
                          Scheduled Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">
                          Requested Liters
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr key={index} className="border-b border-indigo-200">
                          <td className="px-4 py-3">{booking.booking_code}</td>
                          <td className="px-4 py-3">
                            {new Date(
                              booking.scheduled_date
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{booking.status}</td>
                          <td className="px-4 py-3">
                            {booking.Request?.requested_liters || "N/A"} liters
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
      </div>
    </div>
  );
};

export default UserDetailsPage;

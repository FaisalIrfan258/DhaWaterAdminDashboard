"use client"

import { Droplet, Truck, Calendar, Users } from "lucide-react";
import { useTotalTankers, useTotalPendingRequests, useTotalUsers, usePendingBookings } from "@/hooks";

export default function DashboardStats() {
  // Use React Query hooks for data fetching
  const { data: tankersData, isLoading: tankersLoading } = useTotalTankers();
  const { data: requestsData, isLoading: requestsLoading } = useTotalPendingRequests();
  const { data: usersData, isLoading: usersLoading } = useTotalUsers();
  const { data: pendingBookings, isLoading: bookingsLoading } = usePendingBookings();

  // Extract values from API responses
  const totalTankers = tankersData?.total_tankers;
  const totalPendingRequests = requestsData?.total_pending_requests;
  const totalUsers = usersData?.total_users;
  const pendingDeliveries = pendingBookings?.length || 0;

  // Check if any data is still loading
  const isLoading = tankersLoading || requestsLoading || usersLoading || bookingsLoading;

  // Prepare the stats array based on fetched data
  const stats = [
    {
      title: "Total Pending Water Requests",
      value: totalPendingRequests !== undefined ? totalPendingRequests : "--", // Placeholder for pending requests
      loading: requestsLoading,
      changeType: "positive", // Placeholder for change type
      icon: Droplet,
    },
    {
      title: "Active Tankers",
      value: totalTankers !== undefined ? totalTankers : "--", // Placeholder for active tankers
      loading: tankersLoading,
      changeType: "positive", // Placeholder for change type
      icon: Truck,
    },
    {
      title: "Total Users",
      value: totalUsers !== undefined ? totalUsers : "--", // Placeholder for total users
      loading: usersLoading,
      changeType: "positive", // Placeholder for change type
      icon: Users,
    },
    {
      title: "Pending Deliveries", // New card for pending deliveries
      value: pendingDeliveries !== undefined ? pendingDeliveries : "--", // Placeholder for pending deliveries
      loading: bookingsLoading,
      changeType: "positive", // Placeholder for change type
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
            <div className="rounded-full bg-primary/10 p-2">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className={`text-sm ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


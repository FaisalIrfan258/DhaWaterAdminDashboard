"use client"

import { useEffect, useState } from "react";
import { Droplet, Truck, Calendar, Users } from "lucide-react";
import { toast } from 'sonner';

export default function DashboardStats() {
  const [totalTankers, setTotalTankers] = useState(null);
  const [totalPendingRequests, setTotalPendingRequests] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total active tankers
        const tankersResponse = await fetch(`${baseUrl}/api/tankers/total-tankers`);
        if (!tankersResponse.ok) throw new Error('Failed to fetch total tankers');
        const tankersData = await tankersResponse.json();
        setTotalTankers(tankersData.total_tankers); // Accessing total_tankers from the response

        // Fetch total pending requests
        const requestsResponse = await fetch(`${baseUrl}/api/admin/total-pending-requests`);
        if (!requestsResponse.ok) throw new Error('Failed to fetch total pending requests');
        const requestsData = await requestsResponse.json();
        setTotalPendingRequests(requestsData.total_pending_requests); // Accessing total_pending_requests from the response

        // Fetch total users
        const usersResponse = await fetch(`${baseUrl}/api/customer/total-users`);
        if (!usersResponse.ok) throw new Error('Failed to fetch total users');
        const usersData = await usersResponse.json();
        setTotalUsers(usersData.total_users); // Accessing total_users from the response
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load stats');
      }
    };

    fetchStats();
  }, [baseUrl]);

  // Prepare the stats array based on fetched data
  const stats = [
    {
      title: "Total Pending Water Requests",
      value: totalPendingRequests !== null ? totalPendingRequests : "Loading...", // Placeholder for pending requests
      
      changeType: "positive", // Placeholder for change type
      icon: Droplet,
    },
    {
      title: "Active Tankers",
      value: totalTankers !== null ? totalTankers : "Loading...", // Placeholder for active tankers
     
      changeType: "positive", // Placeholder for change type
      icon: Truck,
    },
    
    {
      title: "Total Users",
      value: totalUsers !== null ? totalUsers : "Loading...", // Placeholder for total users
      
      changeType: "positive", // Placeholder for change type
      icon: Users,
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


"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import TankDetailsContent from "@/components/tank-details-content";
import DailyDeliveryTracking from "@/components/dashboard/daily-delivery-tracking";
import DateRangeDeliveryDetails from "@/components/dashboard/date-range-delivery-details";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error === 'access_denied') {
      toast.error('Access denied. You do not have permission to access that page.');
    }
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"></div>
      <DashboardStats />
      <DailyDeliveryTracking />
      <DateRangeDeliveryDetails />
      <TankDetailsContent />
    </div>
  );
}

import DashboardStats from "@/components/dashboard/dashboard-stats"
import RecentBookings from "@/components/dashboard/recent-bookings"
import WaterSupplyChart from "@/components/dashboard/water-supply-chart"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <DashboardStats />

      <div className="grid grid-cols gap-6 md:grid-cols-2">
        <WaterSupplyChart />
        <RecentBookings />
      </div>
    </div>
  )
}


import DashboardStats from "@/components/dashboard/dashboard-stats";
import TankDetailsContent from "@/components/tank-details-content";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"></div>
      <DashboardStats />
      <TankDetailsContent />
    </div>
  );
}

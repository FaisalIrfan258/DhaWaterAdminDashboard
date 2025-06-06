import { cookies } from "next/headers";
import CustomSidebar from "@/components/dashboard/dashboard-sidebar";
import TopBar from "@/components/dashboard/top-bar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  // Check for authentication on the server
  const cookieStore = await cookies();  // Await cookies() here
  const token = cookieStore.get("admin_token");

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar */}
      <CustomSidebar />

      {/* Main content section with padding to prevent overlap with fixed sidebar */}
      <div className="pl-64 flex flex-col flex-1">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

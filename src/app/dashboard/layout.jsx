import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TopBar from "@/components/dashboard/top-bar";

export default async function DashboardLayout({ children }) {
  // Check for authentication on the server
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

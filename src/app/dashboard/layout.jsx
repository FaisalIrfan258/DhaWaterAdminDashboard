'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import CustomSidebar from "@/components/dashboard/dashboard-sidebar";
import TopBar from "@/components/dashboard/top-bar";

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
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

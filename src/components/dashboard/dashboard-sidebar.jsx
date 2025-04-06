"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Droplet,
  Calendar,
  Truck,
  Users,
  Shield,
  Cpu,
  ChartNoAxesCombined,
  NotebookPen,
} from "lucide-react";
import Cookies from "js-cookie";

const CustomSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userType = Cookies.get("user_type");
    setUser({ isSuper: userType === "superAdmin" });
  }, []);

  const handleLogout = () => {
    Cookies.remove("admin_token", { path: "/" });
    Cookies.remove("user_type", { path: "/" });
    router.push("/login");
  };

  const baseNavItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Water Supply Request", icon: Droplet, href: "/dashboard/requests" },
    { title: "Confirmed Bookings", icon: Calendar, href: "/dashboard/bookings" },
    { title: "Tanker Management", icon: Truck, href: "/dashboard/tankers" },
    { title: "Driver Management", icon: Users, href: "/dashboard/drivers" },
    { title: "IOT Devices", icon: Cpu, href: "/dashboard/devices" },
    { title: "Users Management", icon: Users, href: "/dashboard/users" },
    { title: "Complains", icon: NotebookPen, href: "/dashboard/complains" },
  ];

  if (user === null) {
    return null; // or a loading spinner
  }

  const navItems = user.isSuper
    ? [
        ...baseNavItems,
        { title: "Reports and Analytics", icon: ChartNoAxesCombined, href: "/dashboard/reports" },
        { title: "Admin Management", icon: Shield, href: "/dashboard/admins" },
      ]
    : baseNavItems;

  return (
    <div className="w-64 fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-[#004D77] to-[#43A2B3] text-white">
      <div className="flex items-center justify-center h-24 px-6">
        <Image src="/assets/water.png" alt="logo" width={100} height={100} className="rounded-full" />
      </div>
      <div className="p-4 mt-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                pathname === item.href ? "bg-[#43A2B3]" : "hover:bg-[#43A2B3]"
              }`}
            >
              <item.icon size={20} className="mr-2" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="p-4 mt-auto">
        {/* Logout or any other footer components */}
      </div>
    </div>
  );
};


export default CustomSidebar;

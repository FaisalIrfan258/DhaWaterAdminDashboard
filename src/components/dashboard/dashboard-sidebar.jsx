"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Clock,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const CustomSidebar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [userState, setUserState] = useState(null);

  useEffect(() => {
    if (user?.user_type) {
      setUserState({ isSuper: user.user_type === "superAdmin" });
    }
  }, [user]);

  const baseNavItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    {
      title: "Water Supply Request",
      icon: Droplet,
      href: "/dashboard/requests",
    },
    {
      title: "Confirmed Bookings",
      icon: Calendar,
      href: "/dashboard/bookings",
    },
    { title: "Tanker Management", icon: Truck, href: "/dashboard/tankers" },
    { title: "Driver Management", icon: Users, href: "/dashboard/drivers" },
    { title: "IOT Devices", icon: Cpu, href: "/dashboard/devices" },
    { title: "Users Management", icon: Users, href: "/dashboard/users" },
    { title: "Complains", icon: NotebookPen, href: "/dashboard/complains" },
  ];

  if (userState === null) {
    return null; // or a loading spinner
  }

  const navItems = userState.isSuper
    ? [
        ...baseNavItems,
        {
          title: "Reports and Analytics",
          icon: ChartNoAxesCombined,
          href: "/dashboard/reports",
        },
        { title: "Admin Management", icon: Shield, href: "/dashboard/admins" },
        {
          title: "Shift Assignments",
          icon: Clock,
          href: "/dashboard/shift-assignments",
        },
      ]
    : baseNavItems;

  return (
    <div className="w-64 fixed top-0 left-0 z-50 h-screen bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
      <div className="flex items-center justify-center h-24 px-6 gap-4">
        <Image
          src="/assets/dhalogo.png"
          alt="DHA Logo"
          width={80}
          height={80}
          priority={true}
        />
        <Image
          src="/assets/dhasrviceslogo.jpg"
          alt="DHA Services Logo"
          width={80}
          height={80}
          priority={true}
        />
      </div>
      <div className="p-4 mt-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-2 rounded-md transition-all duration-300 ${
                pathname === item.href
                  ? "bg-gradient-to-r from-cyan-700 to-blue-700"
                  : "hover:bg-gradient-to-r hover:from-cyan-700 hover:to-blue-700"
              }`}
            >
              <item.icon size={20} className="mr-2" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomSidebar;

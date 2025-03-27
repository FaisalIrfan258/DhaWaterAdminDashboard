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
    { title: "IOT Devices", icon: Cpu, href: "/dashboard/devices" },
    { title: "Users Management", icon: Users, href: "/dashboard/users" },
  ];

  if (user === null) {
    return null; // or a loading spinner
  }

  const navItems = user.isSuper
    ? [
        ...baseNavItems,
        {
          title: "Admin Management",
          icon: Shield,
          href: "/dashboard/admins",
        },
      ]
    : baseNavItems;

  return (
    <div className="w-64 bg-gradient-to-b from-[#004D77] to-[#43A2B3] text-white min-h-screen">
      <div className="flex items-center justify-center h-16 px-6">
        <Image src="/assets/water.png" alt="logo" width={100} height={100} className="rounded-full mt-10" />
      </div>
      <div className="p-4 mt-10">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-2 rounded-md transition-colors duration-200 ${pathname === item.href ? 'bg-[#43A2B3]' : 'hover:bg-[#43A2B3]'}`}
            >
              <item.icon size={20} className="mr-2" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="p-4 mt-auto">
        {/* <div className="space-y-2">
          <Link
            href="/settings"
            className="flex items-center p-2 rounded-md hover:bg-[#43A2B3] transition-colors duration-200"
          >
            <Settings size={20} className="mr-2" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center p-2 rounded-md hover:bg-[#43A2B3] transition-colors duration-200 w-full"
          >
            <LogOut size={20} className="mr-2" />
            <span>Logout</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default CustomSidebar;

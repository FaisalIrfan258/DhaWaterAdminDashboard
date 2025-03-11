"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const hasToken = Cookies.get("access_token");

    if (storedUser && hasToken) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    toast.success("Logged in successfully");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    Cookies.remove("access_token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

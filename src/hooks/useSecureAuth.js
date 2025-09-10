import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import secureAuthService from "@/services/secureAuthService";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

// Hook to check authentication status
export const useAuth = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => secureAuthService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth checks
    refetchOnWindowFocus: true, // Check auth when window gains focus
  });
};

// Hook to get current user data
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: () => secureAuthService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: false, // Only fetch when explicitly called
  });
};

// Hook for admin login
export const useAdminLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => secureAuthService.adminLogin(credentials),
    onSuccess: (data) => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });

      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
};

// Hook for super admin login
export const useSuperAdminLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => secureAuthService.superAdminLogin(credentials),
    onSuccess: (data) => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });

      toast.success("Super Admin login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Super Admin login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => secureAuthService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Even if logout fails on server, clear client cache and redirect
      queryClient.clear();
      toast.warning("Logged out (with errors)");
      router.push("/login");
    },
  });
};

// Hook to refresh authentication token
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => secureAuthService.refreshToken(),
    onSuccess: () => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
    onError: (error) => {
      console.error("Token refresh error:", error);
      // If refresh fails, user needs to login again
      queryClient.clear();
    },
  });
};

// Hook to check if user is super admin
export const useIsSuperAdmin = () => {
  return useQuery({
    queryKey: ["auth", "isSuperAdmin"],
    queryFn: () => secureAuthService.isSuperAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: false, // Only fetch when explicitly called
  });
};

// Hook to get CSRF token
export const useCSRFToken = () => {
  return useQuery({
    queryKey: ["auth", "csrf"],
    queryFn: () => secureAuthService.getCSRFToken(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

// Custom hook for protected routes
export const useProtectedRoute = () => {
  const { data: isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    isAuthenticated,
    isLoading,
    error,
  };
};

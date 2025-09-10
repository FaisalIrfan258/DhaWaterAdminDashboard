import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services";
import { queryKeys } from "@/lib/queryClient";

// Get all admins
export const useAdmins = () => {
  return useQuery({
    queryKey: queryKeys.admins.all(),
    queryFn: () => adminService.getAllAdmins(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create admin mutation
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminData) => adminService.createAdmin(adminData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all() });
      toast.success("Admin created successfully");
    },
    onError: (error) => {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    },
  });
};

// Update admin mutation
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminId, adminData }) =>
      adminService.updateAdmin(adminId, adminData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all() });
      toast.success("Admin updated successfully");
    },
    onError: (error) => {
      console.error("Error updating admin:", error);
      toast.error(error.response?.data?.message || "Failed to update admin");
    },
  });
};

// Delete admin mutation
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId) => adminService.deleteAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all() });
      toast.success("Admin deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.message || "Failed to delete admin");
    },
  });
};

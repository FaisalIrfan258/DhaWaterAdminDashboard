import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tankerService } from "@/services";
import { queryKeys } from "@/lib/queryClient";

// Get all tankers
export const useTankers = () => {
  return useQuery({
    queryKey: queryKeys.tankers.all(),
    queryFn: () => tankerService.getAllTankers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get tanker by ID
export const useTanker = (tankerId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.tankers.byId(tankerId),
    queryFn: () => tankerService.getTankerById(tankerId),
    enabled: !!tankerId, // Only run if tankerId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get total tankers count
export const useTotalTankers = () => {
  return useQuery({
    queryKey: queryKeys.tankers.total(),
    queryFn: () => tankerService.getTotalTankers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get available tankers
export const useAvailableTankers = () => {
  return useQuery({
    queryKey: queryKeys.tankers.available(),
    queryFn: () => tankerService.getAvailableTankers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create tanker mutation
export const useCreateTanker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tankerData) => tankerService.createTanker(tankerData),
    onSuccess: (data) => {
      // Invalidate and refetch tankers
      queryClient.invalidateQueries({ queryKey: queryKeys.tankers.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tankers.total() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tankers.available(),
      });

      toast.success("Tanker created successfully", {
        description: "The new tanker has been added to the fleet.",
      });
    },
    onError: (error) => {
      console.error("Error creating tanker:", error);
      toast.error("Failed to create tanker", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

// Update tanker mutation
export const useUpdateTanker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tankerId, tankerData }) =>
      tankerService.updateTanker(tankerId, tankerData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch tankers
      queryClient.invalidateQueries({ queryKey: queryKeys.tankers.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tankers.byId(variables.tankerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tankers.available(),
      });

      toast.success("Tanker updated successfully", {
        description: "The tanker information has been updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating tanker:", error);
      toast.error("Failed to update tanker", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

// Delete tanker mutation
export const useDeleteTanker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tankerId) => tankerService.deleteTanker(tankerId),
    onSuccess: (data) => {
      // Invalidate and refetch tankers
      queryClient.invalidateQueries({ queryKey: queryKeys.tankers.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tankers.total() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tankers.available(),
      });

      toast.success("Tanker deleted successfully", {
        description: "The tanker has been removed from the fleet.",
      });
    },
    onError: (error) => {
      console.error("Error deleting tanker:", error);
      toast.error("Failed to delete tanker", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

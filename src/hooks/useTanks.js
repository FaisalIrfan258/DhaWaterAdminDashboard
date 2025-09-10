import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tankService } from "@/services";
import { queryKeys } from "@/lib/queryClient";

// Get latest water level for a tank
export const useLatestWaterLevel = (tankId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.tanks?.waterLevel(tankId) || [
      "tanks",
      "waterLevel",
      tankId,
    ],
    queryFn: () => tankService.getLatestWaterLevel(tankId),
    enabled: !!tankId, // Only run if tankId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for real-time data
    ...options,
  });
};

// Get latest water level in gallons for a tank
export const useLatestWaterLevelGallons = (tankId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.tanks?.waterLevelGallons(tankId) || [
      "tanks",
      "waterLevelGallons",
      tankId,
    ],
    queryFn: () => tankService.getLatestWaterLevelGallons(tankId),
    enabled: !!tankId, // Only run if tankId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for real-time data
    ...options,
  });
};

// Get hourly tank status for a customer
export const useHourlyTankStatus = (
  customerId,
  startDate,
  endDate,
  options = {}
) => {
  return useQuery({
    queryKey: queryKeys.tanks?.hourlyStatus(customerId, startDate, endDate) || [
      "tanks",
      "hourlyStatus",
      customerId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      tankService.getHourlyTankStatus(customerId, startDate, endDate),
    enabled: !!(customerId && startDate && endDate), // Only run if all params are provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

// Combined hook for tank data (water level + gallons)
export const useTankData = (tankId, options = {}) => {
  const waterLevelQuery = useLatestWaterLevel(tankId, options);
  const waterLevelGallonsQuery = useLatestWaterLevelGallons(tankId, options);

  return {
    waterLevel: waterLevelQuery.data?.water_level || 0,
    waterLevelGallons: parseInt(waterLevelGallonsQuery.data) || 0,
    isLoading: waterLevelQuery.isLoading || waterLevelGallonsQuery.isLoading,
    error: waterLevelQuery.error || waterLevelGallonsQuery.error,
    refetch: () => {
      waterLevelQuery.refetch();
      waterLevelGallonsQuery.refetch();
    },
  };
};

// Refresh tank data mutation (for manual refresh)
export const useRefreshTankData = (tankId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [waterLevel, waterLevelGallons] = await Promise.all([
        tankService.getLatestWaterLevel(tankId),
        tankService.getLatestWaterLevelGallons(tankId),
      ]);
      return { waterLevel, waterLevelGallons };
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(
        queryKeys.tanks?.waterLevel(tankId) || ["tanks", "waterLevel", tankId],
        data.waterLevel
      );
      queryClient.setQueryData(
        queryKeys.tanks?.waterLevelGallons(tankId) || [
          "tanks",
          "waterLevelGallons",
          tankId,
        ],
        data.waterLevelGallons
      );

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.tanks?.waterLevel(tankId) || [
          "tanks",
          "waterLevel",
          tankId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tanks?.waterLevelGallons(tankId) || [
          "tanks",
          "waterLevelGallons",
          tankId,
        ],
      });

      toast.success("Tank data refreshed successfully");
    },
    onError: (error) => {
      console.error("Error refreshing tank data:", error);
      toast.error("Failed to refresh tank data", {
        description: "Please try again later.",
      });
    },
  });
};

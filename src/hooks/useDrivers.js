import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { driverService } from '@/services';
import { queryKeys } from '@/lib/queryClient';

// Get all drivers
export const useDrivers = () => {
  return useQuery({
    queryKey: queryKeys.drivers.all(),
    queryFn: () => driverService.getAllDrivers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get driver by ID
export const useDriver = (driverId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.drivers.byId(driverId),
    queryFn: () => driverService.getDriverById(driverId),
    enabled: !!driverId, // Only run if driverId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get driver delivery report
export const useDriverDeliveryReport = (driverId, startDate, endDate, options = {}) => {
  return useQuery({
    queryKey: queryKeys.drivers.deliveryReport(driverId, startDate, endDate),
    queryFn: () => driverService.getDriverDeliveryReport(driverId, startDate, endDate),
    enabled: !!(driverId && startDate && endDate), // Only run if all params are provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Create driver mutation
export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (driverData) => driverService.createDriver(driverData),
    onSuccess: (data) => {
      // Invalidate and refetch drivers
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() });
      
      toast.success('Driver created successfully', {
        description: 'The new driver has been added to the system.',
      });
    },
    onError: (error) => {
      console.error('Error creating driver:', error);
      toast.error('Failed to create driver', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Update driver mutation
export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ driverId, driverData }) => driverService.updateDriver(driverId, driverData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch drivers
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.byId(variables.driverId) });
      
      toast.success('Driver updated successfully', {
        description: 'The driver information has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Delete driver mutation
export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (driverId) => driverService.deleteDriver(driverId),
    onSuccess: (data) => {
      // Invalidate and refetch drivers
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() });
      
      toast.success('Driver deleted successfully', {
        description: 'The driver has been removed from the system.',
      });
    },
    onError: (error) => {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};
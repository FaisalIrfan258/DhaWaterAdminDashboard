import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import sensorService from '@/services/sensorService';
import { queryKeys } from '@/lib/queryClient';

// Get all sensors
export const useSensors = () => {
  return useQuery({
    queryKey: queryKeys.sensors.all(),
    queryFn: () => sensorService.getAllSensors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get available sensors
export const useAvailableSensors = () => {
  return useQuery({
    queryKey: queryKeys.sensors.available(),
    queryFn: () => sensorService.getAvailableSensors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create sensor mutation
export const useCreateSensor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sensorService.createSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.available() });
      toast.success('Sensor created successfully');
    },
    onError: (error) => {
      console.error('Error creating sensor:', error);
      toast.error('Failed to create sensor', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Update sensor mutation
export const useUpdateSensor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sensorService.updateSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.available() });
      toast.success('Sensor updated successfully');
    },
    onError: (error) => {
      console.error('Error updating sensor:', error);
      toast.error('Failed to update sensor', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Delete sensor mutation
export const useDeleteSensor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sensorService.deleteSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.available() });
      toast.success('Sensor deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting sensor:', error);
      toast.error('Failed to delete sensor', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};
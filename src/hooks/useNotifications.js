import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import notificationService from '@/services/notificationService';
import { queryKeys } from '@/lib/queryClient';

// Query hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: notificationService.getAllNotifications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNotification = (id) => {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => notificationService.getNotificationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast.success('Notification created successfully');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    },
  });
};

export const useCreateNotificationForAll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationService.createNotificationForAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast.success('Notification sent to all users successfully');
    },
    onError: (error) => {
      console.error('Error creating notification for all:', error);
      toast.error('Failed to send notification to all users');
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => notificationService.updateNotification(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.detail(id) });
      toast.success('Notification updated successfully');
    },
    onError: (error) => {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast.success('Notification deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    },
  });
};
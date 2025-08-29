import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '@/services';
import { queryKeys } from '@/lib/queryClient';

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: () => userService.getAllUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user profile by ID
export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId, // Only run if userId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get total users count
export const useTotalUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.total(),
    queryFn: () => userService.getTotalUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user tank status
export const useUserTankStatus = (userId, startDate, endDate, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.tankStatus(userId, startDate, endDate),
    queryFn: () => userService.getUserTankStatus(userId, startDate, endDate),
    enabled: !!(userId && startDate && endDate), // Only run if all params are provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: (data) => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.total() });
      
      toast.success('User created successfully', {
        description: 'The new user has been added to the system.',
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error('Failed to create user', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }) => userService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(variables.userId) });
      
      toast.success('User updated successfully', {
        description: 'The user information has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Failed to update user', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: (data) => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.total() });
      
      toast.success('User deleted successfully', {
        description: 'The user has been removed from the system.',
      });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};
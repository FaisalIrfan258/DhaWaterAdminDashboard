import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestService } from '@/services';
import { queryKeys } from '@/lib/queryClient';

// Get all requests
export const useRequests = () => {
  return useQuery({
    queryKey: queryKeys.requests.all(),
    queryFn: () => requestService.getAllRequests(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get total pending requests
export const useTotalPendingRequests = () => {
  return useQuery({
    queryKey: queryKeys.requests.totalPending(),
    queryFn: () => requestService.getTotalPendingRequests(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Accept request mutation
export const useAcceptRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestData) => requestService.acceptRequest(requestData),
    onSuccess: (data) => {
      // Invalidate and refetch requests
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.totalPending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      
      toast.success('Request accepted successfully', {
        description: 'The water request has been accepted and processed.',
      });
    },
    onError: (error) => {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};

// Reject request mutation
export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, rejectionData }) => 
      requestService.rejectRequest(requestId, rejectionData),
    onSuccess: (data) => {
      // Invalidate and refetch requests
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.totalPending() });
      
      toast.success('Request rejected successfully', {
        description: 'The water request has been rejected.',
      });
    },
    onError: (error) => {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    },
  });
};
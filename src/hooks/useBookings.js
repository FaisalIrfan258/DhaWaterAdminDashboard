import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingService } from "@/services";
import { queryKeys } from "@/lib/queryClient";

// Get all bookings
export const useBookings = () => {
  return useQuery({
    queryKey: queryKeys.bookings.all(),
    queryFn: () => bookingService.getAllBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get booking by ID
export const useBooking = (bookingId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.bookings.byId(bookingId),
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId, // Only run if bookingId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get user bookings
export const useUserBookings = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.bookings.byUser(userId),
    queryFn: () => bookingService.getUserBookings(userId),
    enabled: !!userId, // Only run if userId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Get pending bookings (derived from all bookings)
export const usePendingBookings = () => {
  return useQuery({
    queryKey: queryKeys.bookings.pending(),
    queryFn: async () => {
      const allBookings = await bookingService.getAllBookings();
      return allBookings.filter((booking) => booking.status === "Pending");
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => bookingService.createBooking(bookingData),
    onSuccess: (data) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.pending() });
      if (data.customer_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.byUser(data.customer_id),
        });
      }

      toast.success("Booking created successfully", {
        description: "The water delivery booking has been created.",
      });
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

// Update booking mutation
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, bookingData }) =>
      bookingService.updateBooking(bookingId, bookingData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.byId(variables.bookingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.pending() });

      toast.success("Booking updated successfully", {
        description: "The booking information has been updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

// Delete booking mutation
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId) => bookingService.deleteBooking(bookingId),
    onSuccess: (data) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.pending() });

      toast.success("Booking deleted successfully", {
        description: "The booking has been removed from the system.",
      });
    },
    onError: (error) => {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

// Accept booking request mutation
export const useAcceptBookingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestData) => bookingService.acceptRequest(requestData),
    onSuccess: (data) => {
      // Invalidate and refetch bookings and requests
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests.totalPending(),
      });

      toast.success("Booking request accepted successfully", {
        description: "The booking request has been accepted and processed.",
      });
    },
    onError: (error) => {
      console.error("Error accepting booking request:", error);
      toast.error("Failed to accept booking request", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};

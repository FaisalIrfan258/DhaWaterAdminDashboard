import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that unused/inactive cache data remains in memory
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that the cache survives unused/inactive
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Error handling
      onError: (error) => {
        console.error('Query error:', error);
        // Show toast for network errors or server errors
        if (error?.response?.status >= 500 || !error?.response) {
          toast.error('Network error', {
            description: 'Please check your connection and try again.',
          });
        }
      },
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // Show specific error messages based on status code
        if (error?.response?.status === 401) {
          toast.error('Authentication failed', {
            description: 'Please log in again.',
          });
        } else if (error?.response?.status === 403) {
          toast.error('Access denied', {
            description: 'You do not have permission to perform this action.',
          });
        } else if (error?.response?.status >= 500 || !error?.response) {
          toast.error('Server error', {
            description: 'Something went wrong. Please try again later.',
          });
        }
      },
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    user: () => ['auth', 'user'],
  },
  // Users
  users: {
    all: () => ['users'],
    profile: (userId) => ['users', 'profile', userId],
    total: () => ['users', 'total'],
    tankStatus: (userId, startDate, endDate) => ['users', 'tankStatus', userId, startDate, endDate],
  },
  // Tankers
  tankers: {
    all: () => ['tankers'],
    byId: (tankerId) => ['tankers', tankerId],
    total: () => ['tankers', 'total'],
    available: () => ['tankers', 'available'],
  },
  // Bookings
  bookings: {
    all: () => ['bookings'],
    byId: (bookingId) => ['bookings', bookingId],
    byUser: (userId) => ['bookings', 'user', userId],
    pending: () => ['bookings', 'pending'],
  },
  // Drivers
  drivers: {
    all: () => ['drivers'],
    byId: (driverId) => ['drivers', driverId],
    deliveryReport: (driverId, startDate, endDate) => ['drivers', 'deliveryReport', driverId, startDate, endDate],
  },
  // Requests
  requests: {
    all: () => ['requests'],
    pending: () => ['requests', 'pending'],
    totalPending: () => ['requests', 'totalPending'],
  },
  // Notifications
  notifications: {
    all: () => ['notifications'],
    byId: (notificationId) => ['notifications', notificationId],
  },
  // Complaints
  complaints: {
    all: () => ['complaints'],
    byId: (complaintId) => ['complaints', complaintId],
  },
  // Admins
  admins: {
    all: () => ['admins'],
  },
  // Sensors
  sensors: {
    all: () => ['sensors'],
    available: () => ['sensors', 'available'],
  },
  // Tanks
  tanks: {
    waterLevel: (tankId) => ['tanks', 'waterLevel', tankId],
    waterLevelGallons: (tankId) => ['tanks', 'waterLevelGallons', tankId],
    hourlyStatus: (customerId, startDate, endDate) => ['tanks', 'hourlyStatus', customerId, startDate, endDate],
  },
  // Audit
  audit: {
    logs: () => ['audit', 'logs'],
  },
};
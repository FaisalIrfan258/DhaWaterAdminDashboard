import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance with secure configuration
const secureApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Always include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for CSRF token and other security headers
secureApiClient.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      try {
        // Get CSRF token from a dedicated endpoint
        const csrfResponse = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/csrf`, {
          withCredentials: true,
        });
        if (csrfResponse.data.csrf_token) {
          config.headers['X-CSRF-Token'] = csrfResponse.data.csrf_token;
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
      }
    }
    
    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
secureApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - try to refresh token first
          try {
            await secureApiClient.post('/api/auth/refresh');
            // Retry the original request
            return secureApiClient.request(error.config);
          } catch (refreshError) {
            // Refresh failed - redirect to login
            toast.error('Session expired. Please login again.');
            if (typeof window !== 'undefined') {
              // Clear any client-side data
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          toast.error(data?.message || 'Validation error occurred.');
          break;
        case 429:
          toast.error('Too many requests. Please wait a moment and try again.');
          break;
        case 500:
          toast.error('Internal server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Helper function for GET requests
export const secureGet = async (url, config = {}) => {
  try {
    const response = await secureApiClient.get(url, {
      ...config,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for POST requests
export const securePost = async (url, data = {}, config = {}) => {
  try {
    const response = await secureApiClient.post(url, data, {
      ...config,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for PUT requests
export const securePut = async (url, data = {}, config = {}) => {
  try {
    const response = await secureApiClient.put(url, data, {
      ...config,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for PATCH requests
export const securePatch = async (url, data = {}, config = {}) => {
  try {
    const response = await secureApiClient.patch(url, data, {
      ...config,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for DELETE requests
export const secureDel = async (url, config = {}) => {
  try {
    const response = await secureApiClient.delete(url, {
      ...config,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default secureApiClient;
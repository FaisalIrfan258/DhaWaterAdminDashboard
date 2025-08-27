import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          Cookies.remove('admin_token');
          Cookies.remove('user_id');
          Cookies.remove('user_name');
          Cookies.remove('user_email');
          Cookies.remove('is_super_admin');
          Cookies.remove('user_type');
          toast.error('Session expired. Please login again.');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
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
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for POST requests
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for PUT requests
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for PATCH requests
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function for DELETE requests
export const del = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;
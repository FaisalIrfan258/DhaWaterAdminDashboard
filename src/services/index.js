// API Services - Centralized exports
export { default as authService } from './authService';
export { default as secureAuthService } from './secureAuthService';
export { default as userService } from './userService';
export { default as tankerService } from './tankerService';
export { default as bookingService } from './bookingService';
export { default as driverService } from './driverService';
export { default as requestService } from './requestService';
export { default as notificationService } from './notificationService';
export { default as complaintService } from './complaintService';
export { default as adminService } from './adminService';
export { default as sensorService } from './sensorService';
export { default as tankService } from './tankService';
export { default as auditService } from './auditService';

// Re-export API clients for direct usage if needed
export { default as apiClient } from '../lib/apiClient';
export { default as secureApiClient } from '../lib/secureApiClient';
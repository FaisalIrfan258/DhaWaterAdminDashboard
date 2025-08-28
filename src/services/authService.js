import { post } from '../lib/apiClient';
import Cookies from 'js-cookie';

class AuthService {
  /**
   * Admin login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async adminLogin(credentials) {
    try {
      const response = await post('/api/admin/login', credentials);
      
      // Store auth data in cookies with correct field names
      this.storeAuthDataFromAPI(response, 'admin');
      
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Login failed. Please check your credentials.");
    }
  }

  /**
   * Super admin login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async superAdminLogin(credentials) {
    try {
      const response = await post('/api/superadmin/login', credentials);
      
      // Store auth data in cookies with correct field names
      this.storeAuthDataFromAPI(response, 'superAdmin');
      
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Login failed. Please check your credentials.");
    }
  }

  /**
   * Store authentication data in cookies
   * @param {Object} authData - Authentication response data
   */
  storeAuthData(authData) {
    const cookieOptions = {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    Cookies.set('admin_token', authData.token, cookieOptions);
    
    if (authData.admin_id) {
      Cookies.set('user_id', authData.admin_id.toString(), cookieOptions);
    }
    
    if (authData.admin_name) {
      Cookies.set('user_name', authData.admin_name, cookieOptions);
    }
    
    if (authData.admin_email) {
      Cookies.set('user_email', authData.admin_email, cookieOptions);
    }
    
    if (authData.is_super_admin !== undefined) {
      Cookies.set('is_super_admin', authData.is_super_admin.toString(), cookieOptions);
    }
    
    if (authData.user_type) {
      Cookies.set('user_type', authData.user_type, cookieOptions);
    }
  }

  /**
   * Store authentication data from API response with correct field mapping
   */
  storeAuthDataFromAPI(apiData, loginType) {
    const cookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === 'production',
      sameSite: "Strict",
    };

    // Store admin token and admin ID in cookies
    Cookies.set("admin_token", apiData.admin_token, cookieOptions);
    Cookies.set("user_id", apiData.admin_id, cookieOptions);
    Cookies.set("user_name", apiData.full_name, cookieOptions);
    Cookies.set("user_email", apiData.email, cookieOptions);
    Cookies.set("is_super_admin", apiData.is_super, cookieOptions);
    Cookies.set("user_type", loginType, cookieOptions);
  }

  /**
   * Logout user by clearing all auth cookies
   */
  logout() {
    const authCookies = [
      'admin_token',
      'user_id',
      'user_name',
      'user_email',
      'is_super_admin',
      'user_type'
    ];

    authCookies.forEach(cookie => {
      Cookies.remove(cookie);
    });

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!Cookies.get('admin_token');
  }

  /**
   * Get current user data from cookies
   * @returns {Object} User data
   */
  getCurrentUser() {
    return {
      id: Cookies.get('user_id'),
      name: Cookies.get('user_name'),
      email: Cookies.get('user_email'),
      isSuperAdmin: Cookies.get('is_super_admin') === 'true',
      userType: Cookies.get('user_type'),
      token: Cookies.get('admin_token')
    };
  }

  /**
   * Check if current user is super admin
   * @returns {boolean} Super admin status
   */
  isSuperAdmin() {
    return Cookies.get('is_super_admin') === 'true';
  }
}

export default new AuthService();
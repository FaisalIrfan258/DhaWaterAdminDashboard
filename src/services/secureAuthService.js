import { securePost, secureGet } from "../lib/secureApiClient";

class SecureAuthService {
  /**
   * Admin login with secure cookie storage
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async adminLogin(credentials) {
    try {
      const response = await securePost("/admin/login", credentials);

      // The server should set httpOnly cookies automatically
      // No need to store anything in localStorage
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials."
      );
    }
  }

  /**
   * Super admin login with secure cookie storage
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async superAdminLogin(credentials) {
    try {
      const response = await securePost("/superadmin/login", credentials);

      // The server should set httpOnly cookies automatically
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials."
      );
    }
  }

  /**
   * Logout user by calling server logout endpoint
   * This will clear the httpOnly cookies on the server side
   */
  async logout() {
    try {
      await securePost("/auth/logout", {});

      // Clear any client-side data if needed
      if (typeof window !== "undefined") {
        // Clear any non-sensitive data from localStorage
        localStorage.removeItem("user_preferences");
        localStorage.removeItem("theme");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear client-side data
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_preferences");
        localStorage.removeItem("theme");
      }
    }
  }

  /**
   * Check if user is authenticated by calling server endpoint
   * @returns {Promise<boolean>} Authentication status
   */
  async isAuthenticated() {
    try {
      const response = await secureGet("/auth/verify");
      return response.authenticated === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user data from server
   * @returns {Promise<Object|null>} User data
   */
  async getCurrentUser() {
    try {
      const response = await secureGet("/auth/user");

      return {
        id: response.user_id,
        name: response.full_name,
        email: response.email,
        isSuperAdmin: response.is_super_admin === true,
        user_type: response.user_type,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  /**
   * Check if current user is super admin
   * @returns {Promise<boolean>} Super admin status
   */
  async isSuperAdmin() {
    try {
      const user = await this.getCurrentUser();
      return user ? user.isSuperAdmin : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} Success status
   */
  async refreshToken() {
    try {
      await securePost("/auth/refresh", {});
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  /**
   * Get CSRF token for forms
   * @returns {Promise<string>} CSRF token
   */
  async getCSRFToken() {
    try {
      const response = await secureGet("/auth/csrf");
      return response.csrf_token;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  }
}

export default new SecureAuthService();

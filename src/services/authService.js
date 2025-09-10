import { post } from "../lib/apiClient";

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
      const response = await post("/api/admin/login", credentials);

      // Store auth data in localStorage
      this.storeAuthDataFromAPI(response, "admin");

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
   * Super admin login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async superAdminLogin(credentials) {
    try {
      const response = await post("/api/superadmin/login", credentials);

      // Store auth data in localStorage
      this.storeAuthDataFromAPI(response, "superAdmin");

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
   * Store authentication data from API response with correct field mapping
   */
  storeAuthDataFromAPI(apiData, loginType) {
    // Handle different token field names based on login type
    const token = apiData.admin_token || apiData.access_token;

    const userData = {
      admin_token: token,
      user_id: apiData.admin_id.toString(),
      user_name: apiData.full_name,
      user_email: apiData.email,
      is_super_admin: apiData.is_super.toString(),
      user_type: loginType,
    };

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_data", JSON.stringify(userData));
    }
  }

  /**
   * Logout user by clearing auth data
   */
  logout() {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_data");
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    const authData = localStorage.getItem("auth_data");
    return !!authData && !!JSON.parse(authData).admin_token;
  }

  /**
   * Get current user data from localStorage
   * @returns {Object} User data
   */
  getCurrentUser() {
    if (typeof window === "undefined") return null;

    const authData = localStorage.getItem("auth_data");
    if (!authData) return null;

    const userData = JSON.parse(authData);
    return {
      id: userData.user_id,
      name: userData.user_name,
      email: userData.user_email,
      isSuperAdmin: userData.is_super_admin === "true",
      user_type: userData.user_type,
      token: userData.admin_token,
    };
  }

  /**
   * Check if current user is super admin
   * @returns {boolean} Super admin status
   */
  isSuperAdmin() {
    const user = this.getCurrentUser();
    return user ? user.isSuperAdmin : false;
  }
}

export default new AuthService();

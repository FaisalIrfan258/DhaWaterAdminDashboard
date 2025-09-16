import { get, post, put, del } from "../lib/apiClient";

class UserService {
  /**
   * Get all users
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers() {
    return await get("/users/");
  }

  /**
   * Get user profile by ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    return await get(`/customer/customer-profile?customer_id=${userId}`);
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    return await post("/users/signup", userData);
  }

  /**
   * Update user
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userData) {
    return await put("/customer/update", userData);
  }

  /**
   * Delete user
   * @param {string|number} userId - User ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteUser(userId) {
    return await del(`/customer/delete?customer_id=${userId}`);
  }

  /**
   * Get user bookings
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} User bookings
   */
  async getUserBookings(userId) {
    return await get(`/bookings/my-bookings/${userId}`);
  }

  /**
   * Get user tank status
   * @param {string|number} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Tank status data
   */
  async getUserTankStatus(userId, startDate, endDate) {
    return await get(
      `/tankStatus/hourly-tank-status?customer_id=${userId}&start_date=${startDate}&end_date=${endDate}`
    );
  }

  /**
   * Get total users count
   * @returns {Promise<Object>} Total users count
   */
  async getTotalUsers() {
    return await get("/customer/total-users");
  }
}

export default new UserService();

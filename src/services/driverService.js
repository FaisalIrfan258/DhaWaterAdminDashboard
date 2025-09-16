import { get, post, put, del } from "../lib/apiClient";

class DriverService {
  /**
   * Get all drivers
   * @returns {Promise<Array>} List of drivers
   */
  async getAllDrivers() {
    return await get("/driver/all");
  }

  /**
   * Get driver by ID
   * @param {string|number} driverId - Driver ID
   * @returns {Promise<Object>} Driver data
   */
  async getDriverById(driverId) {
    return await get(`/driver/${driverId}`);
  }

  /**
   * Create new driver
   * @param {Object} driverData - Driver data
   * @returns {Promise<Object>} Created driver data
   */
  async createDriver(driverData) {
    return await post("/driver/create", driverData);
  }

  /**
   * Update driver
   * @param {string|number} driverId - Driver ID
   * @param {Object} driverData - Updated driver data
   * @returns {Promise<Object>} Updated driver data
   */
  async updateDriver(driverId, driverData) {
    return await put(`/driver/update/${driverId}`, driverData);
  }

  /**
   * Delete driver
   * @param {string|number} driverId - Driver ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteDriver(driverId) {
    return await del(`/driver/delete/${driverId}`);
  }

  /**
   * Get driver delivery report
   * @param {string|number} driverId - Driver ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Driver delivery report
   */
  async getDriverDeliveryReport(driverId, startDate, endDate) {
    return await get(
      `/driver/delivery-report/${driverId}?start_date=${startDate}&end_date=${endDate}`
    );
  }
}

export default new DriverService();

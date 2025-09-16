import { get, post, put, del } from "../lib/apiClient";

class TankService {
  /**
   * Get latest water level for a tank
   * @param {string|number} tankId - Tank ID
   * @returns {Promise<Object>} Latest water level data
   */
  async getLatestWaterLevel(tankId) {
    return await get(`/tankStatus/latest-water-level/?tank_id=${tankId}`);
  }

  /**
   * Get latest water level in gallons for a tank
   * @param {string|number} tankId - Tank ID
   * @returns {Promise<Object>} Latest water level in gallons
   */
  async getLatestWaterLevelGallons(tankId) {
    return await get(
      `/tankStatus/latest-water-level-gallons/?tank_id=${tankId}`
    );
  }

  /**
   * Get hourly tank status for a customer
   * @param {string|number} customerId - Customer ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Hourly tank status data
   */
  async getHourlyTankStatus(customerId, startDate, endDate) {
    return await get(
      `/tankStatus/hourly-tank-status?customer_id=${customerId}&start_date=${startDate}&end_date=${endDate}`
    );
  }
}

export default new TankService();

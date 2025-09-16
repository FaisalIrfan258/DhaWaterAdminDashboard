import { get, post, put, del } from "../lib/apiClient";

class TankerService {
  /**
   * Get all tankers
   * @returns {Promise<Array>} List of tankers
   */
  async getAllTankers() {
    return await get("/tankers");
  }

  /**
   * Get tanker by ID
   * @param {string|number} tankerId - Tanker ID
   * @returns {Promise<Object>} Tanker data
   */
  async getTankerById(tankerId) {
    return await get(`/tankers/${tankerId}`);
  }

  /**
   * Create new tanker
   * @param {Object} tankerData - Tanker data
   * @returns {Promise<Object>} Created tanker data
   */
  async createTanker(tankerData) {
    return await post("/tankers", tankerData);
  }

  /**
   * Update tanker
   * @param {string|number} tankerId - Tanker ID
   * @param {Object} tankerData - Updated tanker data
   * @returns {Promise<Object>} Updated tanker data
   */
  async updateTanker(tankerId, tankerData) {
    return await put(`/tankers/${tankerId}`, tankerData);
  }

  /**
   * Delete tanker
   * @param {string|number} tankerId - Tanker ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteTanker(tankerId) {
    return await del(`/tankers/${tankerId}`);
  }

  /**
   * Get available tankers
   * @returns {Promise<Array>} List of available tankers
   */
  async getAvailableTankers() {
    return await get("/tankers/available-tankers");
  }

  /**
   * Get total tankers count
   * @returns {Promise<Object>} Total tankers count
   */
  async getTotalTankers() {
    return await get("/tankers/total-tankers");
  }
}

export default new TankerService();

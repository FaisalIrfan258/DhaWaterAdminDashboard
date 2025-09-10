import { get, post, put, del } from "../lib/apiClient";

class SensorService {
  /**
   * Get all sensors
   * @returns {Promise<Array>} List of sensors
   */
  async getAllSensors() {
    return await get("/api/sensor");
  }

  /**
   * Get available sensors
   * @returns {Promise<Array>} List of available sensors
   */
  async getAvailableSensors() {
    return await get("/api/sensor/available-sensors");
  }

  /**
   * Create new sensor
   * @param {Object} sensorData - Sensor data
   * @returns {Promise<Object>} Created sensor data
   */
  async createSensor(sensorData) {
    return await post("/api/sensor", sensorData);
  }

  /**
   * Update sensor
   * @param {Object} sensorData - Updated sensor data
   * @returns {Promise<Object>} Updated sensor data
   */
  async updateSensor(sensorData) {
    return await put("/api/sensor", sensorData);
  }

  /**
   * Delete sensor
   * @param {string|number} sensorId - Sensor ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteSensor(sensorId) {
    return await del(`/api/sensor?sensor_id=${sensorId}`);
  }
}

export default new SensorService();

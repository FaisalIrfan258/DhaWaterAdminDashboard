import { get, post, put, del } from "../lib/apiClient";

class NotificationService {
  /**
   * Get all notifications
   * @returns {Promise<Array>} List of notifications
   */
  async getAllNotifications() {
    return await get("/notification/all-notifications");
  }

  /**
   * Get notification by ID
   * @param {string|number} notificationId - Notification ID
   * @returns {Promise<Object>} Notification data
   */
  async getNotificationById(notificationId) {
    return await get(`/notification/single-notification/${notificationId}`);
  }

  /**
   * Create notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification data
   */
  async createNotification(notificationData) {
    return await post(
      "/notification/create-notification",
      notificationData
    );
  }

  /**
   * Create notification for all users
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification data
   */
  async createNotificationForAll(notificationData) {
    return await post(
      "/notification/create-notification-for-all",
      notificationData
    );
  }

  /**
   * Update notification
   * @param {string|number} notificationId - Notification ID
   * @param {Object} notificationData - Updated notification data
   * @returns {Promise<Object>} Updated notification data
   */
  async updateNotification(notificationId, notificationData) {
    return await put(
      `/notification/update-notification/${notificationId}`,
      notificationData
    );
  }

  /**
   * Delete notification
   * @param {string|number} notificationId - Notification ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteNotification(notificationId) {
    return await del(`/notification/delete-notification/${notificationId}`);
  }
}

export default new NotificationService();

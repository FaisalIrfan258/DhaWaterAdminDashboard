import { get, post, put, del } from "../lib/apiClient";

class RequestService {
  /**
   * Get all admin requests
   * @returns {Promise<Array>} List of requests
   */
  async getAllRequests() {
    return await get("/admin/requests");
  }

  /**
   * Get total pending requests count
   * @returns {Promise<Object>} Total pending requests count
   */
  async getTotalPendingRequests() {
    return await get("/admin/total-pending-requests");
  }

  /**
   * Accept a request
   * @param {Object} requestData - Request acceptance data
   * @returns {Promise<Object>} Acceptance response
   */
  async acceptRequest(requestData) {
    return await post("/accept-request", requestData);
  }

  /**
   * Reject a request
   * @param {string|number} requestId - Request ID to reject
   * @param {Object} rejectionData - Rejection data
   * @returns {Promise<Object>} Rejection response
   */
  async rejectRequest(requestId, rejectionData) {
    return await put(
      `/bookings/reject-request/${requestId}`,
      rejectionData
    );
  }
}

export default new RequestService();

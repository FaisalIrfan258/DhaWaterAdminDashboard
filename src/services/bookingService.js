import { get, post, put, del } from "../lib/apiClient";

class BookingService {
  /**
   * Get all bookings
   * @returns {Promise<Array>} List of bookings
   */
  async getAllBookings() {
    return await get("/api/bookings/all-bookings");
  }

  /**
   * Get booking by ID
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise<Object>} Booking data
   */
  async getBookingById(bookingId) {
    return await get(`/api/bookings/single-booking/${bookingId}`);
  }

  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Created booking data
   */
  async createBooking(bookingData) {
    return await post("/api/bookings/create-booking", bookingData);
  }

  /**
   * Update booking
   * @param {string|number} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise<Object>} Updated booking data
   */
  async updateBooking(bookingId, bookingData) {
    return await put(`/api/bookings/update-booking/${bookingId}`, bookingData);
  }

  /**
   * Delete booking
   * @param {string|number} bookingId - Booking ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteBooking(bookingId) {
    return await del(`/api/bookings/delete-booking/${bookingId}`);
  }

  /**
   * Reject booking request
   * @param {string|number} requestId - Request ID to reject
   * @param {Object} rejectionData - Rejection data
   * @returns {Promise<Object>} Rejection response
   */
  async rejectRequest(requestId, rejectionData) {
    return await put(
      `/api/bookings/reject-request/${requestId}`,
      rejectionData
    );
  }

  /**
   * Accept booking request
   * @param {Object} requestData - Request acceptance data
   * @returns {Promise<Object>} Acceptance response
   */
  async acceptRequest(requestData) {
    return await post("/api/accept-request", requestData);
  }

  /**
   * Get user bookings
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} User bookings
   */
  async getUserBookings(userId) {
    return await get(`/api/bookings/my-bookings/${userId}`);
  }
}

export default new BookingService();

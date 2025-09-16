import { get, post, put, del } from "../lib/apiClient";

class AdminService {
  /**
   * Get all admins (super admin only)
   * @returns {Promise<Array>} List of admins
   */
  async getAllAdmins() {
    return await get("/superadmin/view-admins");
  }

  /**
   * Create new admin (super admin only)
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>} Created admin data
   */
  async createAdmin(adminData) {
    return await post("/superadmin/create-admin", adminData);
  }

  /**
   * Update admin (super admin only)
   * @param {Object} adminData - Updated admin data
   * @returns {Promise<Object>} Updated admin data
   */
  async updateAdmin(adminData) {
    return await put("/superadmin/update-admin", adminData);
  }

  /**
   * Delete admin (super admin only)
   * @param {string|number} adminId - Admin ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteAdmin(adminId) {
    return await del(`/superadmin/delete-admin?admin_id=${adminId}`);
  }
}

export default new AdminService();

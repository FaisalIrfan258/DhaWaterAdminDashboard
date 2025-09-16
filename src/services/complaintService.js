import { get, post, put, del } from "../lib/apiClient";

class ComplaintService {
  /**
   * Get all complaints
   * @returns {Promise<Array>} List of complaints
   */
  async getAllComplaints() {
    return await get("/complain/all-complains");
  }

  /**
   * Update complaint remarks
   * @param {string|number} complaintId - Complaint ID
   * @param {Object} remarksData - Remarks data
   * @returns {Promise<Object>} Updated complaint data
   */
  async updateComplaintRemarks(complaintId, remarksData) {
    return await put(
      `/complain/update-complain-remarks/${complaintId}`,
      remarksData
    );
  }
}

export default new ComplaintService();

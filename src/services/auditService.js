import { get, post, put, del } from "../lib/apiClient";

class AuditService {
  /**
   * Get all audit logs
   * @returns {Promise<Array>} List of audit logs
   */
  async getAuditLogs() {
    return await get("/auditLogs/get-audit-logs");
  }
}

export default new AuditService();

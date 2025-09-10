import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

// Hook to fetch audit logs
export const useAuditLogs = () => {
  return useQuery({
    queryKey: queryKeys.audit.logs(),
    queryFn: () => auditService.getAuditLogs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    },
  });
};

// Hook to refresh audit logs manually
export const useRefreshAuditLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => auditService.getAuditLogs(),
    onSuccess: (data) => {
      // Update the cache with fresh data
      queryClient.setQueryData(queryKeys.audit.logs(), data);
      toast.success("Audit logs refreshed successfully");
    },
    onError: (error) => {
      console.error("Error refreshing audit logs:", error);
      toast.error("Failed to refresh audit logs");
    },
  });
};

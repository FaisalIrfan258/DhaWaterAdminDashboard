"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuditLogs, useRefreshAuditLogs } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCw, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DataTable,
  commonActions,
  badgeVariants,
} from "@/components/common/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { usePagination } from "@/hooks";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";

export default function SystemLogsPage() {
  // React Query hooks
  const { data: logs = [], isLoading, error } = useAuditLogs();
  const refreshAuditLogs = useRefreshAuditLogs();

  // Local state
  const [viewingLog, setViewingLog] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // Search functionality
  const {
    searchQuery,
    filteredData: filteredLogs,
    handleSearch,
    clearSearch,
  } = useSearch(
    logs,
    [
      "table_name",
      "operation_type",
      "primary_key_value",
      "changed_by",
      "changed_data",
    ],
    {
      resetPageOnSearch: true,
      onPageReset: () => handlePageChange(1),
    }
  );

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedLogs,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(filteredLogs, 10);

  // Handle refresh
  const handleRefresh = () => {
    refreshAuditLogs.mutate();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format the log as a human-readable summary
  const formatLogSummary = (log) => {
    if (!log) return "";

    let summary = `${log.changed_by} ${log.operation_type.toLowerCase()}d `;

    switch (log.operation_type) {
      case "INSERT":
        summary += `a new record in ${log.table_name}`;
        break;
      case "UPDATE":
        summary += `record #${log.primary_key_value} in ${log.table_name}`;
        break;
      case "DELETE":
        summary += `record ${
          log.primary_key_value ? `#${log.primary_key_value}` : ""
        } from ${log.table_name}`;
        break;
      default:
        summary += `${log.table_name}`;
    }

    try {
      if (log.changed_data) {
        const changedData = JSON.parse(log.changed_data);
        const fields = Object.keys(changedData).join(", ");
        if (fields) {
          summary += ` (changed: ${fields})`;
        }
      }
    } catch (error) {
      console.error("Error parsing changed data:", error);
    }

    return summary;
  };

  // View log details
  const handleViewLog = useCallback((log) => {
    setViewingLog(log);
    setIsViewModalOpen(true);
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader heading="System Logs" text="View all system audit logs">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshAuditLogs.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                refreshAuditLogs.isPending ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <SearchInput
              placeholder="Search logs..."
              value={searchQuery}
              onChange={handleSearch}
              className="h-9"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Audit Logs</CardTitle>
            <CardDescription>
              A record of all changes made to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-muted-foreground">
                Loading logs...
              </div>
            ) : error ? (
              <div className="py-6 text-center text-muted-foreground">
                <p>Failed to load audit logs.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <DataTable
                  data={paginatedLogs}
                  columns={[
                    {
                      key: "id",
                      header: "ID",
                      accessor: "id",
                      cellClassName: "font-medium",
                    },
                    {
                      key: "summary",
                      header: "Summary",
                      render: (_, log) => formatLogSummary(log),
                      type: "truncate",
                      maxWidth: "max-w-xs",
                    },
                    {
                      key: "table_name",
                      header: "Table",
                      accessor: "table_name",
                      type: "badge",
                      badgeVariant: () => "outline",
                    },
                    {
                      key: "operation_type",
                      header: "Operation",
                      accessor: "operation_type",
                      type: "badge",
                      badgeVariant: badgeVariants.operation,
                    },
                    {
                      key: "changed_by",
                      header: "Changed By",
                      accessor: "changed_by",
                    },
                    {
                      key: "changed_at",
                      header: "Time",
                      accessor: "changed_at",
                      type: "date",
                    },
                  ]}
                  actions={[commonActions.view((log) => handleViewLog(log))]}
                  isLoading={isLoading}
                  emptyMessage="No logs found"
                  searchQuery={searchQuery}
                  searchEmptyMessage="No logs found matching your search"
                  className="mt-4"
                />

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredLogs.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  className="mt-6"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Log Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this system log entry.
            </DialogDescription>
          </DialogHeader>
          {viewingLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Log ID
                  </p>
                  <p>{viewingLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Table
                  </p>
                  <p>{viewingLog.table_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Operation
                  </p>
                  <p>{viewingLog.operation_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Record ID
                  </p>
                  <p>{viewingLog.primary_key_value || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Changed By
                  </p>
                  <p>{viewingLog.changed_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Changed At
                  </p>
                  <p>{formatDate(viewingLog.changed_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Summary
                </p>
                <p className="mb-2">{formatLogSummary(viewingLog)}</p>
              </div>

              {viewingLog.changed_data && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Changed Data
                  </p>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <pre className="text-xs">
                      {JSON.stringify(
                        JSON.parse(viewingLog.changed_data),
                        null,
                        2
                      )}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

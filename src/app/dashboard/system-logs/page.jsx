"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function SystemLogsPage() {
  // React Query hooks
  const { data: logs = [], isLoading, error } = useAuditLogs();
  const refreshAuditLogs = useRefreshAuditLogs();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingLog, setViewingLog] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filtered logs based on search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) {
      return logs;
    }

    return logs.filter(
      (log) =>
        log.table_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.operation_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.primary_key_value?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.changed_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.changed_data && log.changed_data.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [logs, searchQuery]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredLogs.length / itemsPerPage);
  }, [filteredLogs, itemsPerPage]);

  const paginatedLogs = useMemo(() => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = indexOfFirstItem + itemsPerPage;
    return filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredLogs, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Handle search
  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

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
        summary += `record ${log.primary_key_value ? `#${log.primary_key_value}` : ""} from ${log.table_name}`;
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
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshAuditLogs.isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 w-full md:w-1/2 lg:w-1/3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
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
            ) : filteredLogs.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No logs found.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Operation</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.id}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {formatLogSummary(log)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.table_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.operation_type === "INSERT"
                                  ? "success"
                                  : log.operation_type === "UPDATE"
                                  ? "warning"
                                  : "destructive"
                              }
                            >
                              {log.operation_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.changed_by}</TableCell>
                          <TableCell>{formatDate(log.changed_at)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewLog(log)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {paginatedLogs.length} of {filteredLogs.length} logs
                    </p>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">per page</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
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
                  <p className="text-sm font-medium text-muted-foreground">Log ID</p>
                  <p>{viewingLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Table</p>
                  <p>{viewingLog.table_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Operation</p>
                  <p>{viewingLog.operation_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Record ID</p>
                  <p>{viewingLog.primary_key_value || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Changed By</p>
                  <p>{viewingLog.changed_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Changed At</p>
                  <p>{formatDate(viewingLog.changed_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Summary</p>
                <p className="mb-2">{formatLogSummary(viewingLog)}</p>
              </div>
              
              {viewingLog.changed_data && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Changed Data</p>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <pre className="text-xs">
                      {JSON.stringify(JSON.parse(viewingLog.changed_data), null, 2)}
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
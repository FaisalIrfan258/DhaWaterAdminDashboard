"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = "No data found",
  searchQuery = "",
  searchEmptyMessage = "No results found matching your search",
  onRowClick,
  className,
  showActions = true,
  actions = [],
  rowClassName,
  ...props
}) {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Render cell content based on column type
  const renderCellContent = (item, column) => {
    const value = column.accessor
      ? getNestedValue(item, column.accessor)
      : item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === "badge") {
      return (
        <Badge
          variant={
            column.badgeVariant ? column.badgeVariant(value, item) : "default"
          }
          className={column.badgeClassName}
        >
          {value}
        </Badge>
      );
    }

    if (column.type === "date") {
      return value ? new Date(value).toLocaleString() : "-";
    }

    if (column.type === "currency") {
      return value ? `$${parseFloat(value).toFixed(2)}` : "-";
    }

    if (column.type === "truncate") {
      return (
        <div
          className={cn("truncate", column.maxWidth || "max-w-xs")}
          title={value}
        >
          {value}
        </div>
      );
    }

    return value || "-";
  };

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Render actions dropdown
  const renderActions = (item, index) => {
    if (!showActions || actions.length === 0) return null;

    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {actions.map((action, actionIndex) => {
            if (action.condition && !action.condition(item)) return null;

            return (
              <DropdownMenuItem
                key={actionIndex}
                onClick={() => action.onClick(item, index)}
                className={cn(
                  "cursor-pointer",
                  action.variant === "destructive" &&
                    "text-destructive focus:text-destructive"
                )}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.headerClassName,
                    column.align === "right" && "text-right"
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
              {showActions && actions.length > 0 && (
                <TableHead className="w-[80px]"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index} className="border-b border-border/50">
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-4 px-6">
                    <div className="h-4 bg-muted animate-pulse rounded-md" />
                  </TableCell>
                ))}
                {showActions && actions.length > 0 && (
                  <TableCell className="py-4 px-6 text-center">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded-md mx-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card shadow-sm overflow-hidden", className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/50 border-b">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  "font-semibold text-foreground h-12 px-6",
                  column.headerClassName,
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center"
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
            {showActions && actions.length > 0 && (
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length + (showActions && actions.length > 0 ? 1 : 0)
                }
                className="text-center py-16"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="text-5xl opacity-30">📋</div>
                  <div className="font-medium text-foreground">
                    {searchQuery ? searchEmptyMessage : emptyMessage}
                  </div>
                  {searchQuery && (
                    <div className="text-sm text-muted-foreground">
                      Try adjusting your search terms or filters
                    </div>
                  )}
                  {!searchQuery && (
                    <div className="text-sm text-muted-foreground">
                      Data will appear here when available
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={item.id || index}
                className={cn(
                  "hover:bg-muted/40 transition-all duration-200 cursor-pointer border-b border-border/50",
                  hoveredRow === index && "bg-muted/30 shadow-sm",
                  index % 2 === 0 && "bg-background",
                  index % 2 === 1 && "bg-muted/10",
                  rowClassName && rowClassName(item, index)
                )}
                onClick={() => onRowClick && onRowClick(item, index)}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(
                      "py-4 px-6 text-sm",
                      column.cellClassName,
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center"
                    )}
                  >
                    {renderCellContent(item, column)}
                  </TableCell>
                ))}
                {showActions && actions.length > 0 && (
                  <TableCell className="py-4 px-6 text-center">
                    {renderActions(item, index)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Common action configurations
export const commonActions = {
  view: (onClick) => ({
    label: "View Details",
    icon: Eye,
    onClick,
  }),
  edit: (onClick) => ({
    label: "Edit",
    icon: Edit,
    onClick,
  }),
  delete: (onClick) => ({
    label: "Delete",
    icon: Trash2,
    onClick,
    variant: "destructive",
  }),
};

// Common badge variants
export const badgeVariants = {
  status: (value) => {
    const variants = {
      Active: "success",
      Inactive: "secondary",
      Pending: "warning",
      Available: "success",
      Unavailable: "destructive",
      Completed: "success",
      "In Progress": "warning",
      Cancelled: "destructive",
      Resolved: "success",
      Open: "warning",
    };
    return variants[value] || "default";
  },
  operation: (value) => {
    const variants = {
      INSERT: "success",
      UPDATE: "warning",
      DELETE: "destructive",
    };
    return variants[value] || "default";
  },
};

import { useState, useMemo, useEffect } from "react";

/**
 * Custom hook for pagination logic
 * @param {Array} data - The data array to paginate
 * @param {number} initialItemsPerPage - Initial items per page (default: 10)
 * @param {number} initialPage - Initial page number (default: 1)
 * @returns {Object} Pagination state and handlers
 */
export const usePagination = (
  data = [],
  initialItemsPerPage = 10,
  initialPage = 1
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Ensure data is always an array
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(safeData.length / itemsPerPage);
  }, [safeData.length, itemsPerPage]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = indexOfFirstItem + itemsPerPage;
    return safeData.slice(indexOfFirstItem, indexOfLastItem);
  }, [safeData, currentPage, itemsPerPage]);

  // Reset to first page when data changes or when current page exceeds total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Handler for page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handler for items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };

  // Navigation functions
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

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    // State
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: data.length,
    paginatedData,

    // Handlers
    handlePageChange,
    handleItemsPerPageChange,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,

    // Setters (for direct control if needed)
    setCurrentPage,
    setItemsPerPage,
  };
};

import { useState, useMemo, useCallback } from "react";

/**
 * Custom hook for search functionality
 * @param {Array} data - The data array to search through
 * @param {Array} searchFields - Array of field names to search in (supports nested fields with dot notation)
 * @param {Object} options - Additional options
 * @param {boolean} options.resetPageOnSearch - Whether to reset pagination when searching
 * @param {Function} options.onPageReset - Callback function to reset pagination
 * @returns {Object} Search state and handlers
 */
export const useSearch = (data = [], searchFields = [], options = {}) => {
  const { resetPageOnSearch = false, onPageReset } = options;
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure data is always an array
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Helper function to get nested property value
  const getNestedValue = useCallback((obj, path) => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }, []);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return safeData;
    }

    const query = searchQuery.toLowerCase();

    return safeData.filter((item) => {
      return searchFields.some((field) => {
        const value = getNestedValue(item, field);
        if (value === null || value === undefined) return false;

        // Convert to string and search
        return value.toString().toLowerCase().includes(query);
      });
    });
  }, [safeData, searchQuery, searchFields, getNestedValue]);

  // Handle search input change
  const handleSearch = useCallback(
    (e) => {
      const query = typeof e === "string" ? e : e.target.value;
      setSearchQuery(query);

      // Reset pagination if requested
      if (resetPageOnSearch && onPageReset) {
        onPageReset(1);
      }
    },
    [resetPageOnSearch, onPageReset]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (resetPageOnSearch && onPageReset) {
      onPageReset(1);
    }
  }, [resetPageOnSearch, onPageReset]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    handleSearch,
    clearSearch,
    hasSearchQuery: searchQuery.trim().length > 0,
    resultCount: filteredData.length,
  };
};

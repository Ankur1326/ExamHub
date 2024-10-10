'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleItemPerPageChange: (e: any) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  handlePreviousPage,
  handleNextPage,
  handleItemPerPageChange,
}) => {

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm space-y-4 sm:space-y-0 sm:space-x-6">
      {/* Items Per Page Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-gray-600 dark:text-gray-300 text-sm font-medium" htmlFor="itemsPerPage">
          Items per page:
        </label>
        <div className="relative">
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => handleItemPerPageChange(e)}
            className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#716ACA] dark:bg-gray-800 dark:text-white"
          >
            {[5, 10, 15].map(size => (
              <option key={size} value={size} className="text-sm">
                {size}
              </option>
            ))}
          </select>
        </div>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          Showing {Math.min(itemsPerPage, totalItems)} of {totalItems} items
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition ${currentPage === 1 ? 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#716ACA] hover:bg-[#5e4cb8] text-white'
            }`}
          aria-label="Previous Page"
        >
          <ChevronLeft />
        </button>

        <span className="text-gray-700 dark:text-gray-400 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition ${currentPage === totalPages ? 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#716ACA] hover:bg-[#5e4cb8] text-white'
            }`}
          aria-label="Next Page"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

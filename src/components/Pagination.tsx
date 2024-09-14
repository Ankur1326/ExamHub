'use client'
import React from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleItemPerPageChange: (e : any) => void;
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
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm">
      {/* Items Per Page Selector */}
      <div className="flex items-center space-x-2 mb-4 sm:mb-0">
        <label className="text-gray-700" htmlFor="itemsPerPage">Items per page:</label>
        <div className="relative">
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => handleItemPerPageChange(e)}
          className="text-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
          {[5, 10, 15].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <span className="text-gray-600">
        Showing {Math.min(itemsPerPage, totalItems)} of {totalItems} items
      </span>
    </div>

      {/* Pagination Controls */ }
  <div className="flex items-center space-x-3">
    <button
      onClick={handlePreviousPage}
      disabled={currentPage === 1}
      className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#716ACA] hover:bg-[#645eb3]'
        }`}
      aria-label="Previous Page"
    >
      <FaAngleLeft className="text-lg" />
    </button>

    <span className="text-gray-700 text-sm">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={handleNextPage}
      disabled={currentPage === totalPages}
      className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#716ACA] hover:bg-[#645eb3]'
        }`}
      aria-label="Next Page"
    >
      <FaAngleRight className="text-lg" />
    </button>
  </div>
    </div >
  );
};

export default Pagination;

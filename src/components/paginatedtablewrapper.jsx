import React, { useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function PaginatedTableWrapper({
  data,
  rowsPerPage = 10,
  children,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const currentData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    if (totalPages <= 3)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages)
      return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-4">
      {children(currentData)}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-3 text-xs text-gray-600">
        <p className="text-center sm:text-left text-gray-500">
          {data.length === 1
            ? "1 of 1"
            : `Showing ${startIndex + 1}${
                endIndex !== startIndex + 1 ? `–${endIndex}` : ""
              } of ${data.length}`}{" "}
          available data
        </p>

        <div className="flex justify-center sm:justify-end items-center space-x-1 select-none">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all disabled:opacity-30"
          >
            <FaChevronLeft size={13} />
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[30px] h-8 px-2 flex items-center justify-center rounded-full text-[13px] font-medium transition-all ${
                currentPage === page
                  ? "bg-blue-50 text-blue-600 shadow-inner"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-500"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all disabled:opacity-30"
          >
            <FaChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

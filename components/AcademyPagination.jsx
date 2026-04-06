import React from 'react';

export default function AcademyPagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="academy-pagination">
            <button
                className="pagination-btn prev"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <span className="arrow">←</span> Previous
            </button>

            <div className="pagination-numbers">
                {pages.map((page) => (
                    <button
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                className="pagination-btn next"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next <span className="arrow">→</span>
            </button>
        </div>
    );
}

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to show
    const getPages = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const btnBase: React.CSSProperties = {
        background: 'transparent',
        border: '1px solid #e5e5e5',
        borderRadius: '6px',
        padding: '5px 10px',
        fontSize: '13px',
        cursor: 'pointer',
        color: '#737373',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
        height: '32px',
        transition: 'all 0.15s ease',
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: '1px solid #ebebea',
                fontSize: '13px',
                color: '#9b9a97',
                flexWrap: 'wrap',
                gap: '8px',
            }}
        >
            <span>
                {start}–{end} de {totalItems}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        ...btnBase,
                        opacity: currentPage === 1 ? 0.4 : 1,
                        cursor: currentPage === 1 ? 'default' : 'pointer',
                    }}
                >
                    <ChevronLeft size={14} />
                </button>

                {getPages().map((page, i) =>
                    page === '...' ? (
                        <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#d4d4d4' }}>
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            style={{
                                ...btnBase,
                                background: page === currentPage ? '#37352f' : 'transparent',
                                color: page === currentPage ? '#ffffff' : '#737373',
                                borderColor: page === currentPage ? '#37352f' : '#e5e5e5',
                                fontWeight: page === currentPage ? 600 : 400,
                            }}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        ...btnBase,
                        opacity: currentPage === totalPages ? 0.4 : 1,
                        cursor: currentPage === totalPages ? 'default' : 'pointer',
                    }}
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

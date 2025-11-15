// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/components/
// Nama File: CrudTable.jsx

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

// --- Definisi Komponen Spinner ---
// Komponen Spinner didefinisikan di sini untuk memperbaiki error "Could not resolve"
const Spinner = () => (
    <div className="flex justify-center items-center p-4">
        <svg
            className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
        <span className="text-gray-600">Memuat data...</span>
    </div>
);
// --- Akhir Definisi Spinner ---

/**
 * Komponen tabel generik untuk operasi CRUD.
 *
 * @param {object} props
 * @param {Array<object>} props.columns - Definisi kolom. Cth: [{ key: 'name', title: 'Nama', sortable: true }]
 * @param {Array<object>} props.data - Array data yang akan ditampilkan.
 * @param {boolean} props.loading - Status loading data.
 * @param {Error|string|null} props.error - Pesan error jika ada.
 * @param {object} [props.pagination] - Objek konfigurasi pagination.
 * @param {number} props.pagination.currentPage - Halaman saat ini.
 * @param {number} props.pagination.totalItems - Jumlah total item.
 * @param {number} props.pagination.itemsPerPage - Item per halaman.
 * @param {function} props.pagination.onPageChange - Handler saat halaman berubah.
 * @param {object} [props.sorting] - Objek konfigurasi sorting.
 * @param {string} props.sorting.sortKey - Kunci kolom yang sedang diurutkan.
 * @param {'asc'|'desc'} props.sorting.sortOrder - Arah pengurutan.
 * @param {function} props.sorting.onSort - Handler saat sorting berubah.
 * @param {function} props.renderRowActions - Fungsi untuk merender tombol aksi per baris (menerima item baris).
 */
const CrudTable = ({ 
    columns, 
    data, 
    loading, 
    error,
    pagination,
    sorting,
    renderRowActions
}) => {

    // Handler untuk klik header tabel (sorting)
    const handleSort = (key) => {
        if (!sorting || !sorting.onSort) return;
        
        let newOrder = 'asc';
        if (sorting.sortKey === key && sorting.sortOrder === 'asc') {
            newOrder = 'desc';
        }
        sorting.onSort(key, newOrder);
    };

    // Handler untuk render sel data
    const renderCell = (item, column) => {
        // Menggunakan render kustom jika ada
        if (column.render) {
            return column.render(item);
        }
        // Jika tidak, ambil data berdasarkan key
        // Mendukung nested key (cth: 'user.name')
        const value = column.key.split('.').reduce((o, k) => (o || {})[k], item);
        return value;
    };

    // Render komponen pagination
    const renderPagination = () => {
        if (!pagination || pagination.totalItems <= pagination.itemsPerPage) return null;

        const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
        const pages = [];
        
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        return (
            <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-700">
                    Menampilkan {data.length} dari {pagination.totalItems} hasil
                </span>
                <nav className="flex space-x-1">
                    {/* Tombol Sebelumnya */}
                    <button
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border"
                    >
                        Sebelumnya
                    </button>
                    
                    {/* Tombol Halaman (bisa disederhanakan untuk contoh ini) */}
                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => pagination.onPageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium border ${
                                page === pagination.currentPage 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    
                    {/* Tombol Berikutnya */}
                    <button
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === totalPages}
                        className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border"
                    >
                        Berikutnya
                    </button>
                </nav>
            </div>
        );
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th 
                                    key={col.key} 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {col.sortable && sorting ? (
                                        <button 
                                            className="flex items-center space-x-1 focus:outline-none"
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <span>{col.title}</span>
                                            {sorting.sortKey === col.key ? (
                                                sorting.sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            ) : (
                                                <span className="w-4"></span> // Placeholder
                                            )}
                                        </button>
                                    ) : (
                                        col.title
                                    )}
                                </th>
                            ))}
                            {renderRowActions && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (renderRowActions ? 1 : 0)}>
                                    <Spinner />
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td 
                                    colSpan={columns.length + (renderRowActions ? 1 : 0)} 
                                    className="px-6 py-4 text-center text-red-600"
                                >
                                    Gagal memuat data: {error.message || error}
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td 
                                    colSpan={columns.length + (renderRowActions ? 1 : 0)} 
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    Tidak ada data ditemukan.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {renderCell(item, col)}
                                        </td>
                                    ))}
                                    {renderRowActions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                {renderRowActions(item)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tampilkan pagination jika ada data dan tidak loading */}
            {!loading && data.length > 0 && renderPagination()}
        </div>
    );
};

export default CrudTable;
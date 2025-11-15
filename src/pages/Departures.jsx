import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import { useData } from '../contexts/DataContext';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
// import { formatDate, formatDateForInput } from '../utils/formatters';

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG ---

// Stub untuk ../utils/formatters
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        // Format tanggal sederhana (cth: 01 Des 2025)
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch (e) {
        return dateString; // Kembalikan string asli jika error
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Cek jika tanggal valid
        if (isNaN(date.getTime())) return '';
        // Format YYYY-MM-DD untuk input <input type="date">
        return date.toISOString().split('T')[0];
    } catch (e) {
        return ''; // Kembalikan string kosong jika error
    }
};

// Stub untuk ../contexts/DataContext
const useData = () => ({
    // Sediakan data tiruan untuk dropdown
    packages: [
        { id: 1, name: 'Paket Mock Umroh 9 Hari' },
        { id: 2, name: 'Paket Mock Haji 30 Hari' }
    ],
    flights: [
        { id: 1, airline: 'Garuda', flight_number: 'GA123' },
        { id: 2, airline: 'Saudia', flight_number: 'SV456' }
    ]
});

// Stub untuk ../hooks/useCRUD
const useCRUD = (resource) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });
    const [sortBy, setSortBy] = useState({ key: 'id', order: 'asc' });

    // Simulasikan pengambilan data
    useEffect(() => {
        setLoading(true);
        console.log(`[STUB useCRUD] Fetching ${resource}...`);
        setTimeout(() => {
            const mockData = [
                { id: 1, package_name: 'Paket Mock Umroh', package_id: 1, flight_id: 1, departure_date: '2025-12-01T10:00:00Z', return_date: '2025-12-10T10:00:00Z', airline_name: 'Garuda', status: 'scheduled', notes: '' },
                { id: 2, package_name: 'Paket Mock Haji', package_id: 2, flight_id: 2, departure_date: '2026-06-01T10:00:00Z', return_date: '2026-07-01T10:00:00Z', airline_name: 'Saudia', status: 'confirmed', notes: 'Catatan haji' },
            ];
            setData(mockData);
            setPagination(prev => ({ ...prev, totalItems: mockData.length }));
            setLoading(false);
        }, 500);
    }, [resource]); // Hanya fetch sekali

    const handlePageChange = (page) => setPagination(prev => ({ ...prev, currentPage: page }));
    const handleSearch = (term) => console.log(`[STUB useCRUD] Searching for: ${term}`);
    const handleSort = (key, order) => setSortBy({ key, order });
    const createItem = (item) => console.log('[STUB useCRUD] Creating item:', item);
    const updateItem = (id, item) => console.log(`[STUB useCRUD] Updating item ${id}:`, item);
    const deleteItem = (id) => console.log(`[STUB useCRUD] Deleting item ${id}`);

    return {
        data, loading, pagination, handlePageChange, handleSearch, handleSort, sortBy,
        createItem, updateItem, deleteItem
    };
};

// Stub untuk ../components/SearchInput
const SearchInput = ({ onSearch, placeholder }) => (
    <input
        type="text"
        placeholder={placeholder || "Cari..."}
        onChange={(e) => onSearch(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    />
);

// Stub untuk ../components/Pagination
const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalItems <= pagination.itemsPerPage) return null;
    const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
    return (
        <div className="flex justify-end space-x-1 mt-4">
            <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
                &laquo;
            </button>
            <span className="px-3 py-1">
                Halaman {pagination.currentPage} dari {totalPages}
            </span>
            <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
                &raquo;
            </button>
        </div>
    );
};

// Stub untuk ../components/Modal
const Modal = ({ title, show, onClose, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

// Stub untuk ../components/CrudTable
const CrudTable = ({
    columns, data, loading, sortBy, onSort, onEdit, onDelete,
    editCapability, deleteCapability, userCapabilities
}) => {
    const hasEditCap = userCapabilities.includes(editCapability);
    const hasDeleteCap = userCapabilities.includes(deleteCapability);

    const renderCell = (item, col) => {
        const value = item[col.accessor];
        if (col.render) {
            // Panggil fungsi render jika ada
            return col.render(value);
        }
        return value; // Kembalikan nilai standar
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.sortable ? (
                                    <button onClick={() => onSort(col.accessor, sortBy.key === col.accessor && sortBy.order === 'asc' ? 'desc' : 'asc')} className="flex items-center space-x-1">
                                        <span>{col.Header}</span>
                                        {/* Tanda panah tiruan */}
                                        {sortBy.key === col.accessor && (sortBy.order === 'asc' ? ' ▲' : ' ▼')}
                                    </button>
                                ) : (
                                    col.Header
                                )}
                            </th>
                        ))}
                        {(onEdit || onDelete) && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={columns.length + 1} className="p-4 text-center">Memuat...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan={columns.length + 1} className="p-4 text-center">Tidak ada data.</td></tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                        {onEdit && hasEditCap && <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>}
                                        {onDelete && hasDeleteCap && <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800">Hapus</button>}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- KOMPONEN ASLI 'Departures' ---

const Departures = ({ userCapabilities }) => {
    const {
        data: departures,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('departures');
    
    // Ambil data global (dari stub)
    const { packages, flights } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Paket', accessor: 'package_name', sortable: true },
        { Header: 'Tgl Berangkat', accessor: 'departure_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Tgl Kembali', accessor: 'return_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Maskapai', accessor: 'airline_name', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ...item,
            // Format tanggal untuk <input type="date">
            departure_date: formatDateForInput(item.departure_date),
            return_date: formatDateForInput(item.return_date),
        } : {
            // Nilai default untuk form baru
            departure_date: '',
            return_date: '',
            package_id: '',
            flight_id: '',
            status: 'scheduled',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentItem) {
            await updateItem(currentItem.id, formData);
        } else {
            await createItem(formData);
        }
        closeModal();
        // Di aplikasi nyata, Anda mungkin perlu me-refresh data di sini
        // Tapi stub useCRUD tidak mendukung refresh, jadi kita biarkan
    };

    const handleDelete = async (item) => {
        // Mengganti window.confirm dengan konfirmasi sederhana
        console.log(`[STUB] Menghapus: ${item.package_name}. (window.confirm diganti)`);
        // if (window.confirm(`Anda yakin ingin menghapus keberangkatan "${item.package_name}"?`)) {
            await deleteItem(item.id);
        // }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari keberangkatan..." />
                {userCapabilities.includes('manage_departures') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Keberangkatan
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={departures}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_departures') ? openModal : null}
                onDelete={userCapabilities.includes('manage_departures') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_departures"
                deleteCapability="manage_departures"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Keberangkatan' : 'Tambah Keberangkatan'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="package_id" className="block text-sm font-medium text-gray-700">Paket</label>
                            <select
                                id="package_id"
                                value={formData.package_id || ''}
                                onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            >
                                <option value="">Pilih Paket</option>
                                {/* Ambil 'packages' dari stub useData */}
                                {packages.map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="flight_id" className="block text-sm font-medium text-gray-700">Penerbangan</label>
                            <select
                                id="flight_id"
                                value={formData.flight_id || ''}
                                onChange={(e) => setFormData({ ...formData, flight_id: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="">Pilih Penerbangan</option>
                                {/* Ambil 'flights' dari stub useData */}
                                {flights.map(flt => (
                                    <option key={flt.id} value={flt.id}>{flt.airline} ({flt.flight_number})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="departure_date" className="block text-sm font-medium text-gray-700">Tgl Berangkat</label>
                            <input
                                type="date"
                                id="departure_date"
                                value={formData.departure_date || ''}
                                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="return_date" className="block text-sm font-medium text-gray-700">Tgl Kembali</label>
                            <input
                                type="date"
                                id="return_date"
                                value={formData.return_date || ''}
                                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                id="status"
                                value={formData.status || 'scheduled'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan</label>
                        <textarea
                            id="notes"
                            rows="3"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Departures;
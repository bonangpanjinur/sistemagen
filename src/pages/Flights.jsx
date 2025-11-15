import React, { useState, useEffect } from 'react';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
// import { formatDate, formatDateForInput } from '../utils/formatters';
// import { useData } from '../contexts/DataContext';

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG ---

// Stub untuk ../utils/formatters
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        // Format tanggal sederhana (cth: 01 Des 2025)
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            // Tambahkan waktu jika ini adalah datetime
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return dateString; // Kembalikan string asli jika error
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        // Format YYYY-MM-DDTHH:mm untuk input <input type="datetime-local">
        // Perlu penyesuaian zona waktu manual
        const pad = (num) => (num < 10 ? '0' + num : num);
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        // Jika Anda menggunakan <input type="date">, gunakan:
        // return `${y}-${m}-${d}`;
        
        // Jika Anda ingin <input type="datetime-local">, gunakan:
        // const h = pad(date.getHours());
        // const min = pad(date.getMinutes());
        // return `${y}-${m}-${d}T${h}:${min}`;

        // Untuk saat ini, kita anggap inputnya adalah 'date' seperti di kode asli
        return `${y}-${m}-${d}`;

    } catch (e) {
        return ''; // Kembalikan string kosong jika error
    }
};

// Stub untuk ../contexts/DataContext
const useData = () => ({
    // Sediakan fungsi refresh tiruan
    refreshData: (dataType) => {
        console.log(`[STUB useData] Refreshing data for: ${dataType}`);
        return Promise.resolve();
    }
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
                { id: 1, airline: 'Garuda Indonesia', flight_number: 'GA123', origin: 'CGK', destination: 'JED', departure_time: '2025-12-01T10:00:00Z', arrival_time: '2025-12-01T16:00:00Z' },
                { id: 2, airline: 'Saudia', flight_number: 'SV456', origin: 'CGK', destination: 'MED', departure_time: '2025-12-03T14:00:00Z', arrival_time: '2025-12-03T20:00:00Z' },
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
const Modal = ({ title, show, onClose, children, size = "max-w-lg" }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className={`bg-white p-6 rounded-lg shadow-xl z-50 w-full ${size} max-h-[90vh] overflow-y-auto`}>
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
            return col.render(value);
        }
        return value;
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
                                        {sortBy.key === col.accessor && (sortBy.order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
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

// --- KOMPONEN ASLI 'Flights' ---

const Flights = ({ userCapabilities }) => {
    const {
        data: flights,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('flights');
    
    const { refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Maskapai', accessor: 'airline', sortable: true },
        { Header: 'No. Penerbangan', accessor: 'flight_number', sortable: true },
        { Header: 'Asal', accessor: 'origin', sortable: true },
        { Header: 'Tujuan', accessor: 'destination', sortable: true },
        { Header: 'Keberangkatan', accessor: 'departure_time', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Kedatangan', accessor: 'arrival_time', sortable: true, render: (val) => formatDate(val) },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ...item,
            // Format tanggal untuk <input type="date">
            departure_time: formatDateForInput(item.departure_time),
            arrival_time: formatDateForInput(item.arrival_time),
        } : {
            airline: '',
            flight_number: '',
            origin: '',
            destination: '',
            departure_time: '',
            arrival_time: '',
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
        await refreshData('flights'); // Refresh data global
        closeModal();
    };

    const handleDelete = async (item) => {
        // Mengganti window.confirm dengan konfirmasi sederhana (di dunia nyata, gunakan modal konfirmasi)
        console.log(`[STUB] Menghapus: ${item.airline} ${item.flight_number}. (window.confirm diganti)`);
        // if (window.confirm(`Anda yakin ingin menghapus penerbangan "${item.airline} ${item.flight_number}"?`)) {
            await deleteItem(item.id);
            await refreshData('flights'); // Refresh data global
        // }
    };

    // Helper untuk memastikan nilai form adalah 'controlled'
    const getFormValue = (key) => formData[key] || '';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari penerbangan..." />
                {userCapabilities.includes('manage_flights') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Penerbangan
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={flights}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_flights') ? openModal : null}
                onDelete={userCapabilities.includes('manage_flights') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_flights"
                deleteCapability="manage_flights"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Penerbangan' : 'Tambah Penerbangan'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="airline" className="block text-sm font-medium text-gray-700">Maskapai</label>
                            <input
                                type="text"
                                id="airline"
                                value={getFormValue('airline')} // Menggunakan helper
                                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="flight_number" className="block text-sm font-medium text-gray-700">No. Penerbangan</label>
                            <input
                                type="text"
                                id="flight_number"
                                value={getFormValue('flight_number')} // Menggunakan helper
                                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Asal (Bandara)</label>
                            <input
                                type="text"
                                id="origin"
                                value={getFormValue('origin')} // Menggunakan helper
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Tujuan (Bandara)</label>
                            <input
                                type="text"
                                id="destination"
                                value={getFormValue('destination')} // Menggunakan helper
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            {/* PERBAIKAN TYPO DI SINI:
                              </Slslabel> telah diubah menjadi </label> 
                            */}
                            <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">Tgl/Waktu Keberangkatan</label>
                            <input
                                type="date" // Tipe tetap 'date' sesuai kode asli
                                id="departure_time"
                                value={getFormValue('departure_time')} // Menggunakan helper
                                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700">Tgl/Waktu Kedatangan</label>
                            <input
                                type="date" // Tipe tetap 'date' sesuai kode asli
                                id="arrival_time"
                                value={getFormValue('arrival_time')} // Menggunakan helper
                                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
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

export default Flights;
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import { useData } from '../contexts/DataContext';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
// import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG ---

// Stub untuk ../utils/formatters
const formatCurrency = (value) => {
    if (isNaN(Number(value))) return value;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

// Stub untuk ../contexts/DataContext
const useData = () => ({
    // Sediakan data jamaah tiruan untuk dropdown
    jamaah: [
        { id: 1, full_name: 'Jamaah Mock A (dari stub)' },
        { id: 2, full_name: 'Jamaah Mock B (dari stub)' }
    ],
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
                { id: 1, jamaah_name: 'Jamaah Mock A', amount: 5000000, payment_date: '2025-10-01T00:00:00Z', payment_method: 'transfer', status: 'confirmed' },
                { id: 2, jamaah_name: 'Jamaah Mock B', amount: 2500000, payment_date: '2025-10-05T00:00:00Z', payment_method: 'cash', status: 'pending' },
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

// --- KOMPONEN ASLI 'Finance' ---

// Ganti nama dari PaymentsComponent menjadi Finance
const Finance = ({ userCapabilities }) => {
    const {
        data: payments,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('payments');
    
    // Ambil data jamaah dari context global (stub)
    const { jamaah, refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Jamaah', accessor: 'jamaah_name', sortable: true },
        { Header: 'Jumlah', accessor: 'amount', sortable: true, render: (val) => formatCurrency(val) },
        { Header: 'Tgl Bayar', accessor: 'payment_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Metode', accessor: 'payment_method', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true, 
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'confirmed' ? 'bg-green-100 text-green-800' :
                    val === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {val}
                </span>
            )
        },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ...item,
            payment_date: formatDateForInput(item.payment_date)
        } : {
            jamaah_id: '',
            amount: '',
            payment_date: '',
            payment_method: 'cash',
            status: 'pending',
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
        // Refresh data jamaah karena saldo mereka mungkin berubah
        await refreshData('jamaah');
        closeModal();
    };

    const handleDelete = async (item) => {
        // Mengganti window.confirm dengan konfirmasi sederhana
        console.log(`[STUB] Menghapus: ${item.id}. (window.confirm diganti)`);
        // if (window.confirm(`Anda yakin ingin menghapus pembayaran "${formatCurrency(item.amount)}" untuk "${item.jamaah_name}"?`)) {
            await deleteItem(item.id);
            // Refresh data jamaah karena saldo mereka mungkin berubah
            await refreshData('jamaah');
        // }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari pembayaran..." />
                {userCapabilities.includes('manage_finance') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Pembayaran
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={payments}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_finance') ? openModal : null}
                onDelete={userCapabilities.includes('manage_finance') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_finance"
                deleteCapability="manage_finance"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Pembayaran' : 'Tambah Pembayaran'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="jamaah_id" className="block text-sm font-medium text-gray-700">Jamaah</label>
                        <select
                            id="jamaah_id"
                            value={formData.jamaah_id || ''}
                            onChange={(e) => setFormData({ ...formData, jamaah_id: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="">Pilih Jamaah</option>
                            {jamaah.map(j => (
                                <option key={j.id} value={j.id}>{j.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah (IDR)</label>
                            <input
                                type="number"
                                id="amount"
                                value={formData.amount || ''}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">Tgl Bayar</label>
                            <input
                                type="date"
                                id="payment_date"
                                value={formData.payment_date || ''}
                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">Metode</label>
                            <select
                                id="payment_method"
                                value={formData.payment_method || 'cash'}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="cash">Cash</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="debit">Debit</option>
                                <option value="credit_card">Kartu Kredit</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                id="status"
                                value={formData.status || 'pending'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
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

export default Finance;
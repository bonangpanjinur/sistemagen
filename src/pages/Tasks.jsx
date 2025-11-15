// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/pages/
// Nama File: Tasks.jsx

import React, { useState, useEffect } from 'react'; // Menambahkan useEffect
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import { useData } from '../contexts/DataContext';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon untuk stub
// import { formatDate, formatDateForInput } from '../utils/formatters';

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG (7) ---

// 1. Stub untuk ../utils/formatters
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

// 2. Stub untuk ../contexts/DataContext
const useData = () => ({
    // Sediakan data tiruan untuk dropdown
    users: [
        { ID: 1, display_name: 'Staff Mock A (dari stub)' },
        { ID: 2, display_name: 'Staff Mock B (dari stub)' }
    ],
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

// 3. Stub untuk ../hooks/useCRUD
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
                { id: 1, title: 'Siapkan Dokumen Mock', assignee_name: 'Staff A', jamaah_name: 'Jamaah A', due_date: '2025-12-01T00:00:00Z', status: 'pending' },
                { id: 2, title: 'Telepon Jamaah Mock', assignee_name: 'Staff B', jamaah_name: 'Jamaah B', due_date: '2025-12-05T00:00:00Z', status: 'completed' },
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

// 4. Stub untuk ../components/SearchInput
const SearchInput = ({ onSearch, placeholder }) => (
    <input
        type="text"
        placeholder={placeholder || "Cari..."}
        onChange={(e) => onSearch(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    />
);

// 5. Stub untuk ../components/Pagination
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

// 6. Stub untuk ../components/Modal
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

// 7. Stub untuk ../components/CrudTable
const CrudTable = ({
    columns, data, loading, sortBy, onSort, onEdit, onDelete,
    editCapability, deleteCapability, userCapabilities
}) => {
    const hasEditCap = userCapabilities.includes(editCapability);
    const hasDeleteCap = userCapabilities.includes(deleteCapability);

    const renderCell = (item, col) => {
        // Menggunakan accessor (key) untuk mengambil nilai
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

// --- KOMPONEN ASLI 'Tasks' ---

const Tasks = ({ userCapabilities }) => {
    const {
        data: tasks,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('tasks');
    
    // Ambil data global (dari stub)
    const { users, jamaah } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Tugas', accessor: 'title', sortable: true },
        { Header: 'Ditugaskan Ke', accessor: 'assignee_name', sortable: true },
        { Header: 'Terkait Jamaah', accessor: 'jamaah_name', sortable: true },
        { Header: 'Batas Waktu', accessor: 'due_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Status', accessor: 'status', sortable: true,
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'completed' ? 'bg-green-100 text-green-800' :
                    val === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    val === 'proses' ? 'bg-blue-100 text-blue-800' : // Menambahkan status 'proses'
                    'bg-gray-100 text-gray-800'
                }`}>
                    {val}
                </span>
            )
        },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        const defaultData = {
            title: '',
            description: '',
            assignee_id: '',
            jamaah_id: '',
            due_date: '',
            status: 'pending'
        };
        
        setFormData(item ? {
            ...defaultData,
            ...item,
            due_date: formatDateForInput(item.due_date),
        } : defaultData);
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
        // Tapi stub useCRUD tidak mendukung refresh otomatis
    };

    const handleDelete = async (item) => {
        // PENTING: window.confirm dilarang.
        // Di aplikasi nyata, gunakan modal konfirmasi kustom.
        console.log(`[STUB] Konfirmasi penghapusan untuk: ${item.title}. (Dihapus secara otomatis)`);
        
        // if (window.confirm(`Anda yakin ingin menghapus tugas "${item.title}"?`)) { // BARIS INI DILARANG
            await deleteItem(item.id);
        // }
    };

    // Helper untuk memastikan nilai form adalah 'controlled'
    const getFormValue = (key) => formData[key] || '';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari tugas..." />
                {userCapabilities.includes('manage_tasks') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Tugas
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={tasks}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_tasks') ? openModal : null}
                onDelete={userCapabilities.includes('manage_tasks') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_tasks"
                deleteCapability="manage_tasks"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Tugas' : 'Tambah Tugas'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Tugas</label>
                        <input type="text" value={getFormValue('title')} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tugaskan Ke (Staff)</label>
                            <select value={getFormValue('assignee_id')} onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Pilih Staff</option>
                                {users.map(user => <option key={user.ID} value={user.ID}>{user.display_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Terkait Jamaah</label>
                            <select value={getFormValue('jamaah_id')} onChange={(e) => setFormData({ ...formData, jamaah_id: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Pilih Jamaah (Opsional)</option>
                                {jamaah.map(j => <option key={j.id} value={j.id}>{j.full_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Batas Waktu</label>
                            <input type="date" value={getFormValue('due_date')} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="pending">Pending</option>
                                <option value="proses">Proses</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea rows="3" value={getFormValue('description')} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Tugas</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;
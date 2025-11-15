import React, { useState, useReducer, useEffect } from 'react';
// Impor-impor berikut telah dihapus dan diganti dengan stub di bawah
// import useCRUD from '../hooks/useCRUD';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon untuk CrudTable stub
// import { useData } from '../contexts/DataContext';

// --- STUB UNTUK KOMPONEN & HOOKS ---

// Stub untuk ../contexts/DataContext
const useData = () => ({
    // Sediakan fungsi 'refreshData' tiruan
    refreshData: (dataType) => {
        console.log(`[STUB] Refreshing data for: ${dataType}`);
        return Promise.resolve();
    }
});

// Stub untuk ../hooks/useCRUD
// Ini adalah implementasi tiruan yang sangat sederhana
const useCRUD = (resource) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });
    const [sortBy, setSortBy] = useState({ key: 'id', order: 'asc' });

    useEffect(() => {
        // Simulasikan pengambilan data
        setLoading(true);
        console.log(`[STUB useCRUD] Fetching ${resource}...`);
        setTimeout(() => {
            // Data tiruan
            const mockData = [
                { id: 1, name: 'Kategori Mock 1', description: 'Deskripsi mock 1' },
                { id: 2, name: 'Kategori Mock 2', description: 'Deskripsi mock 2' },
            ];
            setData(mockData);
            setPagination(prev => ({ ...prev, totalItems: mockData.length }));
            setLoading(false);
            console.log(`[STUB useCRUD] Fetched ${resource}`);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
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
                                        {item[col.accessor]}
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

// --- KOMPONEN ASLI ---

const Categories = ({ userCapabilities }) => {
    const {
        data: categories,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('categories');
    
    // Ambil fungsi refresh dari context
    const { refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Kategori', accessor: 'name', sortable: true },
        { Header: 'Deskripsi', accessor: 'description' },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { name: item.name, description: item.description } : { name: '', description: '' });
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
        await refreshData('categories'); // Refresh data global
        closeModal();
    };

    const handleDelete = async (item) => {
        // Mengganti window.confirm dengan konfirmasi sederhana (di dunia nyata, gunakan modal konfirmasi)
        console.log(`[STUB] Menghapus: ${item.name}. (window.confirm diganti)`);
        // if (window.confirm(`Anda yakin ingin menghapus kategori "${item.name}"?`)) {
            await deleteItem(item.id);
            await refreshData('categories'); // Refresh data global
        // }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari kategori..." />
                {userCapabilities.includes('manage_categories') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Kategori
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={categories}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_categories') ? openModal : null}
                onDelete={userCapabilities.includes('manage_categories') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_categories"
                deleteCapability="manage_categories"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Kategori' : 'Tambah Kategori'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea
                            id="description"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Categories;
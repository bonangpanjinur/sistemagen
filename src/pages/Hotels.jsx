// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/pages/
// Nama File: Hotels.jsx

import React, { useState, useEffect } from 'react';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon untuk stub CrudTable
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
// import { useData } from '../contexts/DataContext';

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG ---

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
                { id: 1, name: 'Hotel Mock Madinah', location: 'Madinah', rating: 5, phone: '12345', address: 'Jalan Mock 1' },
                { id: 2, name: 'Hotel Mock Makkah', location: 'Makkah', rating: 4, phone: '67890', address: 'Jalan Mock 2' },
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


// --- KOMPONEN ASLI 'Hotels' ---

const Hotels = ({ userCapabilities }) => {
    const {
        data: hotels,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('hotels');
    
    const { refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Hotel', accessor: 'name', sortable: true },
        { Header: 'Lokasi', accessor: 'location', sortable: true },
        { Header: 'Bintang', accessor: 'rating', sortable: true, render: (val) => `${val} Bintang` },
        { Header: 'Telepon', accessor: 'phone' },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        // Memastikan semua field ada di state, bahkan jika 'item' tidak memilikinya
        const defaultData = { name: '', location: '', rating: 3, phone: '', address: '' };
        setFormData(item ? { ...defaultData, ...item } : defaultData);
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
        await refreshData('hotels'); // Refresh data global
        closeModal();
    };

    const handleDelete = async (item) => {
        // PENTING: Menghapus window.confirm karena dilarang.
        // Di aplikasi nyata, gunakan modal konfirmasi kustom.
        console.log(`[STUB] Konfirmasi penghapusan untuk: ${item.name}. (Dihapus secara otomatis)`);
        
        // if (window.confirm(`Anda yakin ingin menghapus hotel "${item.name}"?`)) { // BARIS INI DILARANG
            await deleteItem(item.id);
            await refreshData('hotels'); // Refresh data global
        // }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari hotel..." />
                {userCapabilities.includes('manage_hotels') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Hotel
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={hotels}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_hotels') ? openModal : null}
                onDelete={userCapabilities.includes('manage_hotels') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_hotels"
                deleteCapability="manage_hotels"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Hotel' : 'Tambah Hotel'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Hotel</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name || ''} // Memastikan controlled component
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi (Kota)</label>
                            <input
                                type="text"
                                id="location"
                                value={formData.location || ''} // Memastikan controlled component
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Bintang (Rating)</label>
                            <select
                                id="rating"
                                value={formData.rating || 3} // Memastikan controlled component
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.phone || ''} // Memastikan controlled component
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                        <textarea
                            id="address"
                            rows="3"
                            value={formData.address || ''} // Memastikan controlled component
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

export default Hotels;
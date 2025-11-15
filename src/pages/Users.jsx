// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/pages/
// Nama File: Users.jsx

import React, { useState, useEffect } from 'react'; // Menambahkan useEffect
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon
// import api from '../utils/api'; 
// import { useData } from '../contexts/DataContext';

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG (7) ---

// 1. Stub untuk ../utils/api
const api = {
    get: (url) => {
        console.log(`[STUB API] GET: ${url}`);
        // Mengembalikan promise yang resolve dengan data users tiruan
        return Promise.resolve({
            data: {
                items: [
                    { ID: 1, display_name: 'Admin Mock', user_login: 'admin', user_email: 'admin@mock.com', role: 'administrator', role_name: 'Administrator' },
                    { ID: 2, display_name: 'Editor Mock', user_login: 'editor', user_email: 'editor@mock.com', role: 'editor', role_name: 'Editor' }
                ],
                total: 2,
                current_page: 1 // Tambahkan properti paginasi
            }
        });
    },
    put: (url, data) => {
        console.log(`[STUB API] PUT: ${url}`, data);
        return Promise.resolve({ data: { ...data, ID: url.split('/')[1] } });
    },
    post: (url, data) => {
        console.log(`[STUB API] POST: ${url}`, data);
        return Promise.resolve({ data: { ...data, ID: 99 } }); 
    },
    delete: (url) => {
         console.log(`[STUB API] DELETE: ${url}`);
         return Promise.resolve();
    }
};

// 2. Stub untuk ../contexts/DataContext
const useData = () => ({
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
    const [sortBy, setSortBy] = useState({ key: 'ID', order: 'asc' });

    // Simulasikan pengambilan data
    const fetchData = (page = 1) => {
        setLoading(true);
        console.log(`[STUB useCRUD] Fetching ${resource} page ${page}...`);
        api.get(`${resource}?page=${page}`).then(response => {
            setData(response.data.items);
            setPagination(prev => ({ 
                ...prev, 
                totalItems: response.data.total,
                currentPage: response.data.current_page 
            }));
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData(1);
    }, [resource]); // Hanya fetch sekali saat resource berubah

    const handlePageChange = (page) => {
        // Panggil fetchData untuk halaman baru
        fetchData(page);
    };
    const handleSearch = (term) => console.log(`[STUB useCRUD] Searching for: ${term}`);
    const handleSort = (key, order) => setSortBy({ key, order });

    return {
        data, loading, pagination, handlePageChange, handleSearch, handleSort, sortBy
        // Komponen ini tidak menggunakan create/update/delete dari hook
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
                            <tr key={item.ID} className="hover:bg-gray-50"> {/* Menggunakan ID sebagai key */}
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


// --- KOMPONEN ASLI 'Users' ---

const Users = ({ userCapabilities }) => {
    const {
        data: users,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
    } = useCRUD('users');
    
    // Ambil data roles dari WordPress
    const { roles: allRoles } = window.umhData || { roles: { 'subscriber': { display_name: 'Subscriber (Stub)' } } }; // Fallback jika window.umhData tidak ada
    const { refreshData } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    
    // Helper untuk memastikan nilai form adalah 'controlled'
    const getFormValue = (key) => formData[key] || '';

    const columns = [
        { Header: 'ID', accessor: 'ID', sortable: true },
        { Header: 'Nama', accessor: 'display_name', sortable: true },
        { Header: 'Username', accessor: 'user_login', sortable: true },
        { Header: 'Email', accessor: 'user_email', sortable: true },
        { Header: 'Role', accessor: 'role_name', sortable: true },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ID: item.ID,
            display_name: item.display_name,
            user_email: item.user_email,
            role: item.role,
        } : {
            display_name: '',
            user_login: '',
            user_email: '',
            role: 'subscriber', // default
            password: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                // Update User (menggunakan api stub)
                await api.put(`users/${currentItem.ID}`, formData);
            } else {
                // Create User (menggunakan api stub)
                await api.post('users', formData);
            }
            handlePageChange(1); // Refresh data
            await refreshData('users'); // Refresh data global
            closeModal();
        } catch (error) {
            console.error("Gagal menyimpan user:", error);
        }
    };

    const handleDelete = async (item) => {
        // PENTING: window.confirm dilarang.
        // Di aplikasi nyata, gunakan modal konfirmasi kustom.
        console.log(`[STUB] Konfirmasi penghapusan untuk: ${item.display_name}. (Dihapus secara otomatis)`);
        
        // if (window.confirm(`Anda yakin ingin menghapus user "${item.display_name}"?`)) { // BARIS INI DILARANG
            try {
                await api.delete(`users/${item.ID}`); // Menggunakan api stub
                handlePageChange(pagination.currentPage); // Refresh data
                await refreshData('users'); // Refresh data global
            } catch (error) {
                console.error("Gagal menghapus user:", error);
            }
        // }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari staff..." />
                {userCapabilities.includes('manage_users') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Staff
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={users}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_users') ? openModal : null}
                onDelete={userCapabilities.includes('manage_users') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_users"
                deleteCapability="manage_users"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Staff' : 'Tambah Staff'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Tampilan</label>
                            <input type="text" value={getFormValue('display_name')} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={getFormValue('user_email')} onChange={(e) => setFormData({ ...formData, user_email: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={getFormValue('user_login')}
                                onChange={(e) => setFormData({ ...formData, user_login: e.target.value })}
                                className="mt-1 block w-full"
                                required={!currentItem}
                                disabled={!!currentItem}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select value={getFormValue('role')} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1 block w-full" required>
                                {Object.keys(allRoles).map(roleKey => (
                                    <option key={roleKey} value={roleKey}>{allRoles[roleKey].display_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={getFormValue('password')}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full"
                                placeholder={currentItem ? 'Kosongkan jika tidak ganti' : ''}
                                required={!currentItem}
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

export default Users;
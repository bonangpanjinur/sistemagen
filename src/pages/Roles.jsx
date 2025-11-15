import React, { useState, useEffect } from 'react'; // Menambahkan useEffect
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon untuk stub
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
// import api from '../utils/api'; 

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG (6) ---

// 1. Stub untuk ../utils/api
const api = {
    get: (url) => {
        console.log(`[STUB API] GET: ${url}`);
        // Mengembalikan promise yang resolve dengan data roles tiruan
        return Promise.resolve({
            data: {
                items: [
                    { name: 'administrator', display_name: 'Administrator', capabilities: ['manage_options'] },
                    { name: 'editor', display_name: 'Editor', capabilities: ['read', 'read_packages'] },
                    { name: 'agen_lapangan', display_name: 'Agen Lapangan', capabilities: ['read', 'read_jamaah'] }
                ],
                total: 3
            }
        });
    },
    put: (url, data) => {
        console.log(`[STUB API] PUT: ${url}`, data);
        return Promise.resolve({ data: { ...data } });
    },
    post: (url, data) => {
        console.log(`[STUB API] POST: ${url}`, data);
        return Promise.resolve({ data: { ...data } }); 
    },
    delete: (url) => {
         console.log(`[STUB API] DELETE: ${url}`);
         return Promise.resolve();
    }
};

// 2. Stub untuk ../hooks/useCRUD
const useCRUD = (resource) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });
    const [sortBy, setSortBy] = useState({ key: 'name', order: 'asc' });

    // Simulasikan pengambilan data
    const fetchData = () => {
        setLoading(true);
        console.log(`[STUB useCRUD] Fetching ${resource}...`);
        api.get(resource).then(response => {
            setData(response.data.items);
            setPagination(prev => ({ ...prev, totalItems: response.data.total }));
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [resource]); // Hanya fetch sekali saat resource berubah

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
        // Di aplikasi nyata, Anda akan fetchData() lagi dengan parameter halaman
    };
    const handleSearch = (term) => console.log(`[STUB useCRUD] Searching for: ${term}`);
    const handleSort = (key, order) => setSortBy({ key, order });
    
    // Gunakan stub API untuk deleteItem
    const deleteItem = async (id) => {
        await api.delete(`${resource}/${id}`);
        // Panggil fetchData lagi untuk refresh data setelah delete
        fetchData(); 
    };

    // createItem dan updateItem tidak dikembalikan karena komponen ini menggunakan api.put/post secara langsung
    return {
        data, loading, pagination, handlePageChange, handleSearch, handleSort, sortBy,
        deleteItem
    };
};

// 3. Stub untuk ../components/SearchInput
const SearchInput = ({ onSearch, placeholder }) => (
    <input
        type="text"
        placeholder={placeholder || "Cari..."}
        onChange={(e) => onSearch(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    />
);

// 4. Stub untuk ../components/Pagination
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

// 5. Stub untuk ../components/Modal
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

// 6. Stub untuk ../components/CrudTable
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
                            <tr key={item.name} className="hover:bg-gray-50"> {/* Menggunakan name sebagai key unik */}
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

// --- KOMPONEN ASLI 'Roles' ---

// Daftar semua kapabilitas
const allCapabilities = [
    { id: 'read', label: 'Read (Dasar)' },
    { id: 'read_packages', label: 'Lihat Paket' },
    { id: 'manage_packages', label: 'Kelola Paket' },
    { id: 'read_jamaah', label: 'Lihat Jamaah' },
    { id: 'manage_jamaah', label: 'Kelola Jamaah' },
    { id: 'manage_finance', label: 'Kelola Keuangan' },
    { id: 'manage_tasks', label: 'Kelola Tugas' },
    { id: 'manage_categories', label: 'Kelola Kategori' },
    { id: 'manage_flights', label: 'Kelola Penerbangan' },
    { id: 'manage_hotels', label: 'Kelola Hotel' },
    { id: 'manage_departures', label: 'Kelola Keberangkatan' },
    { id: 'view_reports', label: 'Lihat Laporan' },
    { id: 'list_users', label: 'Lihat Staff' },
    { id: 'manage_users', label: 'Kelola Staff' },
    { id: 'manage_roles', label: 'Kelola Roles' },
    { id: 'manage_options', label: 'Super Admin (Semua Akses)' },
];

const Roles = ({ userCapabilities }) => {
    const {
        data: roles,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        deleteItem
    } = useCRUD('roles');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', display_name: '' });
    const [selectedCapabilities, setSelectedCapabilities] = useState([]);

    const columns = [
        { Header: 'ID (Internal)', accessor: 'name', sortable: true },
        { Header: 'Nama Tampilan', accessor: 'display_name', sortable: true },
        { Header: 'Kapabilitas', accessor: 'capabilities', render: (val) => (val || []).join(', ') },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        if (item) {
            setFormData({ name: item.name, display_name: item.display_name });
            setSelectedCapabilities(item.capabilities || []);
        } else {
            setFormData({ name: '', display_name: '' });
            setSelectedCapabilities([]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleCapabilityChange = (cap) => {
        setSelectedCapabilities(prev => 
            prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            capabilities: selectedCapabilities
        };

        try {
            if (currentItem) {
                // Update
                await api.put(`roles/${currentItem.name}`, payload);
            } else {
                // Create
                await api.post('roles', payload);
            }
            // handlePageChange(1); // Ini akan di-trigger oleh useCRUD jika deleteItem me-refresh data
            closeModal();
            // Refresh halaman untuk memuat ulang data global (termasuk roles baru)
            window.location.reload();
        } catch (error) {
            console.error("Gagal menyimpan role:", error);
        }
    };

    const handleDelete = async (item) => {
        if (item.name === 'administrator' || item.name === 'subscriber') {
            // Mengganti alert() yang dilarang dengan console.warn()
            console.warn('Role default WordPress tidak bisa dihapus.');
            return;
        }
        
        // PENTING: window.confirm dilarang.
        // Di aplikasi nyata, gunakan modal konfirmasi kustom.
        console.log(`[STUB] Konfirmasi penghapusan untuk: ${item.display_name}. (Dihapus secara otomatis)`);
        
        // if (window.confirm(`Anda yakin ingin menghapus role "${item.display_name}"?`)) { // BARIS INI DILARANG
            await deleteItem(item.name); // Hapus berdasarkan 'name' (ID)
            // Refresh halaman
            window.location.reload();
        // }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari role..." />
                {userCapabilities.includes('manage_roles') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Role
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={roles}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_roles') ? openModal : null}
                onDelete={userCapabilities.includes('manage_roles') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_roles"
                deleteCapability="manage_roles"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Role' : 'Tambah Role'} show={isModalOpen} onClose={closeModal} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID Internal (Name)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                className="mt-1 block w-full"
                                required
                                disabled={!!currentItem} // Tidak bisa diubah setelah dibuat
                            />
                            <small className="text-gray-500">Hanya huruf kecil, angka, dan underscore. Cth: 'agen_lapangan'</small>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Tampilan</label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                             {/* INI ADALAH PERBAIKAN TYPO: </Gacrux> menjadi </small> */}
                             <small className="text-gray-500">Cth: 'Agen Lapangan'</small>
                        </div>
                    </div>
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-medium text-gray-800 px-2">Kapabilitas</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {allCapabilities.map(cap => (
                                <label key={cap.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedCapabilities.includes(cap.id)}
                                        onChange={() => handleCapabilityChange(cap.id)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">{cap.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Role</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Roles;
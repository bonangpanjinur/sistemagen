// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/pages/
// Nama File: Packages.jsx

import React, { useState, useEffect } from 'react'; // Menambahkan useEffect
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'; // Menambahkan ikon
// Impor-impor yang rusak akan diganti dengan stub di bawah ini:
// import useCRUD from '../hooks/useCRUD';
// import { useData } from '../contexts/DataContext';
// import CrudTable from '../components/CrudTable';
// import Pagination from '../components/Pagination';
// import SearchInput from '../components/SearchInput';
// import Modal from '../components/Modal';
// import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';
// import api from '../utils/api'; 

// --- STUB UNTUK SEMUA DEPENDENSI YANG HILANG (8) ---

// 1. Stub untuk ../utils/api
const api = {
    get: (url) => {
        console.log(`[STUB API] GET: ${url}`);
        const id = url.split('/')[1];
        // Mengembalikan promise yang resolve dengan data paket lengkap tiruan
        return Promise.resolve({
            data: {
                id: id || 1,
                name: 'Paket Mock Detail',
                category_id: 1,
                base_price: 25000000,
                duration: 9,
                status: 'draft',
                start_date: '2025-01-01T00:00:00Z',
                end_date: '2025-01-10T00:00:00Z',
                description: 'Deskripsi mock dari API stub.',
                package_prices: [{ room_type: 'QUAD', price: '25000000' }],
                package_flights: [1], // ID penerbangan tiruan
                package_hotels: [1]  // ID hotel tiruan
            }
        });
    },
    put: (url, data) => {
        console.log(`[STUB API] PUT: ${url}`, data);
        return Promise.resolve({ data: { ...data, id: url.split('/')[1] } });
    },
    post: (url, data) => {
        console.log(`[STUB API] POST: ${url}`, data);
        // Mengembalikan ID tiruan untuk item baru
        return Promise.resolve({ data: { ...data, id: 99 } }); 
    }
};

// 2. Stub untuk ../utils/formatters
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

// 3. Stub untuk ../contexts/DataContext
const useData = () => ({
    // Sediakan data tiruan untuk dropdown
    categories: [
        { id: 1, name: 'Kategori Mock A (dari stub)' },
        { id: 2, name: 'Kategori Mock B (dari stub)' }
    ],
    flights: [
        { id: 1, airline: 'Garuda (Stub)', flight_number: 'GA123' },
        { id: 2, airline: 'Saudia (Stub)', flight_number: 'SV456' }
    ],
    hotels: [
        { id: 1, name: 'Hotel Mock Makkah (Stub)', location: 'Makkah' },
        { id: 2, name: 'Hotel Mock Madinah (Stub)', location: 'Madinah' }
    ],
    // Sediakan fungsi refresh tiruan
    refreshData: (dataType) => {
        console.log(`[STUB useData] Refreshing data for: ${dataType}`);
        return Promise.resolve();
    }
});

// 4. Stub untuk ../hooks/useCRUD
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
                { id: 1, name: 'Paket Mock 1', category_name: 'Umroh Stub', base_price: 25000000, duration: 9, status: 'draft', start_date: '2025-01-01T00:00:00Z' },
                { id: 2, name: 'Paket Mock 2', category_name: 'Haji Stub', base_price: 80000000, duration: 30, status: 'publish', start_date: '2025-06-01T00:00:00Z' },
            ];
            setData(mockData);
            setPagination(prev => ({ ...prev, totalItems: mockData.length }));
            setLoading(false);
        }, 500);
    }, [resource]); // Hanya fetch sekali

    const handlePageChange = (page) => setPagination(prev => ({ ...prev, currentPage: page }));
    const handleSearch = (term) => console.log(`[STUB useCRUD] Searching for: ${term}`);
    const handleSort = (key, order) => setSortBy({ key, order });
    
    // Gunakan stub API untuk fungsi CUD
    const createItem = (item) => api.post(resource, item);
    const updateItem = (id, item) => api.put(`${resource}/${id}`, item);
    const deleteItem = (id) => console.log(`[STUB useCRUD] Deleting item ${id}`);
    
    // Gunakan stub API untuk mengambil data lengkap
    const fetchItemById = (id) => {
         console.log(`[STUB useCRUD] Fetching item by ID: ${id}`);
         return api.get(`${resource}/${id}`).then(res => res.data);
    };

    return {
        data, loading, pagination, handlePageChange, handleSearch, handleSort, sortBy,
        createItem, updateItem, deleteItem, fetchItemById
    };
};

// 5. Stub untuk ../components/SearchInput
const SearchInput = ({ onSearch, placeholder }) => (
    <input
        type="text"
        placeholder={placeholder || "Cari..."}
        onChange={(e) => onSearch(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    />
);

// 6. Stub untuk ../components/Pagination
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

// 7. Stub untuk ../components/Modal
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

// 8. Stub untuk ../components/CrudTable
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


// --- KOMPONEN ASLI 'Packages' ---

const Packages = ({ userCapabilities }) => {
    const {
        data: packages,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem,
        fetchItemById // Kita butuh ini untuk data relasi
    } = useCRUD('packages');
    
    // Ambil data global dari context (stub)
    const { categories, flights, hotels, refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    
    // State untuk relasi (harga, penerbangan, hotel)
    const [packagePrices, setPackagePrices] = useState([{ room_type: 'QUAD', price: '' }]);
    const [packageFlights, setPackageFlights] = useState([]);
    const [packageHotels, setPackageHotels] = useState([]);

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Paket', accessor: 'name', sortable: true },
        { Header: 'Kategori', accessor: 'category_name', sortable: true },
        { Header: 'Harga Dasar', accessor: 'base_price', sortable: true, render: (val) => formatCurrency(val) },
        { Header: 'Durasi (hari)', accessor: 'duration', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true },
        { Header: 'Tgl Mulai', accessor: 'start_date', sortable: true, render: (val) => formatDate(val) },
    ];

    // Fungsi untuk membuka modal (Tambah/Edit)
    const openModal = async (item = null) => {
        if (item) {
            // Jika EDIT, ambil data lengkap termasuk relasi
            const fullItem = await fetchItemById(item.id);
            setCurrentItem(fullItem);
            setFormData({
                ...fullItem,
                start_date: formatDateForInput(fullItem.start_date),
                end_date: formatDateForInput(fullItem.end_date),
            });
            // Set state relasi
            setPackagePrices(fullItem.package_prices.length > 0 ? fullItem.package_prices : [{ room_type: 'QUAD', price: '' }]);
            setPackageFlights(fullItem.package_flights.map(f => f.id));
            setPackageHotels(fullItem.package_hotels.map(h => h.id));
        } else {
            // Jika TAMBAH, reset form
            setCurrentItem(null);
            setFormData({
                name: '', description: '', category_id: '', base_price: '',
                duration: '', status: 'draft', start_date: '', end_date: '',
                capacity: '' // Tambahkan field yg hilang di form
            });
            // Reset state relasi
            setPackagePrices([{ room_type: 'QUAD', price: '' }]);
            setPackageFlights([]);
            setPackageHotels([]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    // Fungsi untuk menyimpan data relasi (harga, penerbangan, hotel)
    const saveRelations = async (packageId) => {
        try {
            await api.put(`packages/${packageId}/relations`, {
                package_prices: packagePrices.filter(p => p.price), // Hanya kirim yg ada harganya
                package_flights: packageFlights,
                package_hotels: packageHotels,
            });
        } catch (error) {
            console.error("Gagal menyimpan relasi paket:", error);
        }
    };

    // Handle submit form utama (Info Paket)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentItem) {
            // UPDATE
            const response = await updateItem(currentItem.id, formData);
            await saveRelations(currentItem.id);
            await refreshData('packages'); // Refresh data global
        } else {
            // CREATE
            const response = await createItem(formData);
            if (response && response.data && response.data.id) {
                await saveRelations(response.data.id);
            }
            await refreshData('packages'); // Refresh data global
        }
        closeModal();
    };

    const handleDelete = async (item) => {
        // PENTING: window.confirm dilarang.
        // Di aplikasi nyata, gunakan modal konfirmasi kustom.
        console.log(`[STUB] Konfirmasi penghapusan untuk: ${item.name}. (Dihapus secara otomatis)`);
        
        // if (window.confirm(`Anda yakin ingin menghapus paket "${item.name}"?`)) { // BARIS INI DILARANG
            await deleteItem(item.id);
            await refreshData('packages'); // Refresh data global
        // }
    };
    
    // Handler untuk form harga
    const handlePriceChange = (index, field, value) => {
        const newPrices = [...packagePrices];
        newPrices[index][field] = value;
        setPackagePrices(newPrices);
    };
    const addPriceRow = () => setPackagePrices([...packagePrices, { room_type: '', price: '' }]);
    const removePriceRow = (index) => setPackagePrices(packagePrices.filter((_, i) => i !== index));

    // Helper untuk memastikan nilai form adalah 'controlled'
    const getFormValue = (key) => formData[key] || '';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari paket..." />
                {userCapabilities.includes('manage_packages') && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Paket
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={packages}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={userCapabilities.includes('manage_packages') ? openModal : null}
                onDelete={userCapabilities.includes('manage_packages') ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_packages"
                deleteCapability="manage_packages"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Paket' : 'Tambah Paket'} show={isModalOpen} onClose={closeModal} size="max-w-6xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bagian 1: Info Dasar Paket */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-medium text-gray-800 px-2">Info Dasar</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                                <input type="text" value={getFormValue('name')} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <select value={getFormValue('category_id')} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="mt-1 block w-full" required>
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full">
                                    <option value="draft">Draft</option>
                                    <option value="publish">Publish</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Harga Dasar (IDR)</label>
                                <input type="number" value={getFormValue('base_price')} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="mt-1 block w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Durasi (hari)</label>
                                <input type="number" value={getFormValue('duration')} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="mt-1 block w-full" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Kapasitas (Pax)</label>
                                <input type="number" value={getFormValue('capacity')} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="mt-1 block w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tgl Mulai</label>
                                <input type="date" value={getFormValue('start_date')} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="mt-1 block w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tgl Selesai</label>
                                <input type="date" value={getFormValue('end_date')} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="mt-1 block w-full" />
                            </div>
                             <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea rows="3" value={getFormValue('description')} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full"></textarea>
                            </div>
                        </div>
                    </fieldset>

                    {/* Bagian 2: Relasi (Harga, Penerbangan, Hotel) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Harga Kamar */}
                        <fieldset className="border p-4 rounded-md lg:col-span-1">
                            <legend className="text-lg font-medium text-gray-800 px-2">Harga Kamar</legend>
                            {packagePrices.map((price, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <select value={price.room_type} onChange={(e) => handlePriceChange(index, 'room_type', e.target.value)} className="mt-1 block w-1/2">
                                        <option value="QUAD">QUAD</option>
                                        <option value="TRIPLE">TRIPLE</option>
                                        <option value="DOUBLE">DOUBLE</option>
                                    </select>
                                    <input type="number" placeholder="Harga" value={price.price} onChange={(e) => handlePriceChange(index, 'price', e.target.value)} className="mt-1 block w-1/2" />
                                    <button type="button" onClick={() => removePriceRow(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addPriceRow} className="text-sm text-blue-600 hover:text-blue-800">+ Tambah Harga</button>
                        </fieldset>

                        {/* Penerbangan */}
                        <fieldset className="border p-4 rounded-md lg:col-span-1">
                            <legend className="text-lg font-medium text-gray-800 px-2">Penerbangan</legend>
                            <select multiple value={packageFlights} onChange={(e) => setPackageFlights(Array.from(e.target.selectedOptions, option => option.value))} className="mt-1 block w-full h-32">
                                {flights.map(f => <option key={f.id} value={f.id}>{f.airline} ({f.flight_number})</option>)}
                            </select>
                            <small className="text-gray-500">Tahan Ctrl/Cmd untuk memilih lebih dari satu.</small>
                        </fieldset>

                        {/* Hotel */}
                        <fieldset className="border p-4 rounded-md lg:col-span-1">
                            <legend className="text-lg font-medium text-gray-800 px-2">Hotel</legend>
                            <select multiple value={packageHotels} onChange={(e) => setPackageHotels(Array.from(e.target.selectedOptions, option => option.value))} className="mt-1 block w-full h-32">
                                {hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.location})</option>)}
                            </select>
                            <small className="text-gray-500">Tahan Ctrl/Cmd untuk memilih lebih dari satu.</small>
                        </fieldset>
                    </div>
                    
                    {/* Tombol Simpan */}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;
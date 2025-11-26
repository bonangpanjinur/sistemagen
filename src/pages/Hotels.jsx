import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD.js';
import CrudTable from '../components/CrudTable.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import { useData } from '../contexts/DataContext.jsx'; // Path import sudah benar

const Hotels = ({ userCapabilities }) => {
    // Menggunakan useCRUD dengan alias yang aman
    const {
        items: hotels, // Gunakan 'items' dari hook yang sudah diperbaiki
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem,
        fetchItems
    } = useCRUD('hotels');
    
    // Mengambil fungsi refreshData global
    const { refreshData } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Definisi Kolom
    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Hotel', accessor: 'name', sortable: true },
        { Header: 'Kota', accessor: 'city', sortable: true },
        { 
            Header: 'Bintang', 
            accessor: 'rating', 
            sortable: true, 
            render: (val) => (
                <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{val || '?'}</span>
                </div>
            ) 
        },
        { Header: 'Telepon', accessor: 'phone' },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        const defaultData = { name: '', city: '', rating: 3, phone: '', address: '', country: '' };
        setFormData(item ? { ...defaultData, ...item } : defaultData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await updateItem(currentItem.id, formData);
            } else {
                await createItem(formData);
            }
            // Refresh data lokal dan global jika perlu
            await fetchItems(); 
            await refreshData('hotels'); 
            closeModal();
        } catch (error) {
            console.error("Error saving hotel:", error);
            alert("Gagal menyimpan data. Silakan coba lagi.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus hotel "${item.name}"?`)) {
            try {
                await deleteItem(item.id);
                await refreshData('hotels');
            } catch (error) {
                console.error("Error deleting hotel:", error);
                alert("Gagal menghapus data.");
            }
        }
    };
    
    const getFormValue = (key) => formData[key] || '';
    
    // Cek Capability dengan aman
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_hotels') || caps.includes('manage_options');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Data Hotel</h1>
                    <p className="text-sm text-gray-500">Kelola database hotel untuk paket umroh.</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari hotel..." />
                    
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                            <Plus size={18} className="mr-1" />
                            Tambah Hotel
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={hotels}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_hotels"
                deleteCapability="manage_hotels"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal 
                title={currentItem ? 'Edit Hotel' : 'Tambah Hotel'} 
                show={isModalOpen} 
                onClose={closeModal} 
                size="max-w-3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Hotel</label>
                            <input type="text" id="name" value={getFormValue('name')} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border p-2 rounded" required placeholder="Contoh: Hilton Makkah" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota</label>
                            <input type="text" id="city" value={getFormValue('city')} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full border p-2 rounded" required placeholder="Makkah / Madinah" />
                        </div>
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Bintang (Rating)</label>
                            <select id="rating" value={getFormValue('rating')} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="mt-1 block w-full border p-2 rounded">
                                <option value="1">1 Bintang</option>
                                <option value="2">2 Bintang</option>
                                <option value="3">3 Bintang</option>
                                <option value="4">4 Bintang</option>
                                <option value="5">5 Bintang</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" id="phone" value={getFormValue('phone')} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full border p-2 rounded" />
                        </div>
                         <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Negara</label>
                            <input type="text" id="country" value={getFormValue('country')} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="mt-1 block w-full border p-2 rounded" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                        <textarea id="address" rows="3" value={getFormValue('address')} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1 block w-full border p-2 rounded"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Hotels;
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { useData } from '../contexts/DataContext';

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
        { Header: 'Kota', accessor: 'city', sortable: true },
        { Header: 'Bintang', accessor: 'rating', sortable: true, render: (val) => `${val || '?'} Bintang` },
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
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('hotels'); // Refresh data global
        }
    };
    
    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_hotels') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari hotel..." />
                {canManage && (
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
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
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
                            <input type="text" id="name" value={getFormValue('name')} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota</label>
                            <input type="text" id="city" value={getFormValue('city')} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Bintang (Rating)</label>
                            <select id="rating" value={getFormValue('rating')} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="mt-1 block w-full">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" id="phone" value={getFormValue('phone')} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full" />
                        </div>
                         <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Negara</label>
                            <input type="text" id="country" value={getFormValue('country')} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="mt-1 block w-full" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                        <textarea id="address" rows="3" value={getFormValue('address')} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1 block w-full"></textarea>
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
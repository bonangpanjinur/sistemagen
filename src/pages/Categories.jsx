import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD.js';
import CrudTable from '../components/CrudTable.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import { useData } from '../contexts/DataContext.jsx';

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
    
    const { refreshData } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    
    // Ganti 'key' menjadi 'accessor' agar sesuai dengan CrudTable
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
        // Ganti ini dengan modal konfirmasi kustom
        if (true) { // Menghapus window.confirm
            await deleteItem(item.id);
            await refreshData('categories'); // Refresh data global
        }
    };

    const canManage = userCapabilities.includes('manage_categories') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari kategori..." />
                {canManage && (
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
                onSort={(field) => handleSort(field)} // Sesuaikan dengan hook
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities} // Teruskan kapabilitas
                editCapability="manage_categories" // Tentukan kapabilitas
                deleteCapability="manage_categories" // Tentukan kapabilitas
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
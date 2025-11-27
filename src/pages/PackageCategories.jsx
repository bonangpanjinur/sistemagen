import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Tag } from 'lucide-react';

const PackageCategories = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/package-categories');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || {});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Generate slug sederhana dari nama jika kosong
        if (!formData.slug && formData.name) {
            formData.slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Kategori', accessor: 'name', sortable: true },
        { header: 'Slug', accessor: 'slug', render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{r.slug}</span> },
        { header: 'Deskripsi', accessor: 'description' },
    ];

    return (
        <Layout title="Kategori Paket (Master Data)">
            <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-blue-800">Manajemen Kategori</h3>
                    <p className="text-sm text-blue-600">Buat varian paket seperti: Ramadhan, Awal Tahun, Furoda, Umroh Plus.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Tambah Kategori
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
                userCapabilities={user?.role}
                editCapability="manage_options"
                deleteCapability="manage_options"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                        <input type="text" className="mt-1 w-full border rounded p-2" 
                            placeholder="Contoh: Umroh Ramadhan"
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug (Opsional)</label>
                        <input type="text" className="mt-1 w-full border rounded p-2 bg-gray-50" 
                            placeholder="umroh-ramadhan (Auto generate jika kosong)"
                            value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea className="mt-1 w-full border rounded p-2" rows="3"
                            value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded text-gray-700">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default PackageCategories;
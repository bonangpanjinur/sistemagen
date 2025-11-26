import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const PackageCategories = () => {
    const columns = [
        { header: 'Nama Kategori', accessor: 'name' },
        { header: 'Slug', accessor: 'slug' },
        { header: 'Deskripsi', accessor: 'description' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/package-categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', slug: '', description: '' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    // Auto-generate slug dari nama
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setFormData({ ...formData, name, slug });
    };

    return (
        <Layout title="Kategori Paket">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Master Kategori</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Kategori</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Kategori" : "Kategori Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Kategori</label>
                        <input className="w-full border p-2 rounded" value={formData.name} onChange={handleNameChange} required placeholder="Contoh: Umroh Ramadhan" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Slug (URL Friendly)</label>
                        <input className="w-full border p-2 rounded bg-gray-100" value={formData.slug} readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Deskripsi</label>
                        <textarea className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Kategori</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default PackageCategories;
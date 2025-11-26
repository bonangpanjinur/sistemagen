import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Hotels = () => {
    const columns = [
        { header: 'Nama Hotel', accessor: 'name' },
        { header: 'Kota', accessor: 'city' },
        { header: 'Bintang', accessor: 'rating', render: (row) => '⭐'.repeat(row.rating || 0) },
        { header: 'Kontak', accessor: 'contact_person' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hotels');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        city: 'Makkah',
        country: 'Saudi Arabia',
        rating: 5,
        address: '',
        contact_person: '',
        phone: '',
        email: ''
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', city: 'Makkah', country: 'Saudi Arabia', rating: 5, address: '', contact_person: '', phone: '', email: '' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Data Hotel">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Master Hotel</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Hotel</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Hotel" : "Tambah Hotel"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Hotel</label>
                        <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Kota</label>
                            <select className="w-full border p-2 rounded" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Rating Bintang</label>
                            <select className="w-full border p-2 rounded" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
                                <option value="3">3 Bintang</option>
                                <option value="4">4 Bintang</option>
                                <option value="5">5 Bintang</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Alamat Lengkap</label>
                        <textarea className="w-full border p-2 rounded" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Contact Person</label>
                            <input className="w-full border p-2 rounded" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Telepon</label>
                            <input className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Data</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Hotels;
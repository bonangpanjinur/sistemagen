import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, MapPin, Star } from 'lucide-react';

const Hotels = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hotels');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ location: 'Makkah', rating: '5' });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { location: 'Makkah', rating: '5' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Hotel', accessor: 'name', sortable: true },
        { header: 'Lokasi', accessor: 'location', render: r => <span className="badge bg-blue-100 text-blue-800">{r.location}</span> },
        { header: 'Bintang', accessor: 'rating', render: r => <div className="flex text-yellow-500">{[...Array(parseInt(r.rating||0))].map((_,i)=><Star key={i} size={12} fill="currentColor"/>)}</div> },
        { header: 'Jarak', accessor: 'distance', render: r => `${r.distance} m` },
    ];

    return (
        <Layout title="Master Data Hotel">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18}/> Tambah Hotel
                </button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Hotel' : 'Edit Hotel'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Nama Hotel" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <select className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                        <option value="Makkah">Makkah</option>
                        <option value="Madinah">Madinah</option>
                        <option value="Jeddah">Jeddah</option>
                        <option value="Transit">Transit</option>
                    </select>
                    <select className="w-full border p-2 rounded" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
                        <option value="3">3 Bintang</option>
                        <option value="4">4 Bintang</option>
                        <option value="5">5 Bintang</option>
                    </select>
                    <input type="number" className="w-full border p-2 rounded" placeholder="Jarak ke Masjid (m)" value={formData.distance || ''} onChange={e => setFormData({...formData, distance: e.target.value})} />
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Hotels;
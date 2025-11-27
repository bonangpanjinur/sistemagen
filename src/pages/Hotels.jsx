import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, MapPin, Star } from 'lucide-react';

const Hotels = () => {
    const { user } = useData();
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
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Hotel', accessor: 'name', sortable: true },
        { header: 'Lokasi', accessor: 'location', render: (row) => (
            <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${row.location === 'Makkah' ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'}`}>
                <MapPin size={10} /> {row.location}
            </span>
        )},
        { header: 'Bintang', accessor: 'rating', render: (row) => (
            <div className="flex text-yellow-500">
                {[...Array(parseInt(row.rating || 0))].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            </div>
        )},
        { header: 'Jarak (m)', accessor: 'distance' },
    ];

    return (
        <Layout title="Master Data Hotel">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Tambah Hotel
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Hotel' : 'Edit Hotel'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Hotel</label>
                        <input type="text" className="mt-1 block w-full rounded border p-2" 
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                            <select className="mt-1 block w-full rounded border p-2"
                                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Transit">Transit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rating Bintang</label>
                            <select className="mt-1 block w-full rounded border p-2"
                                value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
                                <option value="3">3 Bintang</option>
                                <option value="4">4 Bintang</option>
                                <option value="5">5 Bintang</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jarak ke Masjid (meter)</label>
                        <input type="number" className="mt-1 block w-full rounded border p-2" 
                            value={formData.distance || ''} onChange={e => setFormData({...formData, distance: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Hotels;
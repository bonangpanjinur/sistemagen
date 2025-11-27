import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Plane } from 'lucide-react';

const Flights = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/flights');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { status: 'active', type: 'International' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Maskapai', accessor: 'name', sortable: true },
        { header: 'Kode IATA', accessor: 'code', render: r => <span className="font-mono font-bold">{r.code}</span> },
        { header: 'Tipe', accessor: 'type' },
        { header: 'Status', accessor: 'status' }
    ];

    return (
        <Layout title="Master Data Maskapai">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={18}/> Tambah Maskapai
                </button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Maskapai' : 'Edit Maskapai'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Nama Maskapai" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <input className="w-full border p-2 rounded" placeholder="Kode IATA (Misal: GA)" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                    <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="International">International</option>
                        <option value="Domestic">Domestik</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Flights;
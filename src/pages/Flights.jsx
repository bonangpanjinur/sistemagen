import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Plane } from 'lucide-react';

const Flights = () => {
    const { user } = useData();
    // Endpoint ini menyimpan data Master Maskapai
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/flights');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { status: 'active' });
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
        { header: 'Nama Maskapai', accessor: 'name', sortable: true },
        { header: 'Kode (IATA)', accessor: 'code', render: (row) => <span className="font-mono bg-gray-100 px-2 rounded">{row.code}</span> },
        { header: 'Tipe', accessor: 'type', render: (row) => row.type || 'International' },
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
    ];

    return (
        <Layout title="Master Data Maskapai">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Tambah Maskapai
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Maskapai' : 'Edit Maskapai'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Maskapai</label>
                        <input type="text" className="mt-1 block w-full rounded border p-2" placeholder="Contoh: Garuda Indonesia"
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kode Maskapai</label>
                            <input type="text" className="mt-1 block w-full rounded border p-2" placeholder="Contoh: GA"
                                value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe</label>
                            <select className="mt-1 block w-full rounded border p-2"
                                value={formData.type || 'International'} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="International">International</option>
                                <option value="Domestic">Domestik</option>
                                <option value="Charter">Charter</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo URL (Opsional)</label>
                        <input type="text" className="mt-1 block w-full rounded border p-2" placeholder="https://..."
                            value={formData.logo_url || ''} onChange={e => setFormData({...formData, logo_url: e.target.value})} />
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

export default Flights;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Marketing = () => {
    const columns = [
        { header: 'Nama Kampanye', accessor: 'name' },
        { header: 'Tipe', accessor: 'type' },
        { 
            header: 'Budget', 
            accessor: 'budget',
            render: (row) => `Rp ${parseInt(row.budget || 0).toLocaleString('id-ID')}`
        },
        { header: 'Periode', accessor: 'end_date', render: (row) => `${row.start_date} s/d ${row.end_date}` },
        { header: 'Status', accessor: 'status' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/marketing');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Online Ads',
        start_date: '',
        end_date: '',
        budget: 0,
        status: 'planned'
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', type: 'Online Ads', start_date: '', end_date: '', budget: 0, status: 'planned' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Marketing & Kampanye">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Kampanye</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Buat Kampanye</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Kampanye" : "Kampanye Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Kampanye</label>
                        <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Promo Ramadhan 2024" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Tipe</label>
                            <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="Online Ads">Iklan Online (FB/IG/Google)</option>
                                <option value="Offline Event">Event Offline / Pameran</option>
                                <option value="Partnership">Partnership</option>
                                <option value="Social Media">Konten Sosmed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Budget</label>
                            <input className="w-full border p-2 rounded" type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Mulai</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Selesai</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Status</label>
                        <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="planned">Direncanakan</option>
                            <option value="active">Sedang Berjalan</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Kampanye</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Marketing;
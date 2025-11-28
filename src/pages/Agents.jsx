import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import CrudTable from '../components/CrudTable.jsx';
import Modal from '../components/Modal.jsx';
import useCRUD from '../hooks/useCRUD.js';
import { Plus, Users } from 'lucide-react';

const Agents = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Support hierarchical agents
    const masterAgents = data?.filter(a => !a.parent_id) || [];
    
    const initialForm = { name: '', phone: '', city: '', type: 'master', parent_id: '', commission_rate: 0 };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Bersihkan parent_id jika tipe master
        const payload = { ...formData };
        if (payload.type === 'master') payload.parent_id = null;
        
        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', render: r => <div className="font-bold flex gap-2"><Users size={16}/> {r.name}<br/><span className="text-xs font-normal text-gray-500">{r.code}</span></div> },
        { header: 'Tipe', accessor: 'type', render: r => <span className={`badge uppercase ${r.type === 'master' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>{r.type === 'master' ? 'Master Agen' : 'Sub Agen'}</span> },
        { header: 'Kota', accessor: 'city' },
        { header: 'Kontak', accessor: 'phone' },
        { header: 'Komisi', accessor: 'commission_rate', render: r => r.commission_rate + '%' }
    ];

    return (
        <Layout title="Data Agen & Mitra">
            <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Tambah Agen</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={item => handleOpenModal('edit', item)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Agen">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Nama Lengkap</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                        <div><label className="label">No. HP / WA</label><input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Kota</label><input className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                        <div><label className="label">Persentase Komisi (%)</label><input type="number" className="input-field" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: e.target.value})} /></div>
                    </div>
                    
                    {/* HIERARKI AGEN */}
                    <div>
                        <label className="label">Tipe Kemitraan</label>
                        <select className="input-field mb-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="master">Master Agen (Pusat)</option>
                            <option value="sub">Sub Agen (Bawahan)</option>
                        </select>
                        
                        {formData.type === 'sub' && (
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 animate-fade-in">
                                <label className="label">Induk Agen (Upline)</label>
                                <select className="input-field" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} required>
                                    <option value="">-- Pilih Master Agen --</option>
                                    {masterAgents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Agents;
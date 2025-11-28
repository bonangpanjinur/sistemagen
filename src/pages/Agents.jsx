import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Users, UserCheck } from 'lucide-react';

const Agents = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Filter untuk Master Agent (sebagai parent option)
    const masterAgents = data ? data.filter(a => a.type === 'master') : [];
    
    const [formData, setFormData] = useState({ name: '', phone: '', city: '', type: 'master', parent_id: '', commission_rate: 0 });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { name: '', phone: '', city: '', type: 'master', parent_id: '', commission_rate: 0 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Jika tipe master, kosongkan parent_id
        const payload = { ...formData, parent_id: formData.type === 'master' ? null : formData.parent_id };
        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', className: 'font-bold' },
        { header: 'Tipe', accessor: 'type', render: r => (
            <span className={`badge uppercase text-xs ${r.type === 'master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-50 text-blue-600'}`}>
                {r.type === 'master' ? 'Master Agen' : 'Sub Agen'}
            </span>
        )},
        { header: 'Kota', accessor: 'city' },
        { header: 'Kontak', accessor: 'phone' },
        { header: 'Komisi', accessor: 'commission_rate', render: r => r.commission_rate + '%' }
    ];

    return (
        <Layout title="Agen & Kemitraan">
            <div className="mb-4 bg-white p-4 rounded border flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-700">Struktur Kemitraan</h3>
                    <p className="text-sm text-gray-500">Kelola Master Agen dan Sub Agen di sini.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Tambah Agen Baru</button>
            </div>
            
            <CrudTable columns={columns} data={data} loading={loading} onEdit={item => handleOpenModal('edit', item)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Agen">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Nama Lengkap</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                        <div><label className="label">No. HP / WA</label><input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                    </div>
                    
                    <div>
                        <label className="label">Tipe Kemitraan</label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="master" checked={formData.type === 'master'} onChange={e => setFormData({...formData, type: e.target.value})} />
                                <span className="text-sm font-medium">Master Agen (Pusat)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="sub" checked={formData.type === 'sub'} onChange={e => setFormData({...formData, type: e.target.value})} />
                                <span className="text-sm font-medium">Sub Agen (Bawahan)</span>
                            </label>
                        </div>
                    </div>

                    {/* Jika Sub Agen, pilih Parent */}
                    {formData.type === 'sub' && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 animate-fade-in">
                            <label className="label text-yellow-800">Induk Agen (Upline)</label>
                            <select className="input-field" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} required>
                                <option value="">-- Pilih Master Agen --</option>
                                {masterAgents.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} - {a.city}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Kota Domisili</label><input className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                        <div><label className="label">Komisi (%)</label><input type="number" className="input-field" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: e.target.value})} /></div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4"><button className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Agents;
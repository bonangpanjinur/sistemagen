import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Users, UserCheck, Link as LinkIcon } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Agents = () => {
    const { user } = useData();
    const { data: agents, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [activeTab, setActiveTab] = useState('master'); 
    
    const [formData, setFormData] = useState({ 
        type: 'master', 
        status: 'active',
        commission_rate: 0 
    });

    // Filter Data
    const masterAgents = useMemo(() => {
        return Array.isArray(agents) ? agents.filter(a => a.type === 'master' || !a.parent_id) : [];
    }, [agents]);

    const subAgents = useMemo(() => {
        return Array.isArray(agents) ? agents.filter(a => a.type === 'sub' && a.parent_id) : [];
    }, [agents]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        if (item) {
            setFormData(item);
            if (item.type === 'sub') setActiveTab('sub');
            else setActiveTab('master');
        } else {
            setFormData({
                type: activeTab, 
                status: 'active',
                commission_rate: activeTab === 'master' ? 500000 : 250000, // Default IDR
                parent_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.type === 'sub' && !formData.parent_id) {
            alert("Harap pilih Agen Induk untuk Sub-Agen ini.");
            return;
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) setIsModalOpen(false);
    };

    const masterColumns = [
        { header: 'Nama Agen', accessor: 'name', sortable: true },
        { header: 'Kode (Auto)', accessor: 'code', render: row => <span className="font-mono bg-blue-50 text-blue-700 px-2 rounded font-bold">{row.code || 'AUTO'}</span> },
        { header: 'Telepon', accessor: 'phone' },
        { header: 'Kota', accessor: 'city' },
        { header: 'Jml Sub-Agen', accessor: 'id', render: row => {
            const count = subAgents.filter(sub => sub.parent_id == row.id).length;
            return <span className="font-bold badge bg-gray-100 px-2 rounded">{count}</span>;
        }},
        { header: 'Komisi (IDR)', accessor: 'commission_rate', render: row => formatCurrency(row.commission_rate) },
        { header: 'Status', accessor: 'status', render: row => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
    ];

    const subColumns = [
        { header: 'Nama Sub-Agen', accessor: 'name', sortable: true },
        { header: 'Kode (Auto)', accessor: 'code', render: row => <span className="font-mono bg-purple-50 text-purple-700 px-2 rounded font-bold">{row.code || 'AUTO'}</span> },
        { header: 'Induk', accessor: 'parent_id', render: row => {
            const parent = masterAgents.find(m => m.id == row.parent_id);
            return (
                <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                    <LinkIcon size={12} />
                    {parent ? parent.name : 'Unknown'}
                </div>
            );
        }},
        { header: 'Telepon', accessor: 'phone' },
        { header: 'Komisi (IDR)', accessor: 'commission_rate', render: row => formatCurrency(row.commission_rate) },
        { header: 'Status', accessor: 'status', render: row => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Keagenan">
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button onClick={() => setActiveTab('master')} className={`pb-2 px-4 flex items-center gap-2 ${activeTab === 'master' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>
                    <UserCheck size={18}/> Data Agen (Master)
                </button>
                <button onClick={() => setActiveTab('sub')} className={`pb-2 px-4 flex items-center gap-2 ${activeTab === 'sub' ? 'border-b-2 border-purple-600 text-purple-600 font-bold' : 'text-gray-500'}`}>
                    <Users size={18}/> Data Sub-Agen
                </button>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">Total: <span className="font-bold">{activeTab === 'master' ? masterAgents.length : subAgents.length}</span> Data</div>
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> 
                    {activeTab === 'master' ? 'Tambah Agen Master' : 'Tambah Sub-Agen'}
                </button>
            </div>

            <CrudTable
                columns={activeTab === 'master' ? masterColumns : subColumns}
                data={activeTab === 'master' ? masterAgents : subAgents}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Mitra Baru' : 'Edit Mitra'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" value={formData.type || activeTab} />

                    {(activeTab === 'sub' || formData.type === 'sub') && (
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                            <label className="block text-sm font-bold text-purple-800 mb-1">Induk Agen (Upline) <span className="text-red-500">*</span></label>
                            <select className="mt-1 block w-full rounded border p-2"
                                value={formData.parent_id || ''}
                                onChange={e => setFormData({...formData, parent_id: e.target.value, type: 'sub'})} required>
                                <option value="">-- Pilih Upline --</option>
                                {masterAgents.map(agent => <option key={agent.id} value={agent.id}>{agent.name} ({agent.code})</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text" className="mt-1 block w-full rounded border p-2" 
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. Telepon / WA</label>
                            <input type="text" className="mt-1 block w-full rounded border p-2" 
                                value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kota</label>
                            <input type="text" className="mt-1 block w-full rounded border p-2" 
                                value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                    </div>

                    {/* FIELD KODE OTOMATIS */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kode Agen</label>
                        <input type="text" className="mt-1 block w-full rounded border p-2 bg-gray-100 text-gray-500" 
                            value={formData.code || 'Otomatis dibuat oleh sistem'} disabled />
                        <p className="text-[10px] text-gray-400 mt-1">Kode akan digenerate otomatis setelah disimpan.</p>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">Fee / Komisi (Rp)</label>
                         <input type="number" className="mt-1 block w-full rounded border p-2" 
                            value={formData.commission_rate || ''} onChange={e => setFormData({...formData, commission_rate: e.target.value})} />
                         <p className="text-[10px] text-gray-500">Nominal komisi per jamaah (Rupiah).</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Agents;
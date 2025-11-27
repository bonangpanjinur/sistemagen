import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Users, UserCheck, Link as LinkIcon, Phone, MapPin } from 'lucide-react';

const Agents = () => {
    const { user } = useData();
    const { data: agents, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [activeTab, setActiveTab] = useState('master'); // 'master' or 'sub'
    
    // Default form data
    const [formData, setFormData] = useState({ 
        type: 'master', 
        status: 'active',
        commission_rate: 0 
    });

    // --- FILTER DATA ---
    // Pisahkan Agen Master dan Sub-Agen
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
            // Otomatis set tab jika edit
            if (item.type === 'sub') setActiveTab('sub');
            else setActiveTab('master');
        } else {
            // Reset form based on active tab
            setFormData({
                type: activeTab, // 'master' or 'sub'
                status: 'active',
                commission_rate: activeTab === 'master' ? 10 : 5, // Default komisi beda
                parent_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi: Sub Agen wajib punya induk
        if (formData.type === 'sub' && !formData.parent_id) {
            alert("Harap pilih Agen Induk untuk Sub-Agen ini.");
            return;
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) setIsModalOpen(false);
    };

    // Columns untuk Master Agen
    const masterColumns = [
        { header: 'Nama Agen', accessor: 'name', sortable: true },
        { header: 'Kode', accessor: 'code', render: row => <span className="font-mono bg-blue-50 text-blue-700 px-2 rounded">{row.code || '-'}</span> },
        { header: 'Telepon', accessor: 'phone' },
        { header: 'Kota', accessor: 'city' },
        { header: 'Jml Sub-Agen', accessor: 'id', render: row => {
            // Hitung sub agen yang menginduk ke agen ini
            const count = subAgents.filter(sub => sub.parent_id == row.id).length;
            return <span className="font-bold">{count}</span>;
        }},
        { header: 'Status', accessor: 'status', render: row => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
    ];

    // Columns untuk Sub Agen
    const subColumns = [
        { header: 'Nama Sub-Agen', accessor: 'name', sortable: true },
        { header: 'Menginduk Ke', accessor: 'parent_id', render: row => {
            const parent = masterAgents.find(m => m.id == row.parent_id);
            return (
                <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                    <LinkIcon size={12} />
                    {parent ? parent.name : 'Unknown Parent'}
                </div>
            );
        }},
        { header: 'Telepon', accessor: 'phone' },
        { header: 'Kota', accessor: 'city' },
        { header: 'Status', accessor: 'status', render: row => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Keagenan">
            {/* TABS NAVIGATION */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('master')}
                    className={`pb-2 px-4 flex items-center gap-2 ${activeTab === 'master' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                >
                    <UserCheck size={18}/> Data Agen (Master)
                </button>
                <button 
                    onClick={() => setActiveTab('sub')}
                    className={`pb-2 px-4 flex items-center gap-2 ${activeTab === 'sub' ? 'border-b-2 border-purple-600 text-purple-600 font-bold' : 'text-gray-500'}`}
                >
                    <Users size={18}/> Data Sub-Agen
                </button>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Total {activeTab === 'master' ? 'Agen Master' : 'Sub-Agen'}: 
                    <span className="font-bold ml-1 text-gray-800">
                        {activeTab === 'master' ? masterAgents.length : subAgents.length}
                    </span>
                </div>
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
                userCapabilities={user?.role}
                editCapability="manage_options"
            />

            {/* MODAL FORM */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' 
                    ? (activeTab === 'master' ? 'Tambah Agen Baru' : 'Tambah Sub-Agen Baru') 
                    : 'Edit Data Agen'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* HIDDEN FIELD TYPE */}
                    <input type="hidden" value={formData.type || activeTab} />

                    {/* PILIH INDUK (KHUSUS SUB AGEN) */}
                    {(activeTab === 'sub' || formData.type === 'sub') && (
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                            <label className="block text-sm font-bold text-purple-800 mb-1">Menginduk ke Agen (Parent) <span className="text-red-500">*</span></label>
                            <select 
                                className="mt-1 block w-full rounded border-purple-300 shadow-sm p-2 border"
                                value={formData.parent_id || ''}
                                onChange={e => setFormData({...formData, parent_id: e.target.value, type: 'sub'})}
                                required
                            >
                                <option value="">-- Pilih Agen Induk --</option>
                                {masterAgents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name} - {agent.city}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Sub-agen wajib memiliki agen induk untuk perhitungan fee/komisi.</p>
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
                            <label className="block text-sm font-medium text-gray-700">Kota Domisili</label>
                            <input type="text" className="mt-1 block w-full rounded border p-2" 
                                value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                        <textarea className="mt-1 block w-full rounded border p-2" rows="2"
                            value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kode Agen (Opsional)</label>
                            <input type="text" className="mt-1 block w-full rounded border p-2 bg-gray-50" 
                                placeholder="Auto jika kosong"
                                value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Fee / Komisi ($)</label>
                             <input type="number" className="mt-1 block w-full rounded border p-2" 
                                value={formData.commission_rate || ''} onChange={e => setFormData({...formData, commission_rate: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Agents;
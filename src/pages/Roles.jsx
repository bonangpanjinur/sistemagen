import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { ShieldCheck } from 'lucide-react';

const Roles = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ role_key: '', role_name: '', capabilities: [] });

    useEffect(() => { fetchData(); }, [fetchData]);

    // Daftar Hak Akses yang Tersedia (System Capabilities)
    const availableCaps = [
        { id: 'view_dashboard', label: 'Lihat Dashboard' },
        { id: 'manage_jamaah', label: 'Kelola Data Jemaah' },
        { id: 'manage_finance', label: 'Kelola Keuangan' },
        { id: 'manage_packages', label: 'Kelola Paket & Master' },
        { id: 'manage_agents', label: 'Kelola Agen' },
        { id: 'manage_logistics', label: 'Kelola Logistik' },
        { id: 'manage_hr', label: 'Kelola HR & Kasbon' },
        { id: 'manage_users', label: 'Kelola User Sistem' },
    ];

    const handleCheckboxChange = (capId) => {
        const currentCaps = formData.capabilities || [];
        if (currentCaps.includes(capId)) {
            setFormData({ ...formData, capabilities: currentCaps.filter(c => c !== capId) });
        } else {
            setFormData({ ...formData, capabilities: [...currentCaps, capId] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) { setIsModalOpen(false); setFormData({ role_key: '', role_name: '', capabilities: [] }); }
    };

    const handleEdit = (item) => {
        setFormData({
            ...item,
            // Pastikan capabilities array (kadang dari DB string JSON)
            capabilities: Array.isArray(item.capabilities) ? item.capabilities : JSON.parse(item.capabilities || '[]')
        });
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Kode Role', accessor: 'role_key', className: 'font-mono text-xs' },
        { header: 'Nama Role', accessor: 'role_name', className: 'font-bold' },
        { 
            header: 'Hak Akses', 
            accessor: 'capabilities',
            render: r => {
                const caps = Array.isArray(r.capabilities) ? r.capabilities : JSON.parse(r.capabilities || '[]');
                return <span className="text-xs text-gray-600">{caps.length} akses diberikan</span>;
            }
        }
    ];

    return (
        <Layout title="Manajemen Hak Akses (Role)">
            <div className="flex justify-between mb-4">
                <div className="text-gray-600 text-sm">Atur peran dan izin akses pengguna sistem.</div>
                <button onClick={() => { setEditId(null); setFormData({role_key:'', role_name:'', capabilities:[]}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow text-sm">+ Buat Role</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Role" : "Buat Role Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kode Role (Unik)</label>
                            <input className="w-full border p-2 rounded bg-gray-50" value={formData.role_key} onChange={e => setFormData({...formData, role_key: e.target.value.toLowerCase().replace(/\s+/g, '_')})} placeholder="cth: staff_keuangan" disabled={!!editId} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nama Role</label>
                            <input className="w-full border p-2 rounded" value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} placeholder="Cth: Staff Keuangan" required />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Pilih Hak Akses</label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded border">
                            {availableCaps.map(cap => (
                                <label key={cap.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={(formData.capabilities || []).includes(cap.id)}
                                        onChange={() => handleCheckboxChange(cap.id)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{cap.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow">Simpan Role</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Roles;
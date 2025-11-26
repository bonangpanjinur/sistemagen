import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Roles = () => {
    const columns = [
        { header: 'Kunci Role', accessor: 'role_key' },
        { header: 'Nama Role', accessor: 'role_name' },
        { header: 'Hak Akses', accessor: 'capabilities', render: (row) => row.capabilities ? 'Custom' : 'Default' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        role_key: '',
        role_name: '',
        capabilities: '' // Disimpan sebagai JSON string sederhana
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ role_key: '', role_name: '', capabilities: '' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Manajemen Role & Akses">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Role Pengguna</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Buat Role</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Role" : "Role Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Role</label>
                        <input className="w-full border p-2 rounded" value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} required placeholder="Contoh: Staff Gudang" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Key (Unik, huruf kecil)</label>
                        <input className="w-full border p-2 rounded" value={formData.role_key} onChange={e => setFormData({...formData, role_key: e.target.value.toLowerCase().replace(/\s/g, '_')})} required placeholder="staff_gudang" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Capabilities (JSON Format - Opsional)</label>
                        <textarea className="w-full border p-2 rounded font-mono text-sm" value={formData.capabilities} onChange={e => setFormData({...formData, capabilities: e.target.value})} rows="4" placeholder='{"read_dashboard": true, "manage_logistics": true}'></textarea>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Role</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Roles;
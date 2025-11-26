import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Users = () => {
    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name' },
        { header: 'Email', accessor: 'email' },
        { 
            header: 'Role', 
            accessor: 'role',
            render: (row) => <span className="bg-gray-200 px-2 py-1 rounded text-xs uppercase">{row.role}</span>
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 text-xs rounded ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.status}
                </span>
            )
        },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '', // Hanya diisi jika ganti password
        phone: '',
        role: 'staff',
        status: 'active'
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Jangan kirim password kosong saat edit

        const success = editId ? await updateItem(editId, payload) : await createItem(payload);
        if (success) {
            setIsModalOpen(false);
            setFormData({ full_name: '', email: '', password: '', phone: '', role: 'staff', status: 'active' });
        }
    };

    const handleEdit = (item) => {
        setFormData({ ...item, password: '' }); // Kosongkan password saat edit mode
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Manajemen Pengguna">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Pengguna Sistem</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Pengguna</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Pengguna" : "Tambah Pengguna Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Lengkap</label>
                        <input className="w-full border p-2 rounded" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{editId ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}</label>
                        <input type="password" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editId} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="admin">Administrator</option>
                                <option value="staff">Staff Operasional</option>
                                <option value="marketing">Marketing</option>
                                <option value="finance">Keuangan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="active">Aktif</option>
                                <option value="inactive">Non-Aktif</option>
                            </select>
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Data</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;
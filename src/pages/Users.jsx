import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Untuk fetch roles
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { User, Settings } from 'lucide-react';

const UsersPage = () => {
    const { data, loading, fetchData, createItem, deleteItem } = useCRUD('umh/v1/users');
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
        // Load Roles untuk Dropdown
        api.get('umh/v1/roles').then(res => setRoles(res.data || []));
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (await createItem(formData)) {
            setIsModalOpen(false);
            setFormData({});
        }
    };

    const columns = [
        { header: 'Username', accessor: 'email', className: 'font-mono text-xs' }, // Menampilkan email sbg username
        { header: 'Nama Lengkap', accessor: 'full_name', className: 'font-bold' },
        { header: 'Role', accessor: 'role', render: r => <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{r.role}</span> },
        { header: 'Status', accessor: 'status' }
    ];

    return (
        <Layout title="Manajemen Pengguna">
            <div className="flex justify-between mb-4">
                <p className="text-gray-500 text-sm">Kelola akun login untuk staff.</p>
                <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow text-sm">+ Pengguna Baru</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pengguna Baru">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label><input className="w-full border p-2 rounded" value={formData.full_name||''} onChange={e => setFormData({...formData, full_name: e.target.value})} required /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Username (Login)</label><input className="w-full border p-2 rounded" value={formData.username||''} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input type="email" className="w-full border p-2 rounded" value={formData.email||''} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Password</label><input type="password" className="w-full border p-2 rounded" value={formData.password||''} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Role / Hak Akses</label>
                        <select className="w-full border p-2 rounded" value={formData.role||''} onChange={e => setFormData({...formData, role: e.target.value})} required>
                            <option value="">-- Pilih Role --</option>
                            {roles.map(r => <option key={r.id} value={r.role_key}>{r.role_name}</option>)}
                        </select>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded mt-2">Buat Akun</button>
                </form>
            </Modal>
        </Layout>
    );
};
export default UsersPage;
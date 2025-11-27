import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { User, Mail, ShieldCheck, Key } from 'lucide-react';

const Users = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/users');
    const { data: rolesData } = useCRUD('umh/v1/roles'); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        username: '', email: '', first_name: '', last_name: '', roles: 'subscriber', password: ''
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ username: '', email: '', first_name: '', last_name: '', roles: 'subscriber', password: '' });
        }
    };

    const columns = [
        { header: 'Pengguna', accessor: 'username', className: 'font-bold text-gray-800', render: r => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                    {r.username ? r.username.charAt(0) : 'U'}
                </div>
                <div>
                    <div className="font-semibold">{r.first_name} {r.last_name}</div>
                    <div className="text-xs text-gray-400">@{r.username}</div>
                </div>
            </div>
        )},
        { header: 'Email', accessor: 'email', render: r => <div className="text-sm text-gray-600 flex items-center gap-1"><Mail size={12}/> {r.email}</div> },
        { header: 'Peran', accessor: 'roles', render: r => (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 capitalize border border-purple-100">
                {Array.isArray(r.roles) ? r.roles[0] : r.roles}
            </span>
        )},
    ];

    return (
        <Layout title="Manajemen Pengguna">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Daftar Pengguna</h2>
                    <p className="text-sm text-gray-500">Kelola akun staf, admin, dan agen.</p>
                </div>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
                    <User size={18} /> Tambah Pengguna
                </button>
            </div>

            {loading ? <Spinner /> : (
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    onEdit={(item)=>{setFormData({...item, password: ''}); setEditId(item.id); setIsModalOpen(true)}} 
                    onDelete={(item) => deleteItem(item.id)} 
                />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Pengguna" : "Pengguna Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input className="w-full px-3 py-2 border rounded-md" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required autoComplete="new-username" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full px-3 py-2 border rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Depan</label><input className="w-full px-3 py-2 border rounded-md" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Belakang</label><input className="w-full px-3 py-2 border rounded-md" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><ShieldCheck size={14}/> Peran (Role)</label>
                        <select className="w-full px-3 py-2 border rounded-md" value={Array.isArray(formData.roles) ? formData.roles[0] : formData.roles} onChange={e => setFormData({...formData, roles: e.target.value})}>
                            <option value="subscriber">Subscriber (Default)</option>
                            <option value="administrator">Administrator</option>
                            <option value="editor">Editor</option>
                            {/* Render roles dari API jika ada */}
                            {rolesData && rolesData.map((role) => (
                                <option key={role.name} value={role.name}>{role.display_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <label className="block text-sm font-medium text-yellow-600 mb-1 flex items-center gap-2"><Key size={14}/> Password {editId && "(Isi hanya jika ingin mengubah)"}</label>
                        <input type="password" className="w-full px-3 py-2 border rounded-md" placeholder={editId ? "Biarkan kosong jika tidak diubah" : "Password kuat"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editId} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;
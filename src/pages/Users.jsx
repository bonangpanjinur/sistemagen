import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import { User, Mail, ShieldCheck, Key } from 'lucide-react';

const Users = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/users');
    const { data: roles } = useCRUD('umh/v1/roles'); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        username: '', email: '', first_name: '', last_name: '', roles: 'subscriber', password: ''
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // JANGAN kirim password kosong saat edit agar password lama tidak tertimpa
        const payload = { ...formData };
        if (editId && !payload.password) {
            delete payload.password;
        }

        const success = editId ? await updateItem(editId, payload) : await createItem(payload);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { 
            header: 'Username', 
            accessor: 'username', 
            className: 'font-bold',
            render: (r) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                        {r.username ? r.username.charAt(0) : 'U'}
                    </div>
                    <span>{r.username}</span>
                </div>
            )
        },
        { header: 'Nama Lengkap', accessor: 'first_name', render: r => `${r.first_name || ''} ${r.last_name || ''}` },
        { header: 'Email', accessor: 'email', render: r => <div className="flex items-center gap-1 text-sm text-gray-600"><Mail size={12}/> {r.email}</div> },
        { 
            header: 'Role', 
            accessor: 'roles', 
            render: r => (
                <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700 uppercase">
                    {Array.isArray(r.roles) ? r.roles[0] : r.roles}
                </span>
            ) 
        },
    ];

    return (
        <Layout title="Manajemen Pengguna">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => { 
                        setEditId(null); 
                        setFormData({username: '', email: '', first_name: '', last_name: '', roles: 'subscriber', password: ''}); 
                        setIsModalOpen(true); 
                    }} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <User size={18} /> Tambah User
                </button>
            </div>

            <CrudTable 
                columns={columns} 
                data={data} 
                loading={loading} 
                onEdit={(item)=>{ 
                    setFormData({...item, password: ''}); // Reset password field saat mode edit
                    setEditId(item.id); 
                    setIsModalOpen(true) 
                }} 
                onDelete={(item) => deleteItem(item.id)} 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit User" : "User Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required autoComplete="off" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Depan</label>
                            <input className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Belakang</label>
                            <input className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <ShieldCheck size={14}/> Role (Peran)
                        </label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white" value={formData.roles} onChange={e => setFormData({...formData, roles: e.target.value})}>
                            <option value="subscriber">Subscriber</option>
                            <option value="administrator">Administrator</option>
                            <option value="editor">Editor</option>
                            <option value="agent">Agent</option>
                            {roles?.map((r) => <option key={r.name} value={r.name}>{r.display_name}</option>)}
                        </select>
                    </div>
                    <div className="border-t pt-4 mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Key size={14} className="text-yellow-600"/> Password 
                            {editId && <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                        </label>
                        <input 
                            type="password" 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" 
                            placeholder={editId ? "Biarkan kosong..." : "Masukkan password..."}
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            required={!editId} 
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Users;
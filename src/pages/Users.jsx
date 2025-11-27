import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Shield } from 'lucide-react';

const Users = () => {
    const { user: currentUser } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/users');
    
    // Fetch Roles untuk dropdown
    const { data: roles } = useCRUD('umh/v1/roles');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { status: 'active', role: 'agent' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', sortable: true },
        { header: 'Email', accessor: 'email' },
        // FITUR 2: Relasi Role (Menampilkan Nama Role, bukan ID)
        { header: 'Role', accessor: 'role', render: (row) => {
            // Coba cari nama role di data roles, fallback ke ID jika belum ada data roles
            const roleObj = Array.isArray(roles) ? roles.find(r => r.slug === row.role || r.id === row.role) : null;
            const roleName = roleObj ? roleObj.name : row.role;
            
            return (
                <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                    <Shield size={10} /> {roleName?.toUpperCase()}
                </span>
            );
        }},
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Pengguna">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={20} /> Tambah User
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                // FITUR 1: Memastikan tombol aksi (Edit/Delete) muncul
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
                userCapabilities={currentUser?.role}
                editCapability="manage_options" // Sesuaikan dengan permission API
                deleteCapability="manage_options"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Tambah User Baru' : 'Edit User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" 
                            value={formData.email || ''} 
                            onChange={e => setFormData({...formData, email: e.target.value})} required 
                            disabled={modalMode === 'edit'} // Email biasanya tidak boleh ganti sembarangan
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" 
                            value={formData.full_name || ''} 
                            onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password {modalMode === 'edit' && '(Kosongkan jika tidak diubah)'}</label>
                        <input type="password" className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            required={modalMode === 'create'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role / Hak Akses</label>
                        <select className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            value={formData.role || 'agent'}
                            onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="owner">Owner / Super Admin</option>
                            <option value="admin_staff">Admin Staff</option>
                            <option value="finance">Keuangan</option>
                            <option value="logistics">Logistik</option>
                            <option value="agent">Agen</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;
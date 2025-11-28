import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import { useData } from '../contexts/DataContext';
import { User, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    // Mengambil data user yang sedang login untuk proteksi hapus
    const { user: currentUser } = useData();
    
    // Destructuring lengkap dari useCRUD termasuk pagination
    const { 
        data, 
        loading, 
        pagination,
        fetchData, 
        createItem, 
        updateItem, 
        deleteItem,
        changePage,
        changeLimit
    } = useCRUD('umh/v1/users');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchData(); }, [fetchData]);

    // Handle Pencarian
    const handleSearch = (q) => {
        setSearchQuery(q);
        fetchData(1, pagination.limit, q);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi Password Match
        if (!editId && formData.password !== confirmPassword) {
            return toast.error('Password dan Konfirmasi Password tidak sama!');
        }
        if (editId && formData.password && formData.password !== confirmPassword) {
            return toast.error('Password baru dan konfirmasi tidak sama!');
        }

        const payload = { ...formData };
        
        // Hapus password jika kosong (agar tidak mereset password user saat edit)
        if (editId && !payload.password) delete payload.password;

        const success = editId ? await updateItem(editId, payload) : await createItem(payload);
        if (success) {
            setIsModalOpen(false);
            setConfirmPassword(''); // Reset confirm password
            toast.success(editId ? 'User berhasil diperbarui' : 'User baru berhasil dibuat');
        }
    };

    const handleDelete = async (item) => {
        // Proteksi Hapus Diri Sendiri
        if (currentUser && item.id === currentUser.id) {
            return toast.error("Anda tidak dapat menghapus akun Anda sendiri!");
        }
        
        if (window.confirm(`Apakah Anda yakin ingin menghapus user "${item.username}"?`)) {
            await deleteItem(item.id);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setFormData({ ...item, password: '' }); // Password dikosongkan saat edit
            setEditId(item.id);
        } else {
            setFormData({ roles: 'subscriber' });
            setEditId(null);
        }
        setConfirmPassword('');
        setIsModalOpen(true);
    };

    const columns = [
        { 
            header: 'Username', 
            accessor: 'username', 
            render: r => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                        <User size={16} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{r.username}</div>
                        {currentUser && r.id === currentUser.id && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">It's You</span>
                        )}
                    </div>
                </div>
            )
        },
        { header: 'Email', accessor: 'email' },
        { 
            header: 'Role', 
            accessor: 'roles', 
            render: r => {
                const role = Array.isArray(r.roles) ? r.roles[0] : r.roles;
                let colorClass = 'bg-gray-100 text-gray-800';
                if (role === 'administrator') colorClass = 'bg-purple-100 text-purple-800';
                if (role === 'agent') colorClass = 'bg-blue-100 text-blue-800';
                if (role === 'editor') colorClass = 'bg-yellow-100 text-yellow-800';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize flex w-fit items-center gap-1 ${colorClass}`}>
                        {role === 'administrator' && <Shield size={10} />}
                        {role}
                    </span>
                );
            } 
        }
    ];

    return (
        <Layout title="Manajemen Pengguna">
            {/* Header Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput 
                        placeholder="Cari username atau email..." 
                        onSearch={handleSearch} 
                    />
                </div>
                <button 
                    onClick={() => openModal()} 
                    className="btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                >
                    <UserCheck size={18}/> Tambah User
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={openModal} 
                    onDelete={handleDelete} 
                />
                <Pagination 
                    pagination={pagination}
                    onPageChange={changePage}
                    onLimitChange={changeLimit}
                />
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit User" : "Tambah User Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username (Read-only saat edit untuk keamanan konsistensi) */}
                    <div>
                        <label className="label">Username</label>
                        <input 
                            className={`input-field ${editId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={formData.username || ''} 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                            required 
                            disabled={!!editId} 
                            placeholder="username"
                        />
                        {editId && <p className="text-xs text-gray-500 mt-1">Username tidak dapat diubah.</p>}
                    </div>

                    <div>
                        <label className="label">Alamat Email</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            value={formData.email || ''} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            required 
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="label">Role / Peran</label>
                        <select 
                            className="input-field capitalize" 
                            value={Array.isArray(formData.roles) ? formData.roles[0] : (formData.roles || 'subscriber')} 
                            onChange={e => setFormData({...formData, roles: e.target.value})}
                        >
                            <option value="subscriber">Subscriber (Jemaah)</option>
                            <option value="administrator">Administrator (Full Access)</option>
                            <option value="editor">Editor / Staff</option>
                            <option value="agent">Agent (Mitra)</option>
                        </select>
                    </div>

                    {/* Password Section */}
                    <div className="border-t pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Shield size={14} className="text-blue-600"/> 
                            {editId ? 'Ubah Password (Opsional)' : 'Atur Password'}
                        </h4>
                        
                        {editId && (
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-3 flex gap-2 items-start">
                                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0"/>
                                <p className="text-xs text-yellow-700">
                                    Biarkan kolom password kosong jika Anda tidak ingin mengubah password user ini.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="label">Password {editId && 'Baru'}</label>
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    value={formData.password || ''} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    placeholder={editId ? "Biarkan kosong..." : "Masukkan password"} 
                                    required={!editId} 
                                    minLength={6}
                                />
                            </div>
                            
                            {/* Konfirmasi Password hanya muncul jika membuat baru atau sedang mengetik password saat edit */}
                            {(!editId || formData.password) && (
                                <div className="animate-fade-in">
                                    <label className="label">Konfirmasi Password</label>
                                    <input 
                                        type="password" 
                                        className={`input-field ${confirmPassword && formData.password !== confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                        placeholder="Ketik ulang password" 
                                        required
                                    />
                                    {confirmPassword && formData.password !== confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">Password tidak cocok!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary w-32"
                            disabled={!editId && formData.password !== confirmPassword}
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;
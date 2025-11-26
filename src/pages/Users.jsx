import React, { useState } from 'react';
import { Plus, User, Shield } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';

const Users = ({ userCapabilities }) => {
    const {
        items: users,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem,
        fetchItems
    } = useCRUD('users');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Proteksi ketat untuk manajemen user
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('list_users') || caps.includes('manage_options');

    const columns = [
        { Header: 'ID', accessor: 'ID', sortable: true },
        { 
            Header: 'Username', 
            accessor: 'user_login', 
            sortable: true,
            render: (val, item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{val}</span>
                    <span className="text-xs text-gray-500">{item.display_name}</span>
                </div>
            )
        },
        { Header: 'Email', accessor: 'user_email' },
        { 
            Header: 'Role', 
            accessor: 'roles', 
            render: (val) => (
                <div className="flex gap-1">
                    {Array.isArray(val) ? val.map((role, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {role}
                        </span>
                    )) : <span className="text-gray-400">-</span>}
                </div>
            )
        },
        { Header: 'Terdaftar', accessor: 'user_registered', render: (val) => val ? new Date(val).toLocaleDateString() : '-' }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        // Reset password field saat edit untuk keamanan
        setFormData(item ? { ...item, user_pass: '' } : { user_login: '', user_email: '', first_name: '', last_name: '', role: 'subscriber', user_pass: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Hapus password kosong jika sedang edit agar tidak ter-reset
            const dataToSend = { ...formData };
            if (currentItem && !dataToSend.user_pass) {
                delete dataToSend.user_pass;
            }

            if (currentItem) {
                await updateItem(currentItem.ID, dataToSend);
            } else {
                await createItem(dataToSend);
            }
            fetchItems();
            closeModal();
        } catch (error) {
            alert("Gagal menyimpan pengguna. Username/Email mungkin sudah ada.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus pengguna "${item.user_login}"?`)) {
            try {
                await deleteItem(item.ID);
            } catch (error) {
                alert("Gagal menghapus pengguna.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pengguna Sistem</h1>
                    <p className="text-sm text-gray-500">Kelola akses staff dan agen.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari username/email..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah User
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={users}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="list_users"
                deleteCapability="delete_users"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Pengguna' : 'Tambah Pengguna Baru'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input 
                                type="text" 
                                required 
                                disabled={!!currentItem} // Username tidak bisa diubah saat edit
                                className={`mt-1 w-full border p-2 rounded ${currentItem ? 'bg-gray-100 text-gray-500' : ''}`}
                                value={formData.user_login || ''} 
                                onChange={e => setFormData({...formData, user_login: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" required className="mt-1 w-full border p-2 rounded" value={formData.user_email || ''} onChange={e => setFormData({...formData, user_email: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Depan</label>
                            <input type="text" className="mt-1 w-full border p-2 rounded" value={formData.first_name || ''} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Belakang</label>
                            <input type="text" className="mt-1 w-full border p-2 rounded" value={formData.last_name || ''} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role (Peran)</label>
                        <select className="mt-1 w-full border p-2 rounded" value={formData.role || 'subscriber'} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="subscriber">Subscriber (Jamaah)</option>
                            <option value="agent">Agent</option>
                            <option value="editor">Editor (Staff)</option>
                            <option value="administrator">Administrator</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {currentItem ? 'Password Baru (Kosongkan jika tidak ubah)' : 'Password'}
                        </label>
                        <input 
                            type="password" 
                            required={!currentItem} // Wajib jika user baru
                            className="mt-1 w-full border p-2 rounded" 
                            value={formData.user_pass || ''} 
                            onChange={e => setFormData({...formData, user_pass: e.target.value})} 
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
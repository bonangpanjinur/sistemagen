/*
 * Lokasi File: /src/pages/Users.jsx
 * File: Users.jsx
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD.js'; // PERBAIKAN: Tambah ekstensi .js
import CrudTable from '../components/CrudTable.jsx'; // PERBAIKAN: Tambah ekstensi .jsx
import Pagination from '../components/Pagination.jsx'; // PERBAIKAN: Tambah ekstensi .jsx
import SearchInput from '../components/SearchInput.jsx'; // PERBAIKAN: Tambah ekstensi .jsx
import Modal from '../components/Modal.jsx'; // PERBAIKAN: Tambah ekstensi .jsx
import api from '../utils/api.js'; // PERBAIKAN: Tambah ekstensi .js
import { useData } from '../contexts/DataContext.jsx'; // PERBAIKAN: Tambah ekstensi .jsx

const Users = ({ userCapabilities }) => {
    const {
        data: users,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        deleteItem,
        createItem, // PERBAIKAN: Tambahkan createItem
        updateItem  // PERBAIKAN: Tambahkan updateItem
    } = useCRUD('users');
    
    // Ambil data roles dari WordPress
    const { roles: allRoles, refreshData } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    
    // PERBAIKAN BARU: State untuk modal konfirmasi hapus
    const [itemToDelete, setItemToDelete] = useState(null);
    
    const getFormValue = (key) => formData[key] || '';

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama', accessor: 'full_name', sortable: true },
        { Header: 'Email', accessor: 'email', sortable: true },
        { Header: 'Role', accessor: 'role', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            id: item.id,
            full_name: item.full_name,
            email: item.email,
            role: item.role,
            phone: item.phone,
            status: item.status,
        } : {
            full_name: '',
            email: '',
            role: '', 
            phone: '',
            status: 'active',
            password: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await updateItem(currentItem.id, formData);
            } else {
                await createItem(formData);
            }
            await refreshData('users'); 
            closeModal();
        } catch (error) {
            console.error("Gagal menyimpan user:", error);
            // Error sudah ditangani oleh interceptor global
        }
    };

    // PERBAIKAN BARU: Pisahkan logika untuk membuka modal konfirmasi
    const handleDeleteClick = (item) => {
        setItemToDelete(item);
    };

    // PERBAIKAN BARU: Fungsi ini dipanggil oleh modal konfirmasi
    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await deleteItem(itemToDelete.id); 
            await refreshData('users'); 
            setItemToDelete(null); // Tutup modal
        } catch (error) {
            console.error("Gagal menghapus user:", error);
            setItemToDelete(null); // Tutup modal walaupun gagal
        }
    };
    
    const canManage = userCapabilities.includes('manage_users') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari staff..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Staff
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={users}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDeleteClick : null} // PERBAIKAN: Ganti ke handleDeleteClick
                userCapabilities={userCapabilities}
                editCapability="manage_users"
                deleteCapability="manage_users"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            {/* Modal untuk Tambah/Edit Staff */}
            <Modal title={currentItem ? 'Edit Staff' : 'Tambah Staff'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" value={getFormValue('full_name')} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={getFormValue('email')} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" value={getFormValue('phone')} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select value={getFormValue('role')} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1 block w-full" required>
                                <option value="">Pilih Role</option>
                                {(allRoles || []).map(role => (
                                    // PERBAIKAN: Gunakan allRoles dari useData()
                                    // Asumsi allRoles adalah array of objects [{ role_key: '...', role_name: '...' }]
                                    <option key={role.role_key} value={role.role_key}>{role.role_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={getFormValue('password')}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full"
                                placeholder={currentItem ? 'Kosongkan jika tidak ganti' : ''}
                                required={!currentItem}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                             <select value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
            
            {/* PERBAIKAN BARU: Modal untuk Konfirmasi Hapus */}
            <Modal 
                title="Konfirmasi Hapus" 
                show={!!itemToDelete} 
                onClose={() => setItemToDelete(null)}
                size="max-w-md"
            >
                <div className="space-y-4">
                    <p>Apakah Anda yakin ingin menghapus staff **{itemToDelete?.full_name}**?</p>
                    <p className="text-sm text-red-600">Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button" 
                            onClick={() => setItemToDelete(null)} 
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Batal
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmDelete} 
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
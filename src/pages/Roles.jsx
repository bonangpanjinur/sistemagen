import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD.js';
import CrudTable from '../components/CrudTable.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import api from '../utils/api.js'; // Import API untuk create/update

// Daftar kapabilitas
const allCapabilities = [
    { id: 'read', label: 'Read (Dasar)' },
    { id: 'read_packages', label: 'Lihat Paket' },
    { id: 'manage_packages', label: 'Kelola Paket' },
    { id: 'read_jamaah', label: 'Lihat Jamaah' },
    { id: 'manage_jamaah', label: 'Kelola Jamaah' },
    { id: 'manage_finance', label: 'Kelola Keuangan' },
    { id: 'manage_tasks', label: 'Kelola Tugas' },
    { id: 'manage_categories', label: 'Kelola Kategori' },
    { id: 'manage_flights', label: 'Kelola Penerbangan' },
    { id: 'manage_hotels', label: 'Kelola Hotel' },
    { id: 'manage_departures', label: 'Kelola Keberangkatan' },
    { id: 'view_reports', label: 'Lihat Laporan' },
    { id: 'list_users', label: 'Lihat Staff' },
    { id: 'manage_users', label: 'Kelola Staff' },
    { id: 'manage_roles', label: 'Kelola Roles' },
    { id: 'manage_options', label: 'Super Admin (Semua Akses)' },
];

const Roles = ({ userCapabilities }) => {
    const {
        data: roles,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        deleteItem
    } = useCRUD('roles');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ role_key: '', role_name: '' });
    const [selectedCapabilities, setSelectedCapabilities] = useState([]);

    const columns = [
        { Header: 'ID (Key)', accessor: 'role_key', sortable: true },
        { Header: 'Nama Tampilan', accessor: 'role_name', sortable: true },
        { Header: 'Kapabilitas', accessor: 'capabilities', render: (val) => (val || []).join(', ') },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        if (item) {
            setFormData({ role_key: item.role_key, role_name: item.role_name });
            // API kustom mungkin menyimpan kapabilitas di tempat lain
            // Asumsi untuk sekarang, 'capabilities' adalah bagian dari item
            setSelectedCapabilities(item.capabilities || []);
        } else {
            setFormData({ role_key: '', role_name: '' });
            setSelectedCapabilities([]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleCapabilityChange = (cap) => {
        setSelectedCapabilities(prev => 
            prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Endpoint 'roles' menggunakan UMH_CRUD_Controller,
        // jadi kita perlu mengirim data dengan format yang benar.
        // Mari kita asumsikan 'capabilities' belum di-support oleh CRUD controller sederhana.
        // Kita hanya akan kirim role_key dan role_name.
        // TODO: Anda perlu API kustom untuk menyimpan kapabilitas.
        const payload = {
            role_key: formData.role_key,
            role_name: formData.role_name,
            // capabilities: selectedCapabilities // Ini butuh API kustom
        };

        try {
            if (currentItem) {
                await api.put(`roles/${currentItem.id}`, payload);
            } else {
                await api.post('roles', payload);
            }
            handlePageChange(1); // Refresh
            closeModal();
            window.location.reload(); // Perlu reload untuk kapabilitas baru
        } catch (error) {
            console.error("Gagal menyimpan role:", error);
        }
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id); // Hapus berdasarkan 'id'
            window.location.reload(); // Perlu reload
        }
    };
    
    const canManage = userCapabilities.includes('manage_roles') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari role..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Role
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={roles}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_roles"
                deleteCapability="manage_roles"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Role' : 'Tambah Role'} show={isModalOpen} onClose={closeModal} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID Internal (Key)</label>
                            <input
                                type="text"
                                value={formData.role_key}
                                onChange={(e) => setFormData({ ...formData, role_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                className="mt-1 block w-full"
                                required
                                disabled={!!currentItem}
                            />
                            <small className="text-gray-500">Cth: 'agen_lapangan'</small>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Tampilan</label>
                            <input
                                type="text"
                                value={formData.role_name}
                                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                             <small className="text-gray-500">Cth: 'Agen Lapangan'</small>
                        </div>
                    </div>
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-medium text-gray-800 px-2">Kapabilitas (Perlu API Kustom)</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {allCapabilities.map(cap => (
                                <label key={cap.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedCapabilities.includes(cap.id)}
                                        onChange={() => handleCapabilityChange(cap.id)}
                                        className="rounded text-blue-600"
                                        disabled // Nonaktifkan sampai API kustom siap
                                    />
                                    <span className="text-sm text-gray-700">{cap.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Role</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Roles;
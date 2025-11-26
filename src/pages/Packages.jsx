import React, { useState } from 'react';
import { Plus, Users, Calendar, DollarSign } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { useData } from '../contexts/DataContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const Packages = ({ userCapabilities }) => {
    // Gunakan 'items' sebagai 'packages' agar lebih semantik
    const {
        items: packages,
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
    } = useCRUD('packages');

    const { refreshData } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Proteksi User Capabilities
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_packages') || caps.includes('manage_options');

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Paket', accessor: 'name', sortable: true },
        { 
            Header: 'Tanggal Berangkat', 
            accessor: 'departure_date', 
            sortable: true,
            render: (val) => val ? formatDate(val) : '-'
        },
        { 
            Header: 'Harga', 
            accessor: 'price', 
            sortable: true,
            render: (val) => val ? formatCurrency(val) : 'Rp 0'
        },
        { 
            Header: 'Kuota', 
            accessor: 'quota', 
            sortable: true,
            render: (val, item) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    (item.booked || 0) >= val ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {item.booked || 0} / {val}
                </span>
            )
        },
        {
            Header: 'Status',
            accessor: 'status',
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    val === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {val === 'active' ? 'Aktif' : 'Draft'}
                </span>
            )
        }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { name: '', departure_date: '', price: 0, quota: 45, status: 'active' });
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
            if (currentItem) {
                await updateItem(currentItem.id, formData);
            } else {
                await createItem(formData);
            }
            await fetchItems();
            refreshData('packages'); // Refresh global stats if needed
            closeModal();
        } catch (error) {
            console.error("Failed to save package:", error);
            alert("Gagal menyimpan paket. Periksa koneksi atau input Anda.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Yakin ingin menghapus paket "${item.name}"?`)) {
            try {
                await deleteItem(item.id);
                refreshData('packages');
            } catch (error) {
                alert("Gagal menghapus paket.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Paket Umroh</h1>
                    <p className="text-sm text-gray-500">Kelola jadwal dan harga paket perjalanan.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari paket..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah Paket
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={packages}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_packages"
                deleteCapability="manage_packages"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal 
                title={currentItem ? 'Edit Paket' : 'Tambah Paket Baru'} 
                show={isModalOpen} 
                onClose={closeModal}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                        <input 
                            type="text" 
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Berangkat</label>
                            <input 
                                type="date" 
                                required 
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.departure_date || ''}
                                onChange={e => setFormData({...formData, departure_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                            <input 
                                type="number" 
                                required 
                                min="0"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.price || ''}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kuota</label>
                            <input 
                                type="number" 
                                required 
                                min="1"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.quota || ''}
                                onChange={e => setFormData({...formData, quota: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.status || 'active'}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="active">Aktif</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Arsip</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;
import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';

const Agents = ({ userCapabilities }) => {
    const {
        items: agents,
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
    } = useCRUD('agents');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Safe Capabilities
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_agents') || caps.includes('manage_options');

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Agen', accessor: 'name', sortable: true },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Telepon', accessor: 'phone', render: (val) => val || '-' },
        { 
            Header: 'Total Jamaah', 
            accessor: 'total_jamaah', 
            sortable: true,
            render: (val) => <span className="font-bold text-blue-600">{val || 0}</span>
        },
        {
            Header: 'Status',
            accessor: 'status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs ${val === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {val === 'active' ? 'Aktif' : 'Non-Aktif'}
                </span>
            )
        }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { name: '', email: '', phone: '', status: 'active' });
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
            fetchItems();
            closeModal();
        } catch (error) {
            alert("Gagal menyimpan data agen.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Yakin hapus agen "${item.name}"?`)) {
            try {
                await deleteItem(item.id);
            } catch (error) {
                alert("Gagal menghapus agen.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Agen</h1>
                    <p className="text-sm text-gray-500">Kelola mitra agen dan performa penjualan.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari agen..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah Agen
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={agents}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_agents"
                deleteCapability="manage_agents"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Agen' : 'Tambah Agen Baru'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Agen</label>
                        <input type="text" required className="mt-1 w-full border p-2 rounded" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" required className="mt-1 w-full border p-2 rounded" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" required className="mt-1 w-full border p-2 rounded" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select className="mt-1 w-full border p-2 rounded" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="active">Aktif</option>
                            <option value="inactive">Non-Aktif</option>
                        </select>
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

export default Agents;
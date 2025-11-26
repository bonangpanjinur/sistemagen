import React, { useState } from 'react';
import { Plus, User, FileText } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { useData } from '../contexts/DataContext';

const Jamaah = ({ userCapabilities }) => {
    const {
        items: jamaahList,
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
    } = useCRUD('jamaah');

    const { refreshData } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Safe Capabilities Access
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_jamaah') || caps.includes('manage_options');

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Lengkap', accessor: 'name', sortable: true },
        { Header: 'No. Paspor', accessor: 'passport_number', render: (val) => val || '-' },
        { 
            Header: 'Paket', 
            accessor: 'package_name',
            render: (val) => val || <span className="text-gray-400 italic">Belum pilih paket</span>
        },
        {
            Header: 'Status',
            accessor: 'status',
            render: (val) => {
                const colors = {
                    'registered': 'bg-gray-100 text-gray-800',
                    'deposit': 'bg-yellow-100 text-yellow-800',
                    'paid': 'bg-green-100 text-green-800',
                    'cancelled': 'bg-red-100 text-red-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[val] || 'bg-gray-100'}`}>
                        {val ? val.charAt(0).toUpperCase() + val.slice(1) : '-'}
                    </span>
                );
            }
        }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { name: '', passport_number: '', phone: '', status: 'registered' });
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
            refreshData('jamaah');
            closeModal();
        } catch (error) {
            alert("Gagal menyimpan data jamaah.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus data jamaah "${item.name}"?`)) {
            try {
                await deleteItem(item.id);
                refreshData('jamaah');
            } catch (error) {
                alert("Gagal menghapus data.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Jamaah</h1>
                    <p className="text-sm text-gray-500">Manajemen pendaftaran dan dokumen jamaah.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari nama / paspor..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah Jamaah
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={jamaahList}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_jamaah"
                deleteCapability="manage_jamaah"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal 
                title={currentItem ? 'Edit Data Jamaah' : 'Registrasi Jamaah Baru'} 
                show={isModalOpen} 
                onClose={closeModal}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap (Sesuai Paspor)</label>
                        <input 
                            type="text" 
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nomor Paspor</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.passport_number || ''}
                                onChange={e => setFormData({...formData, passport_number: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. Telepon / WA</label>
                            <input 
                                type="tel" 
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={formData.phone || ''}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status Pendaftaran</label>
                        <select 
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={formData.status || 'registered'}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="registered">Terdaftar (Belum DP)</option>
                            <option value="deposit">Sudah DP</option>
                            <option value="paid">Lunas</option>
                            <option value="cancelled">Batal</option>
                        </select>
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

export default Jamaah;
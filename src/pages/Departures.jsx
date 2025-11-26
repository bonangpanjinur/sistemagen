import React, { useState } from 'react';
import { Plus, Calendar, Plane } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatDate } from '../utils/formatters';

const Departures = ({ userCapabilities }) => {
    // 1. Gunakan 'items' dan default value untuk menghindari crash
    const {
        items: departures,
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
    } = useCRUD('departures');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // 2. Proteksi hak akses
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_departures') || caps.includes('manage_options');

    // 3. Kolom dengan validasi null
    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Grup', accessor: 'group_name', sortable: true },
        { 
            Header: 'Tanggal', 
            accessor: 'departure_date', 
            sortable: true,
            render: (val) => val ? formatDate(val) : '-' 
        },
        { 
            Header: 'Pesawat', 
            accessor: 'airline',
            render: (val) => val || '-'
        },
        { 
            Header: 'Jamaah', 
            accessor: 'total_jamaah',
            render: (val) => <span className="font-semibold text-blue-600">{val || 0}</span>
        },
        {
            Header: 'Status',
            accessor: 'status',
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    val === 'departed' ? 'bg-green-100 text-green-800' : 
                    val === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {val === 'departed' ? 'Berangkat' : val === 'scheduled' ? 'Terjadwal' : 'Selesai'}
                </span>
            )
        }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        // Default value penting untuk form
        setFormData(item ? { ...item } : { group_name: '', departure_date: '', airline: '', status: 'scheduled' });
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
            alert("Gagal menyimpan data keberangkatan.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus jadwal "${item.group_name}"?`)) {
            try {
                await deleteItem(item.id);
            } catch (error) {
                alert("Gagal menghapus data.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Keberangkatan</h1>
                    <p className="text-sm text-gray-500">Atur jadwal penerbangan dan grup jamaah.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari grup..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah Jadwal
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={departures}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_departures"
                deleteCapability="manage_departures"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Jadwal' : 'Tambah Jadwal Baru'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Grup</label>
                        <input type="text" required className="mt-1 w-full border p-2 rounded" value={formData.group_name || ''} onChange={e => setFormData({...formData, group_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input type="date" required className="mt-1 w-full border p-2 rounded" value={formData.departure_date || ''} onChange={e => setFormData({...formData, departure_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Maskapai</label>
                            <input type="text" className="mt-1 w-full border p-2 rounded" value={formData.airline || ''} onChange={e => setFormData({...formData, airline: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select className="mt-1 w-full border p-2 rounded" value={formData.status || 'scheduled'} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="scheduled">Terjadwal</option>
                            <option value="departed">Sudah Berangkat</option>
                            <option value="completed">Selesai/Pulang</option>
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

export default Departures;
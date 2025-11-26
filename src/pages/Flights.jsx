import React, { useState } from 'react';
import { Plus, Plane } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';

const Flights = ({ userCapabilities }) => {
    const {
        items: flights,
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
    } = useCRUD('flights');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_flights') || caps.includes('manage_options');

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Maskapai', accessor: 'airline', sortable: true },
        { Header: 'No. Penerbangan', accessor: 'flight_number', render: (val) => val || '-' },
        { Header: 'Rute', accessor: 'route', render: (val) => val || '-' },
        { Header: 'Berangkat', accessor: 'departure_time', render: (val) => val || '-' },
        { Header: 'Tiba', accessor: 'arrival_time', render: (val) => val || '-' }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { airline: '', flight_number: '', route: '', departure_time: '', arrival_time: '' });
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
            alert("Gagal menyimpan data penerbangan.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus penerbangan ${item.airline} (${item.flight_number})?`)) {
            try {
                await deleteItem(item.id);
            } catch (error) {
                alert("Gagal menghapus.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Penerbangan</h1>
                    <p className="text-sm text-gray-500">Database maskapai dan rute.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari maskapai..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah Penerbangan
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={flights}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_flights"
                deleteCapability="manage_flights"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Penerbangan' : 'Tambah Penerbangan'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Maskapai</label>
                            <input type="text" required className="mt-1 w-full border p-2 rounded" value={formData.airline || ''} onChange={e => setFormData({...formData, airline: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. Penerbangan</label>
                            <input type="text" required className="mt-1 w-full border p-2 rounded" value={formData.flight_number || ''} onChange={e => setFormData({...formData, flight_number: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rute (Asal - Tujuan)</label>
                        <input type="text" className="mt-1 w-full border p-2 rounded" placeholder="CGK - JED" value={formData.route || ''} onChange={e => setFormData({...formData, route: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jam Berangkat</label>
                            <input type="time" className="mt-1 w-full border p-2 rounded" value={formData.departure_time || ''} onChange={e => setFormData({...formData, departure_time: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jam Tiba</label>
                            <input type="time" className="mt-1 w-full border p-2 rounded" value={formData.arrival_time || ''} onChange={e => setFormData({...formData, arrival_time: e.target.value})} />
                        </div>
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

export default Flights;
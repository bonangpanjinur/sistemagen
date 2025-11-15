import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { useData } from '../contexts/DataContext';

const Flights = ({ userCapabilities }) => {
    const {
        data: flights,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('flights');
    
    const { refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Maskapai', accessor: 'airline', sortable: true },
        { Header: 'No. Penerbangan', accessor: 'flight_number', sortable: true },
        { Header: 'Asal', accessor: 'departure_airport', sortable: true },
        { Header: 'Tujuan', accessor: 'arrival_airport', sortable: true },
        { Header: 'Keberangkatan', accessor: 'departure_time', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Kedatangan', accessor: 'arrival_time', sortable: true, render: (val) => formatDate(val) },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ...item,
            // Ganti ini ke datetime-local jika skema DB mendukung
            departure_time: formatDateForInput(item.departure_time), 
            arrival_time: formatDateForInput(item.arrival_time),
        } : {
            airline: '',
            flight_number: '',
            departure_airport: '',
            arrival_airport: '',
            departure_time: '',
            arrival_time: '',
            total_seats: 0,
            cost_per_seat: 0,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentItem) {
            await updateItem(currentItem.id, formData);
        } else {
            await createItem(formData);
        }
        await refreshData('flights'); // Refresh data global
        closeModal();
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('flights'); // Refresh data global
        }
    };

    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_flights') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari penerbangan..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Penerbangan
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={flights}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_flights"
                deleteCapability="manage_flights"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Penerbangan' : 'Tambah Penerbangan'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="airline" className="block text-sm font-medium text-gray-700">Maskapai</label>
                            <input type="text" id="airline" value={getFormValue('airline')} onChange={(e) => setFormData({ ...formData, airline: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label htmlFor="flight_number" className="block text-sm font-medium text-gray-700">No. Penerbangan</label>
                            <input type="text" id="flight_number" value={getFormValue('flight_number')} onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label htmlFor="departure_airport" className="block text-sm font-medium text-gray-700">Asal (Kode Bandara)</label>
                            <input type="text" id="departure_airport" value={getFormValue('departure_airport')} onChange={(e) => setFormData({ ...formData, departure_airport: e.target.value })} className="mt-1 block w-full" />
                        </div>
                        <div>
                            <label htmlFor="arrival_airport" className="block text-sm font-medium text-gray-700">Tujuan (Kode Bandara)</label>
                            <input type="text" id="arrival_airport" value={getFormValue('arrival_airport')} onChange={(e) => setFormData({ ...formData, arrival_airport: e.target.value })} className="mt-1 block w-full" />
                        </div>
                        <div>
                            <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">Tgl/Waktu Keberangkatan</label>
                            <input type="datetime-local" id="departure_time" value={getFormValue('departure_time')} onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700">Tgl/Waktu Kedatangan</label>
                            <input type="datetime-local" id="arrival_time" value={getFormValue('arrival_time')} onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                         <div>
                            <label htmlFor="total_seats" className="block text-sm font-medium text-gray-700">Total Kursi</label>
                            <input type="number" id="total_seats" value={getFormValue('total_seats')} onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })} className="mt-1 block w-full" />
                        </div>
                         <div>
                            <label htmlFor="cost_per_seat" className="block text-sm font-medium text-gray-700">Biaya per Kursi</label>
                            <input type="number" id="cost_per_seat" value={getFormValue('cost_per_seat')} onChange={(e) => setFormData({ ...formData, cost_per_seat: e.target.value })} className="mt-1 block w-full" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Flights;
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD.js';
import { useData } from '../contexts/DataContext.jsx';
import CrudTable from '../components/CrudTable.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import { formatDate, formatDateForInput } from '../utils/formatters.js';

const Departures = ({ userCapabilities }) => {
    const {
        data: departures,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('departures');
    
    const { packages, flights, refreshData } = useData(); // Ambil data global

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Paket', accessor: 'package_name', sortable: true },
        { Header: 'Tgl Berangkat', accessor: 'departure_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Tgl Kembali', accessor: 'return_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Maskapai', accessor: 'airline_name', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true },
        { Header: 'Total Kursi', accessor: 'total_seats', sortable: true },
        { Header: 'Tersedia', accessor: 'available_seats', sortable: true },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ...item,
            departure_date: formatDateForInput(item.departure_date),
            return_date: formatDateForInput(item.return_date),
        } : {
            departure_date: '',
            return_date: '',
            package_id: '',
            flight_id: '',
            status: 'scheduled',
            notes: '',
            total_seats: 0,
            available_seats: 0,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            total_seats: parseInt(formData.total_seats, 10) || 0,
            available_seats: parseInt(formData.available_seats, 10) || 0,
        };
        
        if (currentItem) {
            await updateItem(currentItem.id, dataToSubmit);
        } else {
            await createItem(dataToSubmit);
        }
        await refreshData('departures');
        closeModal();
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('departures');
        }
    };
    
    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_departures') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari keberangkatan..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Keberangkatan
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={departures}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_departures"
                deleteCapability="manage_departures"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Keberangkatan' : 'Tambah Keberangkatan'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="package_id" className="block text-sm font-medium text-gray-700">Paket</label>
                            <select id="package_id" value={getFormValue('package_id')} onChange={(e) => setFormData({ ...formData, package_id: e.target.value })} className="mt-1 block w-full" required>
                                <option value="">Pilih Paket</option>
                                {(packages || []).map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="flight_id" className="block text-sm font-medium text-gray-700">Penerbangan</label>
                            <select id="flight_id" value={getFormValue('flight_id')} onChange={(e) => setFormData({ ...formData, flight_id: e.target.value })} className="mt-1 block w-full">
                                <option value="">Pilih Penerbangan</option>
                                {(flights || []).map(flt => (
                                    <option key={flt.id} value={flt.id}>{flt.airline} ({flt.flight_number})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="departure_date" className="block text-sm font-medium text-gray-700">Tgl Berangkat</label>
                            <input type="date" id="departure_date" value={getFormValue('departure_date')} onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label htmlFor="return_date" className="block text-sm font-medium text-gray-700">Tgl Kembali</label>
                            <input type="date" id="return_date" value={getFormValue('return_date')} onChange={(e) => setFormData({ ...formData, return_date: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                         <div>
                            <label htmlFor="total_seats" className="block text-sm font-medium text-gray-700">Total Kursi</label>
                            <input type="number" id="total_seats" value={getFormValue('total_seats')} onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                         <div>
                            <label htmlFor="available_seats" className="block text-sm font-medium text-gray-700">Kursi Tersedia</label>
                            <input type="number" id="available_seats" value={getFormValue('available_seats')} onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full">
                                <option value="scheduled">Scheduled</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan</label>
                        <textarea id="notes" rows="3" value={getFormValue('notes')} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="mt-1 block w-full"></textarea>
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

export default Departures;
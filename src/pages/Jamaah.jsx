import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD.js';
import { useData } from '../contexts/DataContext.jsx';
import CrudTable from '../components/CrudTable.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Modal from '../components/Modal.jsx';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters.js';

const Jamaah = ({ userCapabilities }) => {
    const {
        data: jamaah,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('jamaah');
    
    const { packages, departures, refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Lengkap', accessor: 'full_name', sortable: true },
        { Header: 'Paket', accessor: 'package_name', sortable: true }, // Asumsi ini ada dari JOIN
        { Header: 'Telepon', accessor: 'phone' },
        { Header: 'Status Bayar', accessor: 'payment_status', sortable: true,
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'lunas' ? 'bg-green-100 text-green-800' :
                    val === 'belum_lunas' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {val}
                </span>
            )
        },
        { Header: 'Sisa Tagihan', accessor: 'amount_paid', sortable: true, render: (val) => formatCurrency(val) }, // Seharusnya sisa tagihan
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        const defaultData = {
            full_name: '', email: '', phone: '', address: '',
            birth_date: '', gender: 'male', package_id: '', departure_id: '',
            room_type: '', status: 'pending', total_price: 0,
        };
        
        setFormData(item ? {
            ...defaultData, ...item,
            birth_date: formatDateForInput(item.birth_date),
        } : defaultData);
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
        await refreshData('jamaah');
        closeModal();
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('jamaah');
        }
    };

    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_jamaah') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari jamaah..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Jamaah
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={jamaah}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_jamaah"
                deleteCapability="manage_jamaah"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Jamaah' : 'Tambah Jamaah'} show={isModalOpen} onClose={closeModal} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" value={getFormValue('full_name')} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={getFormValue('email')} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" value={getFormValue('phone')} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tgl Lahir</label>
                            <input type="date" value={getFormValue('birth_date')} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="mt-1 block w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                            <select value={getFormValue('gender')} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="mt-1 block w-full">
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Paket</label>
                            <select value={getFormValue('package_id')} onChange={(e) => setFormData({ ...formData, package_id: e.target.value })} className="mt-1 block w-full" required>
                                <option value="">Pilih Paket</option>
                                {(packages || []).map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Keberangkatan</label>
                            <select value={getFormValue('departure_id')} onChange={(e) => setFormData({ ...formData, departure_id: e.target.value })} className="mt-1 block w-full" required>
                                <option value="">Pilih Keberangkatan</option>
                                {(departures || []).filter(d => d.package_id == getFormValue('package_id')).map(d => (
                                    <option key={d.id} value={d.id}>{formatDate(d.departure_date)}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe Kamar</label>
                            <select value={getFormValue('room_type')} onChange={(e) => setFormData({ ...formData, room_type: e.target.value })} className="mt-1 block w-full">
                                <option value="">Pilih Tipe Kamar</option>
                                <option value="QUAD">QUAD</option>
                                <option value="TRIPLE">TRIPLE</option>
                                <option value="DOUBLE">DOUBLE</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Total Tagihan (IDR)</label>
                            <input type="number" value={getFormValue('total_price')} onChange={(e) => setFormData({ ...formData, total_price: e.target.value })} className="mt-1 block w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Jamaah</label>
                            <select value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea rows="3" value={getFormValue('address')} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1 block w-full"></textarea>
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

export default Jamaah;
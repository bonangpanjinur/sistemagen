import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

const Finance = ({ userCapabilities }) => {
    const {
        data: payments,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('payments');
    
    const { jamaah, refreshData } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Jamaah', accessor: 'jamaah_name', sortable: true },
        { Header: 'Jumlah', accessor: 'amount', sortable: true, render: (val) => formatCurrency(val) },
        { Header: 'Tgl Bayar', accessor: 'payment_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Metode', accessor: 'payment_method', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true, 
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'confirmed' ? 'bg-green-100 text-green-800' :
                    val === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {val}
                </span>
            )
        },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? {
            ...item,
            payment_date: formatDateForInput(item.payment_date)
        } : {
            jamaah_id: '',
            amount: '',
            payment_date: '',
            payment_method: 'cash',
            status: 'pending',
            notes: ''
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
        await refreshData('payments');
        await refreshData('jamaah'); // Refresh jamaah juga
        closeModal();
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('payments');
            await refreshData('jamaah'); // Refresh jamaah juga
        }
    };
    
    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_finance') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari pembayaran..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Pembayaran
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={payments}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_finance"
                deleteCapability="manage_finance"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Pembayaran' : 'Tambah Pembayaran'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="jamaah_id" className="block text-sm font-medium text-gray-700">Jamaah</label>
                        <select
                            id="jamaah_id"
                            value={getFormValue('jamaah_id')}
                            onChange={(e) => setFormData({ ...formData, jamaah_id: e.target.value })}
                            className="mt-1 block w-full"
                            required
                        >
                            <option value="">Pilih Jamaah</option>
                            {(jamaah || []).map(j => (
                                <option key={j.id} value={j.id}>{j.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah (IDR)</label>
                            <input
                                type="number"
                                id="amount"
                                value={getFormValue('amount')}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">Tgl Bayar</label>
                            <input
                                type="date"
                                id="payment_date"
                                value={getFormValue('payment_date')}
                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">Metode</label>
                            <select
                                id="payment_method"
                                value={getFormValue('payment_method')}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="mt-1 block w-full"
                            >
                                <option value="cash">Cash</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="debit">Debit</option>
                                <option value="credit_card">Kartu Kredit</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                id="status"
                                value={getFormValue('status')}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="mt-1 block w-full"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan</label>
                        <textarea
                            id="notes"
                            rows="3"
                            value={getFormValue('notes')}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="mt-1 block w-full"
                        ></textarea>
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

export default Finance;
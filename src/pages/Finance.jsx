import React, { useState } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = ({ userCapabilities }) => {
    const {
        items: transactions,
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
    } = useCRUD('finance');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Proteksi akses
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    const canManage = caps.includes('manage_finance') || caps.includes('manage_options');

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Tanggal', accessor: 'date', sortable: true, render: (val) => val ? formatDate(val) : '-' },
        { Header: 'Keterangan', accessor: 'description' },
        { 
            Header: 'Tipe', 
            accessor: 'type',
            render: (val) => (
                <span className={`flex items-center gap-1 ${val === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {val === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {val === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
            )
        },
        { 
            Header: 'Nominal', 
            accessor: 'amount', 
            sortable: true,
            render: (val, item) => (
                <span className={`font-mono ${item.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                    {item.type === 'expense' ? '-' : ''}{formatCurrency(val || 0)}
                </span>
            )
        },
        { Header: 'Kategori', accessor: 'category', render: (val) => val || '-' }
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { description: '', amount: 0, type: 'income', date: new Date().toISOString().split('T')[0], category: '' });
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
            alert("Gagal menyimpan transaksi.");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm("Hapus transaksi ini?")) {
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
                    <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
                    <p className="text-sm text-gray-500">Pencatatan pemasukan dan pengeluaran.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <SearchInput onSearch={handleSearch} placeholder="Cari transaksi..." />
                    {canManage && (
                        <button
                            onClick={() => openModal(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Tambah Transaksi
                        </button>
                    )}
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={transactions}
                loading={loading}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={caps}
                editCapability="manage_finance"
                deleteCapability="manage_finance"
            />
            
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Transaksi' : 'Transaksi Baru'} show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input type="date" required className="mt-1 w-full border p-2 rounded" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe</label>
                            <select className="mt-1 w-full border p-2 rounded" value={formData.type || 'income'} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                        <input type="text" required className="mt-1 w-full border p-2 rounded" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                            <input type="number" required min="0" className="mt-1 w-full border p-2 rounded" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <input type="text" className="mt-1 w-full border p-2 rounded" placeholder="Contoh: Operasional" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
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

export default Finance;
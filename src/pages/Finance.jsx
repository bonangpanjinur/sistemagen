import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Finance = () => {
    const columns = [
        { header: 'Tanggal', accessor: 'transaction_date' },
        { 
            header: 'Tipe', 
            accessor: 'transaction_type',
            render: (row) => (
                <span className={`px-2 py-1 text-xs rounded font-bold ${row.transaction_type === 'income' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {row.transaction_type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
            )
        },
        { header: 'Deskripsi', accessor: 'description' },
        { 
            header: 'Jumlah', 
            accessor: 'amount',
            render: (row) => `Rp ${parseInt(row.amount).toLocaleString('id-ID')}`
        },
        { header: 'Status', accessor: 'status' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'income',
        amount: 0,
        description: '',
        payment_method: 'transfer',
        status: 'completed'
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({
                transaction_date: new Date().toISOString().split('T')[0],
                transaction_type: 'income',
                amount: 0,
                description: '',
                payment_method: 'transfer',
                status: 'completed'
            });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Keuangan & Transaksi">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Transaksi Baru</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Transaksi" : "Catat Transaksi Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Tanggal</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tipe Transaksi</label>
                            <select className="w-full border p-2 rounded" value={formData.transaction_type} onChange={e => setFormData({...formData, transaction_type: e.target.value})}>
                                <option value="income">Pemasukan (+)</option>
                                <option value="expense">Pengeluaran (-)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Jumlah (Rp)</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Deskripsi</label>
                        <textarea className="w-full border p-2 rounded" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Pembayaran DP Jamaah A"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Metode Pembayaran</label>
                            <select className="w-full border p-2 rounded" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                                <option value="cash">Tunai</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="completed">Selesai</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Gagal</option>
                            </select>
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Transaksi</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Finance;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Printer, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance');
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    
    // Menghitung ringkasan saat data berubah
    useEffect(() => {
        if (data) {
            const inc = data.filter(d => d.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
            const exp = data.filter(d => d.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
            setSummary({ income: inc, expense: exp, balance: inc - exp });
        }
    }, [data]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'income', date: '', amount: 0, description: '', category: 'pembayaran_paket' });

    const handleSave = async (e) => {
        e.preventDefault();
        if (await createItem(formData)) {
            setIsModalOpen(false);
            fetchData();
        }
    };

    const StatCard = ({ label, value, icon: Icon, color, bgColor }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</h3>
            </div>
        </div>
    );

    const columns = [
        { header: 'Tanggal', accessor: 'date', render: r => formatDate(r.date) },
        { header: 'Kategori', accessor: 'category', render: r => <span className="capitalize">{r.category.replace('_', ' ')}</span> },
        { header: 'Keterangan', accessor: 'description' },
        { header: 'Nominal', accessor: 'amount', className: 'text-right', render: r => (
            <span className={`font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {r.type === 'income' ? '+' : '-'} {formatCurrency(r.amount)}
            </span>
        )}
    ];

    return (
        <Layout title="Keuangan & Kasir">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Pemasukan Total" value={summary.income} icon={TrendingUp} color="text-green-600" bgColor="bg-green-50" />
                <StatCard label="Pengeluaran Total" value={summary.expense} icon={TrendingDown} color="text-red-600" bgColor="bg-red-50" />
                <StatCard label="Saldo Akhir" value={summary.balance} icon={Wallet} color="text-blue-600" bgColor="bg-blue-50" />
            </div>

            {/* Actions Area */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-700">Riwayat Transaksi</h3>
                <button onClick={() => { setFormData({type: 'income', date: new Date().toISOString().split('T')[0], amount: 0, category: 'pembayaran_paket'}); setIsModalOpen(true); }} className="btn-primary flex gap-2 shadow-lg transform hover:-translate-y-1 transition-all">
                    <Plus size={20}/> Catat Transaksi Baru
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} />

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Transaksi Kasir">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis Transaksi</label>
                            <select className="input-field font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="income" className="text-green-600">Pemasukan (In)</option>
                                <option value="expense" className="text-red-600">Pengeluaran (Out)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal</label>
                            <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Kategori</label>
                        <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="pembayaran_paket">Pembayaran Paket Jemaah</option>
                            <option value="operasional">Biaya Operasional</option>
                            <option value="gaji">Gaji Karyawan</option>
                            <option value="marketing">Biaya Marketing</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Nominal (Rp)</label>
                        <input type="number" className="input-field text-lg font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                    </div>

                    <div>
                        <label className="label">Keterangan / Catatan</label>
                        <textarea className="input-field" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Pembayaran DP Bpk. Budi"></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Finance;
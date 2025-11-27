import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Download, Filter, FileText, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem, fetchData } = useCRUD('umh/v1/finance');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ type: 'income', amount: 0, date: new Date().toISOString().split('T')[0] });
    const [filterType, setFilterType] = useState('all');

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { type: 'income', amount: 0, date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simulasi Upload File: Di real implementation, gunakan FormData
        // const formPayload = new FormData();
        // formPayload.append('proof_file', formData.proof_file);
        
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
            
        if (success) setIsModalOpen(false);
    };

    // FITUR 5: Upload File Handler (Simulation for MVP)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert to base64 for MVP preview or prepare for upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, proof_url: reader.result }); // Simpan URL dummy/base64
            };
            reader.readAsDataURL(file);
        }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'date', render: (row) => formatDate(row.date), sortable: true },
        { header: 'Keterangan', accessor: 'description' },
        { header: 'Kategori', accessor: 'category' },
        { 
            header: 'Tipe', 
            accessor: 'type',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
            )
        },
        { 
            header: 'Jumlah', 
            accessor: 'amount', 
            render: (row) => (
                <span className={row.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {row.type === 'expense' ? '-' : '+'}{formatCurrency(row.amount)}
                </span>
            ),
            sortable: true
        },
        // FITUR 5: Kolom Bukti Pembayaran
        {
            header: 'Bukti',
            accessor: 'proof_url',
            render: (row) => row.proof_url ? (
                <a href={row.proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs">
                    <FileText size={14} /> Lihat
                </a>
            ) : <span className="text-gray-400 text-xs">-</span>
        }
    ];

    const filteredData = filterType === 'all' ? data : data.filter(item => item.type === filterType);

    // Hitung Saldo
    const totalIncome = data.filter(d => d.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpense = data.filter(d => d.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <Layout title="Keuangan & Akuntansi">
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm">Total Pemasukan</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                    <p className="text-gray-500 text-sm">Total Pengeluaran</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Saldo Akhir</p>
                    <p className={`text-xl font-bold ${balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>{formatCurrency(balance)}</p>
                </div>
            </div>

            <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                    <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded text-sm ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-white border'}`}>Semua</button>
                    <button onClick={() => setFilterType('income')} className={`px-3 py-1 rounded text-sm ${filterType === 'income' ? 'bg-green-600 text-white' : 'bg-white border'}`}>Pemasukan</button>
                    <button onClick={() => setFilterType('expense')} className={`px-3 py-1 rounded text-sm ${filterType === 'expense' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Pengeluaran</button>
                </div>
                <button 
                    onClick={() => handleOpenModal('create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={18} /> Transaksi Baru
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={filteredData}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
                userCapabilities={user?.role}
                editCapability="manage_options" 
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Tambah Transaksi' : 'Edit Transaksi'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe</label>
                            <select 
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                        <input 
                            type="number" 
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            placeholder="Contoh: DP Jamaah, Listrik, Sewa Kantor"
                            value={formData.category || ''}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                        <textarea 
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            rows="2"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    {/* FITUR 5: Upload Bukti */}
                    <div className="border p-3 rounded bg-gray-50 border-dashed border-gray-300">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bukti Pembayaran / Kwitansi</label>
                        <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.proof_url && (
                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <CheckSquare size={12}/> File terpilih (Preview tersedia setelah simpan)
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Finance;
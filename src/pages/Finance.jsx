import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpCircle, ArrowDownCircle, Plus, Search } from 'lucide-react';

const Finance = () => {
    const [activeTab, setActiveTab] = useState('income');
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance', { transaction_type: activeTab });
    
    // Data Jemaah untuk Dropdown Pemasukan
    const [jamaahList, setJamaahList] = useState([]);
    const [searchJamaah, setSearchJamaah] = useState('');

    useEffect(() => { 
        fetchData();
        // Load Jemaah untuk referensi pembayaran
        if (activeTab === 'income') {
            api.get('umh/v1/jamaah').then(res => setJamaahList(res.data || []));
        }
    }, [activeTab, fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});

    // Filter Jemaah
    const filteredJamaah = jamaahList.filter(j => j.full_name.toLowerCase().includes(searchJamaah.toLowerCase()));

    const handleJamaahSelect = (jemaah) => {
        setFormData({
            ...formData,
            jamaah_id: jemaah.id,
            pic_name: jemaah.full_name,
            description: `Pembayaran Paket ${jemaah.package_type}`,
            // Di sini bisa ditambahkan logic untuk auto-set amount tagihan
        });
        setSearchJamaah(jemaah.full_name);
    };

    const handleOpen = () => {
        setEditId(null);
        setSearchJamaah('');
        setFormData({ 
            transaction_type: activeTab, transaction_date: new Date().toISOString().split('T')[0], 
            amount: '', description: '', pic_name: '', payment_method: 'Transfer', category: activeTab === 'income' ? 'Paket Umroh' : 'Operasional' 
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) setIsModalOpen(false);
    };

    const columns = activeTab === 'income' ? [
        { header: 'Tanggal', accessor: 'transaction_date' },
        { header: 'Dari (Jemaah)', accessor: 'pic_name', className: 'font-medium' },
        { header: 'Keterangan', accessor: 'description' },
        { header: 'Metode', accessor: 'payment_method' },
        { header: 'Jumlah', accessor: 'amount', render: r => <span className="text-green-600 font-bold">{formatCurrency(r.amount)}</span> },
    ] : [
        { header: 'Tanggal', accessor: 'transaction_date' },
        { header: 'Uraian', accessor: 'description', className: 'font-medium' },
        { header: 'Kategori', accessor: 'category' },
        { header: 'PIC', accessor: 'pic_name' },
        { header: 'Jumlah', accessor: 'amount', render: r => <span className="text-red-600 font-bold">{formatCurrency(r.amount)}</span> },
    ];

    return (
        <Layout title="Keuangan & Kas">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Laporan {activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran'}</h2>
                    <p className="text-sm text-gray-500">Monitor arus kas secara real-time.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('income')} className={`px-4 py-2 text-sm font-medium rounded-md flex gap-2 transition ${activeTab === 'income' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        <ArrowUpCircle size={16} /> Pemasukan
                    </button>
                    <button onClick={() => setActiveTab('expense')} className={`px-4 py-2 text-sm font-medium rounded-md flex gap-2 transition ${activeTab === 'expense' ? 'bg-white shadow text-red-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        <ArrowDownCircle size={16} /> Pengeluaran
                    </button>
                </div>
                <button onClick={handleOpen} className={`px-4 py-2 rounded shadow text-white flex gap-2 items-center ${activeTab === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    <Plus size={18} /> {activeTab === 'income' ? 'Terima Bayaran' : 'Catat Pengeluaran'}
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={item => { setFormData(item); setEditId(item.id); setIsModalOpen(true); }} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'income' ? "Form Penerimaan Pembayaran" : "Form Pengeluaran Operasional"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Tanggal Transaksi</label><input type="date" className="w-full border p-2 rounded" value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})} required /></div>
                        
                        {/* Kondisional Input Nama */}
                        <div className="col-span-2 relative">
                            <label className="text-xs font-bold text-gray-500 uppercase">{activeTab === 'income' ? 'Cari Nama Jemaah / Penyetor' : 'Uraian Pengeluaran'}</label>
                            {activeTab === 'income' ? (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input 
                                            className="w-full border p-2 pl-10 rounded focus:ring-green-500" 
                                            value={searchJamaah} 
                                            onChange={e => setSearchJamaah(e.target.value)} 
                                            placeholder="Ketik nama jemaah..." 
                                        />
                                    </div>
                                    {searchJamaah && searchJamaah !== formData.pic_name && (
                                        <div className="absolute z-10 bg-white border shadow-lg w-full max-h-40 overflow-y-auto rounded mt-1">
                                            {filteredJamaah.length > 0 ? filteredJamaah.map(j => (
                                                <div key={j.id} onClick={() => handleJamaahSelect(j)} className="p-2 hover:bg-green-50 cursor-pointer border-b text-sm">
                                                    <strong>{j.full_name}</strong> <span className="text-gray-500 text-xs">({j.package_type})</span>
                                                </div>
                                            )) : <div className="p-2 text-gray-500 text-sm italic">Data tidak ditemukan</div>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <input className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Beli ATK Kantor" required />
                            )}
                        </div>

                        {activeTab === 'income' ? (
                            <>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Metode Bayar</label><select className="w-full border p-2 rounded" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}><option value="Transfer">Transfer Bank</option><option value="Cash">Tunai</option><option value="QRIS">QRIS</option></select></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Tahap</label><select className="w-full border p-2 rounded" value={formData.payment_stage} onChange={e => setFormData({...formData, payment_stage: e.target.value})}><option value="DP">DP (Uang Muka)</option><option value="Pelunasan">Pelunasan</option><option value="Cicilan">Cicilan</option><option value="Booking">Booking Fee</option></select></div>
                                <div className="col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Keterangan Tambahan</label><input className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Catatan..." /></div>
                            </>
                        ) : (
                            <>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Kategori</label><select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Operasional</option><option>Transport</option><option>Konsumsi</option><option>Fee Agen</option><option>Marketing</option><option>Lainnya</option></select></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">PIC (Penanggung Jawab)</label><input className="w-full border p-2 rounded" value={formData.pic_name} onChange={e => setFormData({...formData, pic_name: e.target.value})} placeholder="Nama Staff" /></div>
                            </>
                        )}

                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nominal (Rp)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 font-bold">Rp</span>
                                <input type="number" className="w-full border p-2 pl-10 rounded text-lg font-bold text-gray-800" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required placeholder="0" />
                            </div>
                        </div>
                    </div>
                    
                    <button className={`w-full py-2 rounded text-white font-bold mt-4 shadow ${activeTab === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        Simpan Transaksi
                    </button>
                </form>
            </Modal>
        </Layout>
    );
};
export default Finance;
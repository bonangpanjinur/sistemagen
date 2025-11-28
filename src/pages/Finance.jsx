import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Finance = () => {
    // Pastikan endpoint API sudah benar sesuai backend
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance');
    const { data: jamaahList } = useCRUD('umh/v1/jamaah'); 

    // State untuk ringkasan saldo
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [filterType, setFilterType] = useState('all'); // all, income, expense

    // Hitung ulang saldo setiap kali data berubah
    useEffect(() => {
        if (data && Array.isArray(data)) {
            const income = data
                .filter(d => d.type === 'income')
                .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
            
            const expense = data
                .filter(d => d.type === 'expense')
                .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
            
            setSummary({ income, expense, balance: income - expense });
        }
    }, [data]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Form State Default
    const defaultForm = {
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'pembayaran_paket', // default category
        description: '',
        jamaah_id: '',
        payment_method: 'transfer'
    };
    const [formData, setFormData] = useState(defaultForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        if (item) {
            setFormData({
                ...item,
                // Pastikan format tanggal benar untuk input type="date"
                date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
            });
        } else {
            setFormData(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Bersihkan data sebelum kirim
        const payload = { ...formData };
        
        // Jika pengeluaran, hapus relasi jemaah agar tidak error/kotor di DB
        if (payload.type === 'expense') {
            payload.jamaah_id = null;
        }

        const success = modalMode === 'create' 
            ? await createItem(payload) 
            : await updateItem(currentItem.id, payload);
        
        if (success) {
            setIsModalOpen(false);
            fetchData(); // Refresh data
        }
    };

    // Filter data tabel berdasarkan tab yang dipilih
    const filteredData = filterType === 'all' 
        ? data 
        : data.filter(d => d.type === filterType);

    // Definisi Kolom Tabel
    const columns = [
        { 
            header: 'Tanggal', 
            accessor: 'date', 
            render: (row) => <span className="text-sm text-gray-600">{formatDate(row.date)}</span> 
        },
        { 
            header: 'Tipe', 
            accessor: 'type', 
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {row.type === 'income' ? 'Masuk' : 'Keluar'}
                </span>
            ) 
        },
        { 
            header: 'Kategori', 
            accessor: 'category', 
            render: (row) => (
                <span className="capitalize font-medium">
                    {row.category ? row.category.replace(/_/g, ' ') : '-'}
                </span>
            ) 
        },
        { 
            header: 'Keterangan', 
            accessor: 'description',
            render: (row) => (
                <div className="max-w-xs">
                    <div className="truncate text-sm">{row.description || '-'}</div>
                    {row.jamaah_name && (
                        <div className="text-xs text-gray-500 mt-1">
                            Oleh: {row.jamaah_name}
                        </div>
                    )}
                </div>
            )
        },
        { 
            header: 'Jumlah (Rp)', 
            accessor: 'amount', 
            className: 'text-right',
            render: (row) => (
                <span className={`font-bold ${
                    row.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                    {row.type === 'expense' ? '-' : '+'} {formatCurrency(row.amount)}
                </span>
            ) 
        },
    ];

    return (
        <Layout title="Keuangan & Arus Kas">
            {/* --- DASHBOARD RINGKASAN --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Kartu Saldo */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Sisa Saldo Kas</p>
                        <h3 className={`text-2xl font-bold ${summary.balance < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                            {formatCurrency(summary.balance)}
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Wallet size={24} />
                    </div>
                </div>

                {/* Kartu Pemasukan */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.income)}
                        </h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <ArrowUpCircle size={24} />
                    </div>
                </div>

                {/* Kartu Pengeluaran */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary.expense)}
                        </h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <ArrowDownCircle size={24} />
                    </div>
                </div>
            </div>

            {/* --- TOOLBAR & FILTER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            filterType === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Semua
                    </button>
                    <button 
                        onClick={() => setFilterType('income')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            filterType === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-green-600'
                        }`}
                    >
                        Pemasukan
                    </button>
                    <button 
                        onClick={() => setFilterType('expense')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            filterType === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                        Pengeluaran
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2" title="Cetak Laporan">
                        <Printer size={18} /> <span className="hidden md:inline">Cetak</span>
                    </button>
                    <button 
                        onClick={() => handleOpenModal('create')} 
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} /> Transaksi Baru
                    </button>
                </div>
            </div>

            {/* --- TABEL DATA --- */}
            <CrudTable 
                columns={columns} 
                data={filteredData} 
                loading={loading} 
                onEdit={(item) => handleOpenModal('edit', item)} 
                onDelete={deleteItem} 
            />

            {/* --- MODAL FORM --- */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={modalMode === 'create' ? 'Tambah Transaksi Baru' : 'Edit Transaksi'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Baris 1: Tipe & Tanggal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis Transaksi</label>
                            <select 
                                className="input-field bg-gray-50" 
                                value={formData.type} 
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFormData({
                                        ...formData, 
                                        type: newType,
                                        // Reset kategori ke default yang sesuai saat tipe berubah
                                        category: newType === 'income' ? 'pembayaran_paket' : 'operasional',
                                        jamaah_id: '' 
                                    });
                                }}
                            >
                                <option value="income">🔵 Pemasukan (Uang Masuk)</option>
                                <option value="expense">🔴 Pengeluaran (Uang Keluar)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal Transaksi</label>
                            <input 
                                type="date" 
                                className="input-field" 
                                value={formData.date} 
                                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Baris 2: Kategori (Dinamis) */}
                    <div>
                        <label className="label">Kategori</label>
                        <select 
                            className="input-field" 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            {formData.type === 'income' ? (
                                <>
                                    <optgroup label="Dari Jemaah">
                                        <option value="pembayaran_paket">Pembayaran Paket Umrah/Haji</option>
                                        <option value="dp">Uang Muka (DP)</option>
                                        <option value="pelunasan">Pelunasan</option>
                                        <option value="perlengkapan">Pembelian Perlengkapan</option>
                                    </optgroup>
                                    <optgroup label="Lainnya">
                                        <option value="investasi">Suntikan Modal/Investasi</option>
                                        <option value="lainnya">Pemasukan Lain-lain</option>
                                    </optgroup>
                                </>
                            ) : (
                                <>
                                    <optgroup label="Operasional">
                                        <option value="gaji">Gaji Karyawan</option>
                                        <option value="fee_agen">Komisi/Fee Agen</option>
                                        <option value="operasional">Operasional Kantor (Listrik/Air/Wifi)</option>
                                        <option value="atk">ATK & Perlengkapan Kantor</option>
                                    </optgroup>
                                    <optgroup label="Pemasaran & Vendor">
                                        <option value="iklan">Biaya Iklan (Ads)</option>
                                        <option value="vendor_hotel">Bayar Hotel (Land Arrangement)</option>
                                        <option value="vendor_tiket">Bayar Tiket Pesawat</option>
                                        <option value="vendor_visa">Bayar Visa</option>
                                    </optgroup>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Baris 3: Pilih Jemaah (Hanya jika Pemasukan) */}
                    {formData.type === 'income' && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <label className="label text-blue-800">Terima Dari (Jemaah)</label>
                            <select 
                                className="input-field" 
                                value={formData.jamaah_id} 
                                onChange={(e) => setFormData({...formData, jamaah_id: e.target.value})}
                            >
                                <option value="">-- Pilih Nama Jemaah (Opsional) --</option>
                                {jamaahList && jamaahList.map((j) => (
                                    <option key={j.id} value={j.id}>
                                        {j.full_name} - {j.passport_number || 'Tanpa Paspor'}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-blue-600 mt-1">
                                *Pilih jemaah jika pembayaran terkait paket umrah.
                            </p>
                        </div>
                    )}

                    {/* Baris 4: Nominal */}
                    <div>
                        <label className="label">Nominal (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
                            <input 
                                type="number" 
                                className="input-field pl-10 text-lg font-bold text-gray-800" 
                                placeholder="0" 
                                value={formData.amount} 
                                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Baris 5: Metode Bayar & Keterangan */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Metode Pembayaran</label>
                            <select 
                                className="input-field" 
                                value={formData.payment_method} 
                                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                            >
                                <option value="transfer">Transfer Bank</option>
                                <option value="cash">Tunai (Cash)</option>
                                <option value="edc">Kartu Debit/Kredit (EDC)</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Keterangan / Catatan</label>
                        <textarea 
                            className="input-field h-20" 
                            placeholder="Contoh: Pelunasan Paket Hemat a.n Budi" 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary px-6"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className={`btn-primary px-6 flex items-center gap-2 ${
                                formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {loading ? 'Menyimpan...' : (
                                <>
                                    <Plus size={18} /> Simpan Transaksi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Finance;

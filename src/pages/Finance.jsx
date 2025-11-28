import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, CheckSquare, FileText, Loader2, User, Printer, Calculator, Wallet, AlertTriangle, History } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Finance = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('finance');
    const { data: jamaahList, fetchData: fetchJamaah } = useCRUD('jamaah'); 
    
    useEffect(() => {
        fetchJamaah();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // State Form
    const [formData, setFormData] = useState({ 
        type: 'income', 
        amount: '', 
        date: new Date().toISOString().split('T')[0],
        category: 'pembayaran_paket',
        jamaah_id: '',
        payment_method: 'transfer',
        description: '',
        proof_url: ''
    });

    // State untuk Statistik & History Pembayaran Jamaah
    const [selectedJamaahStats, setSelectedJamaahStats] = useState(null);
    const [jamaahHistory, setJamaahHistory] = useState([]); // [NEW] Simpan history transaksi
    
    const [filterType, setFilterType] = useState('all');
    const [isUploading, setIsUploading] = useState(false);

    // Kategori
    const incomeCategories = [
        { value: 'pembayaran_paket', label: 'Pembayaran Paket Umrah/Haji' },
        { value: 'pendaftaran', label: 'Biaya Pendaftaran/Booking' },
        { value: 'upgrade_kamar', label: 'Upgrade Kamar/Hotel' },
        { value: 'add_on', label: 'Tambahan (Paspor/Vaksin)' },
        { value: 'lainnya', label: 'Pemasukan Lainnya' }
    ];

    const expenseCategories = [
        { value: 'vendor_tiket', label: 'Pembayaran Tiket Pesawat' },
        { value: 'vendor_hotel', label: 'Pembayaran Hotel/Land Arrangement' },
        { value: 'vendor_visa', label: 'Biaya Visa' },
        { value: 'operasional', label: 'Operasional Kantor' },
        { value: 'marketing', label: 'Biaya Iklan/Marketing' },
        { value: 'komisi_agen', label: 'Komisi Agen' },
        { value: 'gaji', label: 'Gaji Karyawan' }
    ];

    // --- LOGIKA HITUNG PEMBAYARAN & HISTORY JAMAAH ---
    useEffect(() => {
        if (formData.jamaah_id && formData.type === 'income') {
            const jamaah = jamaahList.find(j => String(j.id) === String(formData.jamaah_id));
            if (jamaah) {
                // Ambil semua transaksi milik jamaah ini
                const transactions = data.filter(d => 
                    String(d.jamaah_id) === String(formData.jamaah_id) && 
                    d.type === 'income' &&
                    (modalMode === 'create' || String(d.id) !== String(currentItem?.id))
                );

                // Urutkan transaksi terbaru di atas untuk history
                const sortedHistory = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
                setJamaahHistory(sortedHistory);

                const previousPayments = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
                const packagePrice = Number(jamaah.package_price) || 0;
                const remaining = packagePrice - previousPayments;

                setSelectedJamaahStats({
                    name: jamaah.full_name,
                    package: jamaah.package_name || 'Paket Custom',
                    price: packagePrice,
                    paid: previousPayments,
                    remaining: remaining > 0 ? remaining : 0,
                    isPaidOff: remaining <= 0 // Flag Lunas
                });
            }
        } else {
            setSelectedJamaahStats(null);
            setJamaahHistory([]);
        }
    }, [formData.jamaah_id, formData.type, data, jamaahList, modalMode, currentItem]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { 
            type: 'income', 
            amount: '', 
            date: new Date().toISOString().split('T')[0],
            category: 'pembayaran_paket',
            jamaah_id: '',
            payment_method: 'transfer',
            description: '',
            proof_url: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // [NEW] Validasi Overpayment Sederhana (Warning Only)
        if (selectedJamaahStats && formData.type === 'income') {
            const inputAmount = Number(formData.amount);
            if (inputAmount > selectedJamaahStats.remaining + 1000) { // Toleransi 1000 rupiah
               if(!window.confirm(`PERINGATAN: Jumlah pembayaran (${formatCurrency(inputAmount)}) melebihi sisa tagihan (${formatCurrency(selectedJamaahStats.remaining)}). Apakah Anda yakin ingin melanjutkannya sebagai kelebihan bayar/deposit?`)) {
                   return;
               }
            }
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
            
        if (success) setIsModalOpen(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading('Mengunggah bukti...');

        try {
            const response = await api.upload(file, 'finance_proof', formData.jamaah_id);
            setFormData(prev => ({ ...prev, proof_url: response.url }));
            toast.success('Bukti berhasil diunggah!', { id: toastId });
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error('Gagal mengunggah file.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    // --- FITUR CETAK KWITANSI ---
    const handlePrintReceipt = (transaction) => {
        const jamaah = jamaahList.find(j => String(j.id) === String(transaction.jamaah_id));
        const jamaahName = jamaah ? jamaah.full_name : 'Umum/Non-Jamaah';
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Kwitansi - ${transaction.id}</title>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #333; padding-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
                    .header p { margin: 5px 0; font-size: 14px; color: #666; }
                    .kwitansi-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
                    .content { margin-bottom: 40px; line-height: 2; font-size: 16px; }
                    .row { display: flex; }
                    .label { width: 180px; font-weight: bold; }
                    .value { flex: 1; border-bottom: 1px dotted #999; }
                    .amount-box { 
                        background: #f0f0f0; border: 2px solid #333; 
                        padding: 10px 20px; font-size: 20px; font-weight: bold; 
                        display: inline-block; margin-top: 20px; border-radius: 8px;
                    }
                    .footer { display: flex; justify-content: space-between; margin-top: 50px; }
                    .signature { text-align: center; width: 200px; }
                    .signature-line { margin-top: 80px; border-top: 1px solid #333; }
                    .meta { font-size: 10px; color: #999; margin-top: 50px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Travel Umrah Berkah</h1>
                    <p>Jl. H. Nawi Raya No. 12, Jakarta Selatan | Telp: (021) 777-8888</p>
                    <p>Izin Umrah No. 123/2023 | Izin Haji No. 456/2023</p>
                </div>

                <div class="kwitansi-title">KWITANSI PEMBAYARAN</div>

                <div class="content">
                    <div class="row">
                        <span class="label">No. Transaksi</span>
                        <span class="value">: #TRX-${String(transaction.id).padStart(6, '0')}</span>
                    </div>
                    <div class="row">
                        <span class="label">Telah Terima Dari</span>
                        <span class="value">: ${jamaahName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Untuk Pembayaran</span>
                        <span class="value">: ${transaction.category.replace('_', ' ').toUpperCase()} - ${transaction.description || '-'}</span>
                    </div>
                    <div class="row">
                        <span class="label">Metode Bayar</span>
                        <span class="value">: ${transaction.payment_method.toUpperCase()} (${formatDate(transaction.date)})</span>
                    </div>
                    
                    <div class="amount-box">
                        ${formatCurrency(transaction.amount)}
                    </div>
                </div>

                <div class="footer">
                    <div class="signature">
                        <p>Penyetor</p>
                        <div class="signature-line">(${jamaahName})</div>
                    </div>
                    <div class="signature">
                        <p>Jakarta, ${formatDate(new Date())}</p>
                        <p>Kasir / Admin</p>
                        <div class="signature-line">(${user?.name || 'Admin'})</div>
                    </div>
                </div>

                <div class="meta">
                    Dicetak otomatis oleh Sistem Manajemen Umrah pada ${new Date().toLocaleString()}
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const columns = [
        { header: 'Tanggal', accessor: 'date', render: (row) => formatDate(row.date), sortable: true },
        { 
            header: 'Tipe', 
            accessor: 'type',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.type === 'income' ? 'Masuk' : 'Keluar'}
                </span>
            )
        },
        {
            header: 'Terkait Jamaah',
            accessor: 'jamaah_id',
            render: (row) => {
                const j = jamaahList.find(x => String(x.id) === String(row.jamaah_id));
                return j ? <span className="font-medium text-blue-700">{j.full_name}</span> : <span className="text-gray-400">-</span>;
            }
        },
        { 
            header: 'Jumlah', 
            accessor: 'amount', 
            render: (row) => (
                <span className={row.type === 'income' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {row.type === 'expense' ? '-' : '+'}{formatCurrency(row.amount)}
                </span>
            ),
            sortable: true
        },
        {
            header: 'Metode',
            accessor: 'payment_method',
            render: (row) => <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">{row.payment_method}</span>
        },
        {
            header: 'Aksi',
            accessor: 'id',
            render: (row) => (
                <div className="flex gap-2">
                    {/* Tombol Cetak Kwitansi Khusus Pemasukan */}
                    {row.type === 'income' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handlePrintReceipt(row); }}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Cetak Kwitansi"
                        >
                            <Printer size={16} />
                        </button>
                    )}
                    {row.proof_url && (
                        <a href={row.proof_url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded" title="Lihat Bukti">
                            <FileText size={16} />
                        </a>
                    )}
                </div>
            )
        }
    ];

    const filteredData = filterType === 'all' ? data : data.filter(item => item.type === filterType);
    const totalIncome = data.filter(d => d.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpense = data.filter(d => d.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <Layout title="Keuangan & Kasir">
            {/* Kartu Ringkasan Atas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Pemasukan</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><Wallet size={24}/></div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Pengeluaran</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-full text-red-600"><Calculator size={24}/></div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Saldo Kas</p>
                        <p className={`text-xl font-bold ${balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>{formatCurrency(balance)}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><CheckSquare size={24}/></div>
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
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow-sm"
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
                    {/* Tipe Transaksi */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe Transaksi</label>
                            <select 
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                value={formData.type}
                                onChange={(e) => setFormData({
                                    ...formData, 
                                    type: e.target.value,
                                    category: e.target.value === 'income' ? 'pembayaran_paket' : 'operasional',
                                    jamaah_id: e.target.value === 'expense' ? '' : formData.jamaah_id
                                })}
                            >
                                <option value="income">Pemasukan (Terima Uang)</option>
                                <option value="expense">Pengeluaran (Bayar Vendor/Ops)</option>
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

                    {/* PILIH JAMAAH (Khusus Income) */}
                    {formData.type === 'income' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <User size={16} /> Pilih Jamaah Pembayar
                            </label>
                            <select 
                                className="block w-full rounded border-blue-300 shadow-sm p-2 border focus:ring-blue-500"
                                value={formData.jamaah_id}
                                onChange={(e) => setFormData({...formData, jamaah_id: e.target.value})}
                            >
                                <option value="">-- Pilih Nama Jamaah --</option>
                                {jamaahList && jamaahList.map(j => (
                                    <option key={j.id} value={j.id}>
                                        {j.full_name} - {j.package_name || 'Tanpa Paket'}
                                    </option>
                                ))}
                            </select>

                            {/* KARTU KONTROL & HISTORY PEMBAYARAN */}
                            {selectedJamaahStats && (
                                <div className="mt-3 bg-white p-3 rounded border border-blue-100 shadow-sm text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Harga Paket:</span>
                                        <span className="font-semibold">{formatCurrency(selectedJamaahStats.price)}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Sudah Dibayar:</span>
                                        <span className="font-semibold text-green-600">{formatCurrency(selectedJamaahStats.paid)}</span>
                                    </div>
                                    <div className="border-t my-2"></div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-800 font-bold">Sisa Tagihan:</span>
                                        <span className={`font-bold text-lg ${selectedJamaahStats.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(selectedJamaahStats.remaining)}
                                        </span>
                                    </div>

                                    {/* Indikator LUNAS */}
                                    {selectedJamaahStats.isPaidOff && (
                                        <div className="bg-green-100 text-green-800 text-center font-bold py-1 rounded mb-2 border border-green-200">
                                            ✅ LUNAS
                                        </div>
                                    )}
                                    
                                    {/* TOMBOL BAYAR SISA */}
                                    {selectedJamaahStats.remaining > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, amount: selectedJamaahStats.remaining }))}
                                            className="w-full bg-blue-100 text-blue-700 py-1.5 rounded text-xs font-bold hover:bg-blue-200 transition-colors flex justify-center items-center gap-1 mb-3"
                                        >
                                            <Calculator size={14}/> Auto-fill Sisa Tagihan ({formatCurrency(selectedJamaahStats.remaining)})
                                        </button>
                                    )}

                                    {/* [NEW] MINI HISTORY PEMBAYARAN */}
                                    {jamaahHistory.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                                                <History size={12}/> Riwayat Pembayaran Sebelumnya:
                                            </p>
                                            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                                                {jamaahHistory.map(tx => (
                                                    <div key={tx.id} className="flex justify-between items-center text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                                                        <div>
                                                            <span className="text-gray-600">{formatDate(tx.date)}</span>
                                                            <span className="mx-1">•</span>
                                                            <span className="uppercase text-[10px] bg-gray-200 px-1 rounded">{tx.payment_method}</span>
                                                        </div>
                                                        <span className="font-medium text-green-700">{formatCurrency(tx.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select 
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                required
                            >
                                {formData.type === 'income' ? (
                                    incomeCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)
                                ) : (
                                    expenseCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jumlah Uang (Rp)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className={`mt-1 block w-full rounded border shadow-sm p-2 font-mono text-lg font-bold
                                        ${selectedJamaahStats && Number(formData.amount) > selectedJamaahStats.remaining + 1000 ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    required
                                    min="1"
                                />
                                {selectedJamaahStats && Number(formData.amount) > selectedJamaahStats.remaining + 1000 && (
                                    <div className="absolute right-2 top-3 text-red-500 animate-pulse">
                                        <AlertTriangle size={20} />
                                    </div>
                                )}
                            </div>
                            {selectedJamaahStats && Number(formData.amount) > selectedJamaahStats.remaining + 1000 && (
                                <p className="text-xs text-red-600 mt-1 font-bold">⚠️ Nominal melebihi sisa tagihan!</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                        <div className="flex gap-4">
                            {['transfer', 'tunai', 'qris', 'cek'].map(method => (
                                <label key={method} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded border hover:bg-gray-100">
                                    <input 
                                        type="radio" 
                                        name="payment_method"
                                        value={method}
                                        checked={formData.payment_method === method}
                                        onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                        className="text-blue-600"
                                    />
                                    <span className="capitalize text-sm font-medium">{method}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keterangan / Catatan</label>
                        <textarea 
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            rows="2"
                            placeholder="Contoh: Pelunasan Paket a.n Budi"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="border p-3 rounded bg-gray-50 border-dashed border-gray-300">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Bukti Transfer / Kwitansi
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                            {isUploading && <Loader2 className="animate-spin text-blue-600" size={20} />}
                        </div>
                        
                        {formData.proof_url && !isUploading && (
                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <CheckSquare size={12}/> File Tersimpan di Server
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow flex items-center gap-2" disabled={isUploading}>
                            {isUploading ? 'Mengunggah...' : (
                                <><CheckSquare size={16}/> {modalMode === 'create' ? 'Simpan Transaksi' : 'Update Transaksi'}</>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Finance;
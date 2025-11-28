import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { 
    BanknotesIcon, CalculatorIcon, DocumentChartBarIcon, 
    ArrowTrendingDownIcon, ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

const Finance = () => {
    const [activeTab, setActiveTab] = useState('cashier'); // cashier | expense | report
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // --- STATE KASIR (PEMASUKAN) ---
    const [searchBooking, setSearchBooking] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [payForm, setPayForm] = useState({ amount: '', method: 'transfer', bank_name: '', transaction_date: new Date().toISOString().split('T')[0], notes: '' });

    // --- STATE PENGELUARAN (EXPENSE) ---
    const [accounts, setAccounts] = useState([]);
    const [expenseForm, setExpenseForm] = useState({ 
        description: '', amount: '', account_id: '', transaction_date: new Date().toISOString().split('T')[0], type: 'expense' 
    });

    // --- STATE LAPORAN ---
    const [summary, setSummary] = useState(null);
    const [journal, setJournal] = useState([]);
    const [reportPeriod, setReportPeriod] = useState('this_month');

    // LOAD INITIAL DATA
    useEffect(() => {
        api.get('/umh/v1/finance/accounts').then(res => setAccounts(res.data));
    }, []);

    // LOAD REPORT DATA ON TAB CHANGE
    useEffect(() => {
        if (activeTab === 'report') fetchReport();
    }, [activeTab, reportPeriod]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const sumRes = await api.get(`/umh/v1/finance/summary?period=${reportPeriod}`);
            const jorRes = await api.get('/umh/v1/finance/transactions?type=all');
            setSummary(sumRes.data);
            setJournal(jorRes.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    // --- HANDLERS KASIR ---
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (searchBooking.length >= 3) {
                try {
                    const res = await api.get(`/umh/v1/payments/search-booking?term=${searchBooking}`);
                    setSearchResults(res.data);
                } catch (err) {}
            } else { setSearchResults([]); }
        }, 500);
        return () => clearTimeout(delay);
    }, [searchBooking]);

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/umh/v1/payments', { booking_id: selectedBooking.id, ...payForm });
            setMsg({ type: 'success', text: 'Pembayaran Diterima!' });
            setSelectedBooking(null);
            setPayForm({ ...payForm, amount: '', notes: '' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Gagal proses pembayaran' });
        } finally { setLoading(false); }
    };

    // --- HANDLERS EXPENSE ---
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/umh/v1/finance/transactions', expenseForm);
            setMsg({ type: 'success', text: 'Pengeluaran Tercatat!' });
            setExpenseForm({ ...expenseForm, description: '', amount: '' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Gagal simpan pengeluaran' });
        } finally { setLoading(false); }
    };

    const formatPrice = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <Layout title="Pusat Keuangan">
            <div className="bg-white rounded shadow min-h-[500px]">
                
                {/* TABS */}
                <div className="flex border-b overflow-x-auto">
                    <button onClick={() => setActiveTab('cashier')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'cashier' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500'}`}>
                        <CalculatorIcon className="h-5 w-5"/> Kasir (Pemasukan)
                    </button>
                    <button onClick={() => setActiveTab('expense')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'expense' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-500'}`}>
                        <ArrowTrendingDownIcon className="h-5 w-5"/> Catat Pengeluaran
                    </button>
                    <button onClick={() => setActiveTab('report')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'report' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}>
                        <DocumentChartBarIcon className="h-5 w-5"/> Laporan & Buku Besar
                    </button>
                </div>

                <div className="p-6">
                    {msg && <Alert type={msg.type} message={msg.text} />}

                    {/* === TAB 1: KASIR === */}
                    {activeTab === 'cashier' && (
                        <div className="max-w-3xl mx-auto">
                            {!selectedBooking ? (
                                <div className="text-center py-10">
                                    <h3 className="text-lg font-bold mb-4">Terima Pembayaran Jemaah</h3>
                                    <input 
                                        type="text" 
                                        className="w-full max-w-md border p-3 rounded text-center" 
                                        placeholder="🔍 Cari Kode Booking / Nama Jemaah..."
                                        value={searchBooking}
                                        onChange={(e) => setSearchBooking(e.target.value)}
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 border rounded max-w-md mx-auto bg-white shadow text-left">
                                            {searchResults.map(b => (
                                                <div key={b.id} onClick={() => setSelectedBooking(b)} className="p-3 hover:bg-green-50 cursor-pointer border-b">
                                                    <div className="font-bold text-blue-600">{b.booking_code}</div>
                                                    <div className="text-sm">{b.contact_name} <span className="text-red-500 font-bold ml-2">Sisa: {formatPrice(b.remaining)}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handlePaySubmit} className="bg-gray-50 p-6 rounded border">
                                    <h3 className="font-bold mb-4 border-b pb-2">Input Pembayaran: {selectedBooking.booking_code}</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <input type="date" className="border p-2 rounded" value={payForm.transaction_date} onChange={e => setPayForm({...payForm, transaction_date: e.target.value})} required />
                                        <input type="number" className="border p-2 rounded" placeholder="Nominal (Rp)" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required />
                                        <select className="border p-2 rounded" value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})}>
                                            <option value="transfer">Transfer Bank</option>
                                            <option value="cash">Tunai</option>
                                        </select>
                                        <input type="text" className="border p-2 rounded" placeholder="Nama Bank (Opsional)" value={payForm.bank_name} onChange={e => setPayForm({...payForm, bank_name: e.target.value})} />
                                    </div>
                                    <textarea className="w-full border p-2 rounded mb-4" placeholder="Catatan..." value={payForm.notes} onChange={e => setPayForm({...payForm, notes: e.target.value})}></textarea>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                                        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex-1">Simpan</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* === TAB 2: PENGELUARAN === */}
                    {activeTab === 'expense' && (
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={handleExpenseSubmit} className="bg-red-50 p-6 rounded border border-red-200">
                                <h3 className="font-bold text-red-800 mb-6 flex items-center gap-2">
                                    <ArrowTrendingDownIcon className="h-6 w-6"/> Form Pengeluaran Operasional
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Tanggal</label>
                                        <input type="date" className="w-full border p-2 rounded" value={expenseForm.transaction_date} onChange={e => setExpenseForm({...expenseForm, transaction_date: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Kategori Biaya</label>
                                        <select className="w-full border p-2 rounded" value={expenseForm.account_id} onChange={e => setExpenseForm({...expenseForm, account_id: e.target.value})} required>
                                            <option value="">-- Pilih Kategori --</option>
                                            {accounts.filter(a => a.type === 'expense').map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Keterangan</label>
                                        <input type="text" className="w-full border p-2 rounded" placeholder="Contoh: Bayar Listrik Bulan Nov" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Nominal (Rp)</label>
                                        <input type="number" className="w-full border p-2 rounded text-lg font-bold text-red-700" placeholder="0" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 mt-4">
                                        CATAT PENGELUARAN
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* === TAB 3: LAPORAN === */}
                    {activeTab === 'report' && (
                        <div>
                            {/* Filter */}
                            <div className="flex justify-end mb-4">
                                <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className="border p-2 rounded bg-gray-50 font-medium">
                                    <option value="this_month">Bulan Ini</option>
                                    <option value="last_month">Bulan Lalu</option>
                                    <option value="year">Tahun Ini</option>
                                </select>
                            </div>

                            {/* Summary Cards */}
                            {summary && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-green-50 p-4 rounded border border-green-200">
                                        <p className="text-green-800 text-xs font-bold uppercase">Total Pemasukan</p>
                                        <h3 className="text-2xl font-bold text-green-700">{formatPrice(summary.income)}</h3>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded border border-red-200">
                                        <p className="text-red-800 text-xs font-bold uppercase">Total Pengeluaran</p>
                                        <h3 className="text-2xl font-bold text-red-700">{formatPrice(summary.expense)}</h3>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                        <p className="text-blue-800 text-xs font-bold uppercase">Laba / Rugi Bersih</p>
                                        <h3 className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>{formatPrice(summary.profit)}</h3>
                                    </div>
                                </div>
                            )}

                            {/* Journal Table */}
                            <h4 className="font-bold text-gray-700 mb-3">Jurnal Transaksi (Buku Besar)</h4>
                            {loading ? <Spinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 border-b text-left">
                                                <th className="p-3">Tanggal</th>
                                                <th className="p-3">Kategori</th>
                                                <th className="p-3">Keterangan</th>
                                                <th className="p-3 text-right">Debit (Masuk)</th>
                                                <th className="p-3 text-right">Kredit (Keluar)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journal.map(item => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">{item.transaction_date}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${item.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {item.category || 'Umum'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{item.description}</td>
                                                    <td className="p-3 text-right text-green-700 font-medium">
                                                        {item.type === 'income' ? formatPrice(item.amount) : '-'}
                                                    </td>
                                                    <td className="p-3 text-right text-red-700 font-medium">
                                                        {item.type === 'expense' ? formatPrice(item.amount) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Finance;
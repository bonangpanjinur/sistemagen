import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Alert from '../components/Alert';
import { 
    BanknotesIcon, MagnifyingGlassIcon, CalculatorIcon 
} from '@heroicons/react/24/outline';

const Finance = () => {
    const [activeTab, setActiveTab] = useState('input'); // input | history
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // State untuk Input Pembayaran
    const [searchBooking, setSearchBooking] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [payForm, setPayForm] = useState({
        amount: '', method: 'transfer', bank_name: '', transaction_date: new Date().toISOString().split('T')[0], notes: ''
    });

    // State untuk History
    const [history, setHistory] = useState([]);

    // --- LOGIC INPUT PEMBAYARAN ---

    // Cari Booking saat user mengetik
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchBooking.length >= 3) {
                try {
                    const res = await api.get(`/umh/v1/payments/search-booking?term=${searchBooking}`);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchBooking]);

    const selectBooking = (booking) => {
        setSelectedBooking(booking);
        setSearchBooking('');
        setSearchResults([]);
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setLoading(true);
        try {
            const payload = {
                booking_id: selectedBooking.id,
                ...payForm
            };
            await api.post('/umh/v1/payments', payload);
            setMsg({ type: 'success', text: 'Pembayaran berhasil disimpan!' });
            // Reset
            setSelectedBooking(null);
            setPayForm({ amount: '', method: 'transfer', bank_name: '', transaction_date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan' });
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC HISTORY ---
    useEffect(() => {
        if (activeTab === 'history') {
            const fetchHistory = async () => {
                const res = await api.get('/umh/v1/payments');
                setHistory(res.data);
            };
            fetchHistory();
        }
    }, [activeTab]);

    const formatPrice = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    return (
        <Layout title="Keuangan & Kasir">
            <div className="bg-white rounded shadow min-h-[500px]">
                {/* TABS */}
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveTab('input')}
                        className={`px-6 py-4 font-bold flex items-center gap-2 ${activeTab === 'input' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500'}`}
                    >
                        <CalculatorIcon className="h-5 w-5"/> Input Pembayaran
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-4 font-bold flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}
                    >
                        <BanknotesIcon className="h-5 w-5"/> Riwayat Transaksi
                    </button>
                </div>

                <div className="p-6">
                    {msg && <Alert type={msg.type} message={msg.text} />}

                    {/* === TAB 1: INPUT PEMBAYARAN === */}
                    {activeTab === 'input' && (
                        <div className="max-w-3xl mx-auto">
                            {!selectedBooking ? (
                                // STEP 1: CARI BOOKING
                                <div className="text-center py-10">
                                    <h3 className="text-lg font-bold mb-4">Cari Tagihan Booking</h3>
                                    <div className="relative max-w-lg mx-auto">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-green-500 focus:border-green-500" 
                                            placeholder="Ketik Kode Booking atau Nama Jemaah..."
                                            value={searchBooking}
                                            onChange={(e) => setSearchBooking(e.target.value)}
                                        />
                                        
                                        {/* Dropdown Hasil Pencarian */}
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white shadow-xl border rounded-lg mt-1 text-left">
                                                {searchResults.map(b => (
                                                    <div 
                                                        key={b.id} 
                                                        onClick={() => selectBooking(b)}
                                                        className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-0"
                                                    >
                                                        <div className="font-bold text-blue-600">{b.booking_code}</div>
                                                        <div className="text-sm">{b.contact_name}</div>
                                                        <div className="text-xs text-red-500 font-bold">Sisa Tagihan: {formatPrice(b.remaining)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-2">Hanya booking yang belum lunas yang akan muncul.</p>
                                </div>
                            ) : (
                                // STEP 2: FORM BAYAR
                                <form onSubmit={handlePaySubmit} className="bg-gray-50 p-6 rounded-lg border">
                                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                                        <div>
                                            <div className="text-sm text-gray-500">Pembayaran Untuk:</div>
                                            <div className="text-xl font-bold text-blue-700">{selectedBooking.booking_code}</div>
                                            <div className="font-medium">{selectedBooking.contact_name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Sisa Tagihan:</div>
                                            <div className="text-xl font-bold text-red-600">{formatPrice(selectedBooking.remaining)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Tanggal Transaksi</label>
                                            <input 
                                                type="date" 
                                                required
                                                className="w-full border p-2 rounded"
                                                value={payForm.transaction_date}
                                                onChange={e => setPayForm({...payForm, transaction_date: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Nominal Pembayaran (IDR)</label>
                                            <input 
                                                type="number" 
                                                required
                                                className="w-full border p-2 rounded text-lg font-bold"
                                                placeholder="0"
                                                value={payForm.amount}
                                                onChange={e => setPayForm({...payForm, amount: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Metode Bayar</label>
                                            <select 
                                                className="w-full border p-2 rounded"
                                                value={payForm.method}
                                                onChange={e => setPayForm({...payForm, method: e.target.value})}
                                            >
                                                <option value="transfer">Transfer Bank</option>
                                                <option value="cash">Tunai (Cash)</option>
                                                <option value="credit_card">Kartu Kredit</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Bank Tujuan (Jika Transfer)</label>
                                            <input 
                                                type="text" 
                                                className="w-full border p-2 rounded"
                                                placeholder="Contoh: BCA 123456"
                                                value={payForm.bank_name}
                                                onChange={e => setPayForm({...payForm, bank_name: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold mb-1">Catatan</label>
                                            <textarea 
                                                className="w-full border p-2 rounded"
                                                placeholder="Keterangan tambahan..."
                                                value={payForm.notes}
                                                onChange={e => setPayForm({...payForm, notes: e.target.value})}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedBooking(null)} 
                                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            Batal / Ganti Booking
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
                                        >
                                            {loading ? 'Memproses...' : 'SIMPAN PEMBAYARAN'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* === TAB 2: HISTORY === */}
                    {activeTab === 'history' && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3 text-left">Tanggal</th>
                                        <th className="p-3 text-left">Kode Booking</th>
                                        <th className="p-3 text-left">Penyetor</th>
                                        <th className="p-3 text-left">Metode</th>
                                        <th className="p-3 text-right">Nominal</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(item => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{item.transaction_date}</td>
                                            <td className="p-3 font-mono font-bold text-blue-600">{item.booking_code}</td>
                                            <td className="p-3">{item.contact_name}</td>
                                            <td className="p-3 uppercase">
                                                {item.method} 
                                                {item.bank_name && <span className="text-gray-500 text-xs ml-1">({item.bank_name})</span>}
                                            </td>
                                            <td className="p-3 text-right font-bold text-green-700">{formatPrice(item.amount)}</td>
                                            <td className="p-3 text-center">
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs uppercase">{item.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr><td colSpan="6" className="p-6 text-center text-gray-400">Belum ada riwayat transaksi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Finance;
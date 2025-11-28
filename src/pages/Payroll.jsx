import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import CrudTable from '../components/CrudTable';
import { 
    BanknotesIcon, CalendarIcon, DocumentCurrencyDollarIcon, 
    CheckCircleIcon, PrinterIcon 
} from '@heroicons/react/24/outline';

const Payroll = () => {
    const [activeTab, setActiveTab] = useState('payroll'); // payroll | loans
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // STATE PAYROLL
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM default bulan ini
    const [payrolls, setPayrolls] = useState([]);
    
    // STATE DATA PENDUKUNG (Untuk dropdown form)
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        // Load employees list for dropdowns
        api.get('/umh/v1/hr/employees').then(res => setEmployees(res.data));
    }, []);

    useEffect(() => {
        if (activeTab === 'payroll') fetchPayrolls();
    }, [activeTab, period]);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/umh/v1/hr/payroll?period=${period}`);
            setPayrolls(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleGenerate = async () => {
        if (!window.confirm(`Generate gaji untuk periode ${period}? Data yang sudah ada tidak akan ditimpa.`)) return;
        setLoading(true);
        try {
            const res = await api.post('/umh/v1/hr/payroll/generate', { period });
            setMsg({ type: 'success', text: res.data.message });
            fetchPayrolls();
        } catch (err) {
            setMsg({ type: 'error', text: 'Gagal generate payroll.' });
        } finally { setLoading(false); }
    };

    const handlePay = async (id) => {
        if (!window.confirm("Tandai gaji ini SUDAH DIBAYAR? Status tidak bisa dikembalikan.")) return;
        try {
            await api.post('/umh/v1/hr/payroll/pay', { id });
            fetchPayrolls();
            setMsg({ type: 'success', text: 'Status berhasil diupdate.' });
        } catch (err) { alert("Gagal update status"); }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    // --- CONFIG TABLE KASBON (LOANS) ---
    const loanColumns = [
        { header: 'Nama Karyawan', accessor: 'display_name' },
        { header: 'Jumlah Pinjaman', accessor: 'amount', render: (val) => formatCurrency(val) },
        { header: 'Sisa Hutang', accessor: 'remaining_amount', render: (val) => <span className="text-red-600 font-bold">{formatCurrency(val)}</span> },
        { header: 'Tenor', accessor: 'repayment_months', render: (val) => `${val} Bulan` },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${val === 'approved' ? 'bg-green-100 text-green-800' : (val === 'paid_off' ? 'bg-gray-200 text-gray-500 line-through' : 'bg-yellow-100 text-yellow-800')}`}>
                    {val}
                </span>
            ) 
        },
    ];

    const loanFields = [
        { 
            name: 'employee_id', 
            label: 'Karyawan', 
            type: 'select', 
            options: employees.map(e => ({ value: e.id, label: e.display_name })),
            required: true 
        },
        { name: 'amount', label: 'Nominal Pinjaman (Rp)', type: 'number', required: true },
        { name: 'repayment_months', label: 'Dicicil Berapa Kali?', type: 'number', defaultValue: 1 },
        { name: 'reason', label: 'Alasan', type: 'textarea' },
        { 
            name: 'status', 
            label: 'Status Persetujuan', 
            type: 'select', 
            options: [{ value: 'pending', label: 'Pending Review' }, { value: 'approved', label: 'Disetujui (Cairkan)' }, { value: 'rejected', label: 'Ditolak' }] 
        },
    ];

    return (
        <Layout title="Payroll & Keuangan Karyawan">
            <div className="bg-white rounded shadow min-h-[500px]">
                
                {/* TABS HEADER */}
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveTab('payroll')} 
                        className={`px-6 py-4 font-bold flex items-center gap-2 ${activeTab === 'payroll' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500'}`}
                    >
                        <DocumentCurrencyDollarIcon className="h-5 w-5"/> Penggajian (Payroll)
                    </button>
                    <button 
                        onClick={() => setActiveTab('loans')} 
                        className={`px-6 py-4 font-bold flex items-center gap-2 ${activeTab === 'loans' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-500'}`}
                    >
                        <BanknotesIcon className="h-5 w-5"/> Kasbon & Pinjaman
                    </button>
                </div>

                <div className="p-6">
                    {msg && <Alert type={msg.type} message={msg.text} />}

                    {/* === TAB 1: PAYROLL === */}
                    {activeTab === 'payroll' && (
                        <div>
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-50 p-4 rounded border">
                                <div className="flex items-center gap-4">
                                    <label className="font-bold text-gray-700">Periode Gaji:</label>
                                    <input 
                                        type="month" 
                                        value={period} 
                                        onChange={(e) => setPeriod(e.target.value)} 
                                        className="border p-2 rounded"
                                    />
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <DocumentCurrencyDollarIcon className="h-5 w-5"/>
                                    Generate Gaji {period}
                                </button>
                            </div>

                            {/* Table Payroll */}
                            {loading ? <Spinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 border-b text-left text-gray-600">
                                                <th className="p-3">Karyawan</th>
                                                <th className="p-3 text-right">Gaji Pokok</th>
                                                <th className="p-3 text-right">Tunjangan</th>
                                                <th className="p-3 text-right text-red-600">Potongan (Kasbon)</th>
                                                <th className="p-3 text-right font-bold text-green-700">Gaji Bersih</th>
                                                <th className="p-3 text-center">Status</th>
                                                <th className="p-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payrolls.map(pay => (
                                                <tr key={pay.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div className="font-bold">{pay.display_name}</div>
                                                        <div className="text-xs text-gray-500">{pay.position}</div>
                                                    </td>
                                                    <td className="p-3 text-right">{formatCurrency(pay.basic_salary)}</td>
                                                    <td className="p-3 text-right">{formatCurrency(pay.total_allowance)}</td>
                                                    <td className="p-3 text-right text-red-600">
                                                        {pay.total_deductions > 0 ? `(${formatCurrency(pay.total_deductions)})` : '-'}
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-green-700 text-lg">
                                                        {formatCurrency(pay.net_salary)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${pay.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                                            {pay.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center flex justify-center gap-2">
                                                        {pay.status === 'draft' && (
                                                            <button 
                                                                onClick={() => handlePay(pay.id)}
                                                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                                                                title="Tandai Sudah Dibayar"
                                                            >
                                                                <CheckCircleIcon className="h-4 w-4"/> Bayar
                                                            </button>
                                                        )}
                                                        <button className="text-gray-500 hover:text-blue-600" title="Cetak Slip">
                                                            <PrinterIcon className="h-5 w-5"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {payrolls.length === 0 && (
                                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Belum ada data gaji untuk periode ini. Klik Generate.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === TAB 2: KASBON === */}
                    {activeTab === 'loans' && (
                        <div>
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-sm text-red-800">
                                <strong>Info Kasbon:</strong> Jika status kasbon "Approved", sistem akan otomatis memotong gaji karyawan tersebut pada saat Generate Payroll bulan berikutnya sampai lunas.
                            </div>
                            <CrudTable 
                                endpoint="/umh/v1/hr/loans"
                                columns={loanColumns}
                                formFields={loanFields}
                                title="Data Peminjaman Karyawan"
                            />
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default Payroll;
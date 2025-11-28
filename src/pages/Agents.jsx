import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import CrudTable from '../components/CrudTable';
import { 
    UserCircleIcon, BanknotesIcon, BriefcaseIcon, CheckBadgeIcon 
} from '@heroicons/react/24/outline';

const Agents = () => {
    const [activeTab, setActiveTab] = useState('list'); // list | commissions
    const [commissions, setCommissions] = useState([]);
    const [loadingCom, setLoadingCom] = useState(false);

    // --- TAB 1: DAFTAR AGEN (CRUD) ---
    
    const agentColumns = [
        { 
            header: 'Nama Agen', 
            accessor: 'display_name',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-blue-900">{val}</div>
                    <div className="text-xs text-gray-500">{row.agent_code}</div>
                </div>
            )
        },
        { 
            header: 'Level', 
            accessor: 'level', 
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${val === 'gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>
                    {val}
                </span>
            ) 
        },
        { header: 'Fee/Pax', accessor: 'fixed_commission', render: (val) => val > 0 ? `Rp ${parseInt(val).toLocaleString()}` : '-' },
        { 
            header: 'Pending Komisi', 
            accessor: 'pending_commission',
            render: (val) => val > 0 ? <span className="text-red-600 font-bold">Rp {parseInt(val).toLocaleString()}</span> : '-' 
        },
        { header: 'Total Sales', accessor: 'total_sales', render: (val) => `${val} Booking` },
    ];

    const agentFields = [
        { name: 'user_id', label: 'User ID (WP)', type: 'number', required: true, placeholder: 'ID User WordPress' },
        { name: 'level', label: 'Level Kemitraan', type: 'select', options: [{ value: 'silver', label: 'Silver' }, { value: 'gold', label: 'Gold' }, { value: 'platinum', label: 'Platinum' }] },
        { name: 'fixed_commission', label: 'Komisi Tetap per Jemaah (Rp)', type: 'number', placeholder: '500000' },
        { name: 'commission_rate', label: 'Atau Komisi Persen (%)', type: 'number', placeholder: '0' },
        { name: 'bank_name', label: 'Nama Bank', type: 'text' },
        { name: 'bank_account_number', label: 'No. Rekening', type: 'text' },
        { name: 'bank_account_holder', label: 'Atas Nama', type: 'text' },
    ];

    // --- TAB 2: RIWAYAT KOMISI ---

    useEffect(() => {
        if (activeTab === 'commissions') fetchCommissions();
    }, [activeTab]);

    const fetchCommissions = async () => {
        setLoadingCom(true);
        try {
            const res = await api.get('/umh/v1/agents/commissions');
            setCommissions(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoadingCom(false); }
    };

    const handlePayout = async (id) => {
        if(!window.confirm("Tandai komisi ini sudah dibayarkan ke agen?")) return;
        try {
            await api.post('/umh/v1/agents/payout', { id });
            fetchCommissions();
        } catch (err) { alert("Gagal proses payout"); }
    };

    return (
        <Layout title="Kemitraan & Keagenan">
            <div className="bg-white rounded shadow min-h-[500px]">
                
                {/* TABS */}
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('list')} className={`px-6 py-4 font-bold flex items-center gap-2 ${activeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}>
                        <UserCircleIcon className="h-5 w-5"/> Data Mitra Agen
                    </button>
                    <button onClick={() => setActiveTab('commissions')} className={`px-6 py-4 font-bold flex items-center gap-2 ${activeTab === 'commissions' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500'}`}>
                        <BanknotesIcon className="h-5 w-5"/> Riwayat Komisi
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'list' && (
                        <div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-sm text-blue-800">
                                <p className="font-bold">Info:</p>
                                <p>Daftarkan User WordPress sebagai Agen di sini. Level agen menentukan besaran komisi default mereka.</p>
                            </div>
                            <CrudTable 
                                endpoint="/umh/v1/agents"
                                columns={agentColumns}
                                formFields={agentFields}
                                title="Database Agen"
                            />
                        </div>
                    )}

                    {activeTab === 'commissions' && (
                        <div>
                            <h3 className="font-bold text-gray-700 mb-4">Laporan Komisi Agen</h3>
                            {loadingCom ? <Spinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 border-b text-left">
                                                <th className="p-3">Tanggal</th>
                                                <th className="p-3">Nama Agen</th>
                                                <th className="p-3">Sumber (Booking)</th>
                                                <th className="p-3 text-right">Nominal</th>
                                                <th className="p-3 text-center">Status</th>
                                                <th className="p-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {commissions.map(com => (
                                                <tr key={com.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">{new Date(com.created_at).toLocaleDateString()}</td>
                                                    <td className="p-3 font-medium">{com.agent_name}</td>
                                                    <td className="p-3">
                                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{com.booking_code}</span>
                                                        <div className="text-xs text-gray-500 mt-1">{com.description}</div>
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-green-600">Rp {parseInt(com.amount).toLocaleString()}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs uppercase ${com.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                            {com.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {com.status === 'pending' && (
                                                            <button 
                                                                onClick={() => handlePayout(com.id)}
                                                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1 mx-auto"
                                                            >
                                                                <CheckBadgeIcon className="h-3 w-3"/> Bayar
                                                            </button>
                                                        )}
                                                        {com.status === 'paid' && <span className="text-xs text-gray-400">Selesai</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {commissions.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-400">Belum ada data komisi.</td></tr>}
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

export default Agents;
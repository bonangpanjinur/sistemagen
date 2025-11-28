import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { 
    DocumentTextIcon, CheckCircleIcon, ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

const Manifest = () => {
    const [departures, setDepartures] = useState([]);
    const [selectedDep, setSelectedDep] = useState('');
    const [paxList, setPaxList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Bulk Action State
    const [actionField, setActionField] = useState('visa_status');
    const [actionValue, setActionValue] = useState('');

    useEffect(() => {
        api.get('/umh/v1/bookings/departures').then(res => setDepartures(res.data));
    }, []);

    useEffect(() => {
        if (selectedDep) fetchManifest();
    }, [selectedDep]);

    const fetchManifest = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/umh/v1/documents/manifest/${selectedDep}`);
            setPaxList(res.data);
            setSelectedIds([]); // Reset selection
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- SELECTION LOGIC ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paxList.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // --- BULK UPDATE LOGIC ---
    const handleBulkUpdate = async () => {
        if (!actionValue) return alert("Pilih status baru dulu!");
        if (!window.confirm(`Update ${selectedIds.length} jemaah terpilih?`)) return;

        setLoading(true);
        try {
            const payload = {
                ids: selectedIds,
                field: actionField,
                value: actionValue
            };
            const res = await api.post('/umh/v1/documents/bulk-update', payload);
            setMsg({ type: 'success', text: res.data.message });
            fetchManifest(); // Refresh data
        } catch (err) {
            setMsg({ type: 'error', text: 'Gagal update data' });
        } finally {
            setLoading(false);
        }
    };

    // --- EXPORT CSV (Simple Client Side) ---
    const handleExport = () => {
        if (paxList.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Nama Lengkap,No. Paspor,NIK,Status Visa,Status Paspor\n"; // Header

        paxList.forEach(p => {
            const row = `"${p.full_name}","${p.passport_number || ''}","${p.nik || ''}","${p.visa_status}","${p.passport_status}"`;
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `manifest_umrah_${selectedDep}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // Helper render status
    const renderStatus = (val, type) => {
        let color = 'bg-gray-100 text-gray-600';
        if (val === 'issued' || val === 'received') color = 'bg-green-100 text-green-800';
        if (val === 'submitted' || val === 'processing') color = 'bg-yellow-100 text-yellow-800';
        if (val === 'rejected' || val === 'missing') color = 'bg-red-100 text-red-800';
        
        return <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${color}`}>{val}</span>;
    };

    return (
        <Layout title="Handling Dokumen & Manifest">
            <div className="bg-white rounded shadow p-6 min-h-[500px]">
                
                {/* Header Control */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-500 mb-1">PILIH KEBERANGKATAN</label>
                        <select 
                            className="w-full border p-2 rounded"
                            value={selectedDep}
                            onChange={(e) => setSelectedDep(e.target.value)}
                        >
                            <option value="">-- Pilih Jadwal --</option>
                            {departures.map(d => (
                                <option key={d.id} value={d.id}>{d.departure_date} - {d.package_name}</option>
                            ))}
                        </select>
                    </div>
                    {selectedDep && (
                        <button onClick={handleExport} className="border border-green-600 text-green-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-green-50">
                            <ArrowDownTrayIcon className="h-5 w-5"/> Export Excel (CSV)
                        </button>
                    )}
                </div>

                {msg && <Alert type={msg.type} message={msg.text} />}

                {/* BULK ACTION BAR */}
                {selectedIds.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4 flex flex-col md:flex-row items-center gap-4 animate-pulse">
                        <div className="font-bold text-blue-800 flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5"/> {selectedIds.length} Jemaah Dipilih
                        </div>
                        <div className="flex gap-2 items-center flex-1">
                            <span className="text-sm">Ubah:</span>
                            <select 
                                className="border p-1 rounded text-sm" 
                                value={actionField} 
                                onChange={(e) => setActionField(e.target.value)}
                            >
                                <option value="visa_status">Status Visa</option>
                                <option value="passport_status">Status Paspor</option>
                            </select>
                            <span className="text-sm">Menjadi:</span>
                            <select 
                                className="border p-1 rounded text-sm min-w-[150px]"
                                value={actionValue}
                                onChange={(e) => setActionValue(e.target.value)}
                            >
                                <option value="">-- Pilih Status --</option>
                                {actionField === 'visa_status' ? (
                                    <>
                                        <option value="pending">Pending</option>
                                        <option value="submitted">Submitted (Proses)</option>
                                        <option value="issued">Issued (Terbit)</option>
                                        <option value="rejected">Rejected (Ditolak)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="not_received">Belum Diterima</option>
                                        <option value="received">Diterima di Kantor</option>
                                        <option value="returned">Dikembalikan ke Jemaah</option>
                                    </>
                                )}
                            </select>
                            <button 
                                onClick={handleBulkUpdate}
                                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm font-bold"
                            >
                                UPDATE STATUS
                            </button>
                        </div>
                    </div>
                )}

                {/* TABLE */}
                {selectedDep ? (
                    loading ? <Spinner /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b text-left">
                                        <th className="p-3 w-10 text-center">
                                            <input type="checkbox" onChange={handleSelectAll} checked={paxList.length > 0 && selectedIds.length === paxList.length} />
                                        </th>
                                        <th className="p-3">Nama Jemaah</th>
                                        <th className="p-3">Paspor</th>
                                        <th className="p-3 text-center">Status Paspor</th>
                                        <th className="p-3 text-center">Status Visa</th>
                                        <th className="p-3">Nomor Visa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paxList.map(pax => (
                                        <tr key={pax.id} className={`border-b hover:bg-gray-50 ${selectedIds.includes(pax.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="p-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(pax.id)} 
                                                    onChange={() => handleSelectRow(pax.id)}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold">{pax.full_name}</div>
                                                <div className="text-xs text-gray-500">{pax.full_name_ar || '-'}</div>
                                            </td>
                                            <td className="p-3 font-mono">{pax.passport_number || <span className="text-red-400 italic">Belum Ada</span>}</td>
                                            <td className="p-3 text-center">{renderStatus(pax.passport_status)}</td>
                                            <td className="p-3 text-center">{renderStatus(pax.visa_status)}</td>
                                            <td className="p-3 text-gray-600 text-xs">{pax.visa_number || '-'}</td>
                                        </tr>
                                    ))}
                                    {paxList.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-400">Belum ada jemaah di keberangkatan ini.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded">
                        <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Pilih Keberangkatan untuk mengelola manifest.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Manifest;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { 
    TruckIcon, ClipboardDocumentCheckIcon, CheckCircleIcon 
} from '@heroicons/react/24/outline';

// Daftar Barang Standar (Bisa dibuat dinamis via Master Data nanti jika mau)
const LOGISTIC_ITEMS = [
    { key: 'koper', label: 'Koper Hardcase' },
    { key: 'tas_paspor', label: 'Tas Paspor' },
    { key: 'batik', label: 'Bahan Batik' },
    { key: 'ihram', label: 'Kain Ihram / Mukena' },
    { key: 'buku_doa', label: 'Buku Doa & Panduan' },
    { key: 'id_card', label: 'ID Card & Siskopatuh' },
];

const Logistics = () => {
    const [departures, setDepartures] = useState([]);
    const [selectedDeparture, setSelectedDeparture] = useState('');
    const [loading, setLoading] = useState(false);
    const [passengers, setPassengers] = useState([]);
    const [filterName, setFilterName] = useState('');

    // Load Dropdown
    useEffect(() => {
        api.get('/umh/v1/bookings/departures').then(res => setDepartures(res.data));
    }, []);

    // Load Data Tabel
    useEffect(() => {
        if (selectedDeparture) fetchLogistics();
    }, [selectedDeparture]);

    const fetchLogistics = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/umh/v1/logistics/${selectedDeparture}`);
            setPassengers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Toggle Checkbox
    const handleToggleItem = async (paxId, itemKey, currentStatus) => {
        // Optimistic Update (UI duluan biar cepat)
        const newPaxList = passengers.map(p => {
            if (p.passenger_id === paxId) {
                const newItems = { ...p.items };
                if (currentStatus) {
                    delete newItems[itemKey]; // Uncheck
                } else {
                    newItems[itemKey] = { status: 'taken', taken_date: new Date().toISOString() }; // Check
                }
                return { ...p, items: newItems };
            }
            return p;
        });
        setPassengers(newPaxList);

        // API Call Background
        try {
            await api.post('/umh/v1/logistics/update', {
                passenger_id: paxId,
                item_name: itemKey,
                action: currentStatus ? 'return' : 'take'
            });
        } catch (err) {
            console.error("Gagal sync status");
            fetchLogistics(); // Revert jika gagal
        }
    };

    // Filter Pencarian Lokal
    const filteredData = passengers.filter(p => 
        p.full_name.toLowerCase().includes(filterName.toLowerCase()) || 
        p.booking_code.toLowerCase().includes(filterName.toLowerCase())
    );

    // Hitung Progress Kelengkapan
    const calculateProgress = (items) => {
        const takenCount = LOGISTIC_ITEMS.filter(i => items && items[i.key]).length;
        return Math.round((takenCount / LOGISTIC_ITEMS.length) * 100);
    };

    return (
        <Layout title="Distribusi Logistik & Perlengkapan">
            <div className="bg-white rounded shadow p-6">
                
                {/* Header Control */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Pilih Keberangkatan</label>
                        <select 
                            className="w-full border p-2 rounded"
                            value={selectedDeparture}
                            onChange={(e) => setSelectedDeparture(e.target.value)}
                        >
                            <option value="">-- Pilih Jadwal --</option>
                            {departures.map(d => (
                                <option key={d.id} value={d.id}>{d.departure_date} - {d.package_name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedDeparture && (
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Cari Jemaah</label>
                            <input 
                                type="text" 
                                placeholder="Nama Jemaah..." 
                                className="w-full border p-2 rounded"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Main Content */}
                {selectedDeparture ? (
                    loading ? <Spinner /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b text-left">
                                        <th className="p-3 w-64 min-w-[200px]">Nama Jemaah</th>
                                        <th className="p-3 w-24 text-center">Ukuran</th>
                                        <th className="p-3 w-32 text-center">Kelengkapan</th>
                                        {LOGISTIC_ITEMS.map(item => (
                                            <th key={item.key} className="p-3 text-center min-w-[100px] border-l">
                                                {item.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(pax => {
                                        const progress = calculateProgress(pax.items);
                                        return (
                                            <tr key={pax.passenger_id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="font-bold text-gray-800">{pax.full_name}</div>
                                                    <div className="text-xs text-gray-500">{pax.booking_code} • {pax.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {pax.clothing_size ? (
                                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">{pax.clothing_size}</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[60px]">
                                                            <div className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold">{progress}%</span>
                                                    </div>
                                                </td>
                                                {LOGISTIC_ITEMS.map(item => {
                                                    const isTaken = pax.items && pax.items[item.key];
                                                    return (
                                                        <td key={item.key} className="p-3 text-center border-l bg-gray-50/30">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                                                                checked={!!isTaken}
                                                                onChange={() => handleToggleItem(pax.passenger_id, item.key, !!isTaken)}
                                                            />
                                                            {isTaken && (
                                                                <div className="text-[10px] text-green-600 mt-1">
                                                                    {new Date(isTaken.taken_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                    {filteredData.length === 0 && (
                                        <tr><td colSpan={3 + LOGISTIC_ITEMS.length} className="p-6 text-center text-gray-500">Tidak ada data jemaah.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded">
                        <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Silakan pilih keberangkatan untuk melihat checklist logistik.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Logistics;
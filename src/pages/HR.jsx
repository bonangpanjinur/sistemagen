import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import CrudTable from '../components/CrudTable';
import { 
    UsersIcon, MapPinIcon, QrCodeIcon, ClockIcon, 
    IdentificationIcon, CheckCircleIcon 
} from '@heroicons/react/24/outline';

const HR = () => {
    const [activeTab, setActiveTab] = useState('attendance'); // attendance | employees | offices
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // --- STATE UNTUK ABSENSI ---
    const [todayLogs, setTodayLogs] = useState([]);
    const [geoLoc, setGeoLoc] = useState({ lat: null, lng: null, error: null });
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [scanMode, setScanMode] = useState(false); // Untuk simulasi scan QR
    const [qrInput, setQrInput] = useState(''); // Token hasil scan

    useEffect(() => {
        if (activeTab === 'attendance') fetchLogs();
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/umh/v1/hr/attendance');
            setTodayLogs(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    // --- LOGIC GPS ---
    const getLocation = () => {
        if (!navigator.geolocation) {
            setGeoLoc({ ...geoLoc, error: "Browser tidak support GPS" });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeoLoc({ 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude, 
                    error: null 
                });
            },
            (error) => {
                setGeoLoc({ ...geoLoc, error: "Gagal mengambil lokasi. Pastikan GPS aktif." });
            }
        );
    };

    // --- LOGIC SUBMIT ABSEN ---
    const handleAttendance = async (type) => {
        if (!geoLoc.lat) {
            alert("Sedang mengambil lokasi... Silakan tunggu sebentar.");
            getLocation();
            return;
        }

        setIsCheckingIn(true);
        try {
            const payload = {
                latitude: geoLoc.lat,
                longitude: geoLoc.lng,
                type: type, // 'remote_gps' or 'office_qr'
                qr_token: type === 'office_qr' ? qrInput : null
            };

            const res = await api.post('/umh/v1/hr/attendance/submit', payload);
            setMsg({ type: 'success', text: res.data.message });
            fetchLogs(); // Refresh tabel
            setScanMode(false); // Tutup modal scan
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal absen' });
        } finally {
            setIsCheckingIn(false);
        }
    };

    // --- CONFIG CRUD (KARYAWAN & KANTOR) ---
    
    // Tab Karyawan
    const employeeColumns = [
        { header: 'Nama Staff', accessor: 'display_name' },
        { header: 'Email', accessor: 'user_email' },
        { header: 'Jabatan', accessor: 'position' },
        { header: 'Gaji Pokok', accessor: 'basic_salary', render: (val) => val ? `Rp ${parseInt(val).toLocaleString()}` : '-' },
    ];
    // Note: Untuk form, user_id harusnya dropdown list user WP. Di sini text input dulu utk demo.
    const employeeFields = [
        { name: 'user_id', label: 'User ID (WP)', type: 'number', required: true, placeholder: 'ID User WordPress' },
        { name: 'position', label: 'Jabatan', type: 'text', required: true },
        { name: 'basic_salary', label: 'Gaji Pokok', type: 'number' },
        { name: 'allowance_transport', label: 'Tunjangan Transport', type: 'number' },
        { name: 'allowance_meal', label: 'Tunjangan Makan', type: 'number' },
    ];

    // Tab Kantor
    const officeColumns = [
        { header: 'Nama Kantor', accessor: 'name' },
        { header: 'Koordinat', accessor: 'latitude', render: (val, row) => `${val}, ${row.longitude}` },
        { header: 'Radius', accessor: 'radius_meter', render: (val) => `${val}m` },
        { 
            header: 'QR Code', 
            accessor: 'qr_token',
            render: (val, row) => (
                <button 
                    onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${val}`, '_blank')}
                    className="text-blue-600 underline text-xs flex items-center gap-1"
                >
                    <QrCodeIcon className="h-4 w-4"/> Lihat QR
                </button>
            )
        }
    ];
    const officeFields = [
        { name: 'name', label: 'Nama Kantor', type: 'text', required: true },
        { name: 'latitude', label: 'Latitude', type: 'text', placeholder: '-6.200000' },
        { name: 'longitude', label: 'Longitude', type: 'text', placeholder: '106.816666' },
        { name: 'radius_meter', label: 'Radius Toleransi (Meter)', type: 'number', defaultValue: 50 },
    ];

    return (
        <Layout title="HR & Absensi Cerdas">
            <div className="bg-white rounded shadow min-h-[500px]">
                
                {/* TABS */}
                <div className="flex border-b overflow-x-auto">
                    <button onClick={() => setActiveTab('attendance')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'attendance' ? 'border-b-2 border-green-500 text-green-700' : 'text-gray-500'}`}>
                        <ClockIcon className="h-5 w-5"/> Absensi Hari Ini
                    </button>
                    <button onClick={() => setActiveTab('employees')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'employees' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}>
                        <UsersIcon className="h-5 w-5"/> Data Karyawan
                    </button>
                    <button onClick={() => setActiveTab('offices')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'offices' ? 'border-b-2 border-purple-500 text-purple-700' : 'text-gray-500'}`}>
                        <MapPinIcon className="h-5 w-5"/> Lokasi Kantor & QR
                    </button>
                </div>

                <div className="p-6">
                    {msg && <Alert type={msg.type} message={msg.text} />}

                    {/* === TAB 1: ABSENSI === */}
                    {activeTab === 'attendance' && (
                        <div>
                            {/* Panel Absen Diri Sendiri */}
                            <div className="bg-gray-50 p-4 rounded-lg border mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-800">Halo, Staff! Belum absen hari ini?</h3>
                                    <p className="text-sm text-gray-500">
                                        Lokasi Anda: {geoLoc.lat ? `${geoLoc.lat}, ${geoLoc.lng}` : (geoLoc.error || 'Mengambil lokasi...')}
                                    </p>
                                    {!geoLoc.lat && (
                                        <button onClick={getLocation} className="text-xs text-blue-600 underline mt-1">Refresh Lokasi GPS</button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setScanMode(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <QrCodeIcon className="h-5 w-5"/> Scan QR Kantor
                                    </button>
                                    <button 
                                        onClick={() => handleAttendance('remote_gps')}
                                        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <MapPinIcon className="h-5 w-5"/> Absen Remote
                                    </button>
                                </div>
                            </div>

                            {/* Tabel Log */}
                            <h4 className="font-bold mb-3 text-gray-600">Log Kehadiran Hari Ini</h4>
                            {loading ? <Spinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 border-b text-left">
                                                <th className="p-3">Nama Staff</th>
                                                <th className="p-3">Masuk</th>
                                                <th className="p-3">Pulang</th>
                                                <th className="p-3">Tipe</th>
                                                <th className="p-3">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {todayLogs.map(log => (
                                                <tr key={log.id} className="border-b">
                                                    <td className="p-3 font-medium">{log.display_name}</td>
                                                    <td className="p-3 text-green-700 font-bold">
                                                        {log.check_in_time ? log.check_in_time.split(' ')[1] : '-'}
                                                    </td>
                                                    <td className="p-3 text-red-700 font-bold">
                                                        {log.check_out_time ? log.check_out_time.split(' ')[1] : '-'}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${log.type === 'office_qr' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {log.type === 'office_qr' ? 'Kantor' : 'Remote'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-500 text-xs">{log.notes}</td>
                                                </tr>
                                            ))}
                                            {todayLogs.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-400">Belum ada data absen hari ini.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === TAB 2: KARYAWAN === */}
                    {activeTab === 'employees' && (
                        <CrudTable 
                            endpoint="/umh/v1/hr/employees"
                            columns={employeeColumns}
                            formFields={employeeFields}
                            title="Database Karyawan"
                        />
                    )}

                    {/* === TAB 3: KANTOR === */}
                    {activeTab === 'offices' && (
                        <div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-sm text-yellow-800">
                                <p className="font-bold">Cara Kerja Absen QR:</p>
                                <ul className="list-disc ml-4 mt-1">
                                    <li>Tambahkan lokasi kantor beserta koordinat Latitude & Longitude yang akurat.</li>
                                    <li>Klik "Lihat QR" pada tabel, lalu cetak QR Code tersebut dan tempel di dinding kantor.</li>
                                    <li>Karyawan hanya bisa absen jika scan QR tersebut DAN posisi GPS mereka berada dalam radius yang ditentukan.</li>
                                </ul>
                            </div>
                            <CrudTable 
                                endpoint="/umh/v1/hr/offices"
                                columns={officeColumns}
                                formFields={officeFields}
                                title="Lokasi Kantor"
                            />
                        </div>
                    )}
                </div>

                {/* MODAL SIMULASI SCAN QR */}
                {scanMode && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 text-center">
                            <h3 className="text-lg font-bold mb-4">Scan QR Code Kantor</h3>
                            <div className="bg-gray-100 p-4 rounded mb-4 border-2 border-dashed border-gray-300">
                                <QrCodeIcon className="h-20 w-20 mx-auto text-gray-400 mb-2"/>
                                <p className="text-xs text-gray-500">Kamera Scanner Aktif...</p>
                            </div>
                            
                            {/* Input Simulasi Scanner */}
                            <div className="mb-4">
                                <label className="block text-xs text-left font-bold text-gray-500 mb-1">Simulasi Hasil Scan (Isi Token QR):</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded text-sm"
                                    placeholder="Masukkan Token dari Data Kantor..."
                                    value={qrInput}
                                    onChange={(e) => setQrInput(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={() => handleAttendance('office_qr')}
                                disabled={isCheckingIn}
                                className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mb-2"
                            >
                                {isCheckingIn ? 'Memvalidasi...' : 'Verifikasi & Absen'}
                            </button>
                            <button 
                                onClick={() => setScanMode(false)}
                                className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default HR;
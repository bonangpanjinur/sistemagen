import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom';

const CreateBooking = () => {
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [departures, setDepartures] = useState([]);
    const [agents, setAgents] = useState([]); // State Agen
    const [selectedDeparture, setSelectedDeparture] = useState(null);

    const [formData, setFormData] = useState({
        departure_id: '',
        agent_id: '', // Field Agen
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        passengers: [
            { full_name: '', nik: '', gender: 'L', phone: '', room_type: 'quad', existing_id: '' }
        ]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const depRes = await api.get('/umh/v1/bookings/departures');
            if(depRes.data) setDepartures(depRes.data);

            // Fetch Agen Aktif
            const agnRes = await api.get('/umh/v1/bookings/agents-list');
            if(agnRes.data) setAgents(agnRes.data);
        } catch (err) {
            console.error("Gagal load data", err);
        }
    };

    const handleDepartureChange = (e) => {
        const depId = e.target.value;
        const dep = departures.find(d => d.id == depId);
        setSelectedDeparture(dep);
        setFormData({ ...formData, departure_id: depId });
    };

    const handleBasicChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePassengerChange = (index, field, value) => {
        const newPax = [...formData.passengers];
        newPax[index][field] = value;
        setFormData({ ...formData, passengers: newPax });
    };

    const addPassenger = () => {
        setFormData({
            ...formData,
            passengers: [...formData.passengers, { full_name: '', nik: '', gender: 'L', phone: '', room_type: 'quad' }]
        });
    };

    const removePassenger = (index) => {
        if (formData.passengers.length === 1) return;
        const newPax = formData.passengers.filter((_, i) => i !== index);
        setFormData({ ...formData, passengers: newPax });
    };

    const calculateTotal = () => {
        if (!selectedDeparture) return 0;
        let total = 0;
        formData.passengers.forEach(pax => {
            if (pax.room_type === 'quad') total += parseInt(selectedDeparture.price_quad);
            if (pax.room_type === 'triple') total += parseInt(selectedDeparture.price_triple);
            if (pax.room_type === 'double') total += parseInt(selectedDeparture.price_double);
        });
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/umh/v1/bookings/create', formData);
            if (res.data && res.data.success) {
                setSuccess(`Booking Berhasil! Kode: ${res.data.booking_code}`);
                // Clear form logic here if needed
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    return (
        <Layout title="Buat Booking Baru (Group)">
            <div className="max-w-6xl mx-auto">
                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* CARD 1: Pilih Jadwal & Agen */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">1. Jadwal & Referensi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Paket & Tanggal</label>
                                <select className="w-full border rounded p-2" onChange={handleDepartureChange} required>
                                    <option value="">-- Pilih Keberangkatan --</option>
                                    {departures.map(d => (
                                        <option key={d.id} value={d.id}>{d.departure_date} - {d.package_name} (Sisa: {d.available_seats})</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Input Agen Baru */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Agen / Mitra (Opsional)</label>
                                <select 
                                    name="agent_id"
                                    className="w-full border rounded p-2 bg-yellow-50" 
                                    onChange={handleBasicChange}
                                >
                                    <option value="">-- Tanpa Agen (Penjualan Pusat) --</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.display_name} ({a.agent_code})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Komisi akan dihitung otomatis sesuai level agen.</p>
                            </div>

                            {selectedDeparture && (
                                <div className="col-span-2 bg-blue-50 p-4 rounded text-sm grid grid-cols-3 gap-4">
                                    <p><strong>Quad:</strong> {formatCurrency(selectedDeparture.price_quad)}</p>
                                    <p><strong>Triple:</strong> {formatCurrency(selectedDeparture.price_triple)}</p>
                                    <p><strong>Double:</strong> {formatCurrency(selectedDeparture.price_double)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 2: Contact Person */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">2. Penanggung Jawab (Ketua Rombongan)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Nama Lengkap</label>
                                <input name="contact_name" onChange={handleBasicChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">No. WhatsApp</label>
                                <input name="contact_phone" onChange={handleBasicChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input name="contact_email" type="email" onChange={handleBasicChange} className="w-full border p-2 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: Passengers */}
                    <div className="bg-white p-6 rounded shadow">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold">3. Daftar Jemaah</h3>
                            <button type="button" onClick={addPassenger} className="bg-green-600 text-white px-3 py-1 rounded text-sm">+ Tambah Jemaah</button>
                        </div>

                        {formData.passengers.map((pax, index) => (
                            <div key={index} className="mb-4 p-4 border rounded bg-gray-50 relative">
                                <span className="absolute top-2 left-2 bg-gray-200 px-2 py-0.5 text-xs rounded font-bold">#{index + 1}</span>
                                {formData.passengers.length > 1 && (
                                    <button type="button" onClick={() => removePassenger(index)} className="absolute top-2 right-2 text-red-500 text-sm">Hapus</button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">NIK</label>
                                        <input 
                                            value={pax.nik} 
                                            onChange={(e) => handlePassengerChange(index, 'nik', e.target.value)} 
                                            className="w-full border p-2 rounded" 
                                            placeholder="NIK"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                                        <input 
                                            value={pax.full_name} 
                                            onChange={(e) => handlePassengerChange(index, 'full_name', e.target.value)} 
                                            className="w-full border p-2 rounded" 
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Gender</label>
                                        <select value={pax.gender} onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)} className="w-full border p-2 rounded">
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Tipe Kamar</label>
                                        <select value={pax.room_type} onChange={(e) => handlePassengerChange(index, 'room_type', e.target.value)} className="w-full border p-2 rounded">
                                            <option value="quad">Quad</option>
                                            <option value="triple">Triple</option>
                                            <option value="double">Double</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg md:pl-64 z-10">
                        <div className="max-w-6xl mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Total Estimasi ({formData.passengers.length} Pax):</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</p>
                            </div>
                            <button type="submit" disabled={loading || !selectedDeparture} className={`px-6 py-3 rounded font-bold text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {loading ? 'Memproses...' : 'Buat Booking Sekarang'}
                            </button>
                        </div>
                    </div>
                    <div className="h-24"></div> 
                </form>
            </div>
        </Layout>
    );
};

export default CreateBooking;
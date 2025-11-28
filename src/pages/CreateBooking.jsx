import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom'; // Pastikan react-router-dom terinstall

const CreateBooking = () => {
    // const navigate = useNavigate(); // Uncomment jika routing sudah setup
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Data Referensi
    const [departures, setDepartures] = useState([]);
    const [selectedDeparture, setSelectedDeparture] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        departure_id: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        passengers: [
            // Template Data Penumpang Pertama
            { full_name: '', nik: '', gender: 'L', phone: '', room_type: 'quad', existing_id: '' }
        ]
    });

    // 1. Load Data Jadwal saat pertama kali buka
    useEffect(() => {
        fetchDepartures();
    }, []);

    const fetchDepartures = async () => {
        try {
            const response = await api.get('/umh/v1/bookings/departures');
            if(response.data) setDepartures(response.data);
        } catch (err) {
            console.error("Gagal load jadwal", err);
        }
    };

    // Handler Ganti Jadwal
    const handleDepartureChange = (e) => {
        const depId = e.target.value;
        const dep = departures.find(d => d.id == depId);
        setSelectedDeparture(dep);
        setFormData({ ...formData, departure_id: depId });
    };

    // Handler Input Contact Person
    const handleContactChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler Input Penumpang (Dynamic Array)
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
        if (formData.passengers.length === 1) return; // Minimal 1
        const newPax = formData.passengers.filter((_, i) => i !== index);
        setFormData({ ...formData, passengers: newPax });
    };

    // Hitung Estimasi Total
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

    // Submit ke API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/umh/v1/bookings/create', formData);
            if (res.data && res.data.success) {
                setSuccess(`Booking Berhasil! Kode: ${res.data.booking_code}`);
                // Reset Form atau Redirect
                // setTimeout(() => navigate('/bookings'), 2000);
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
                    
                    {/* CARD 1: Pilih Jadwal */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">1. Pilih Jadwal Keberangkatan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Paket & Tanggal</label>
                                <select 
                                    className="w-full border rounded p-2"
                                    onChange={handleDepartureChange}
                                    required
                                >
                                    <option value="">-- Pilih Keberangkatan --</option>
                                    {departures.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.departure_date} - {d.package_name} (Sisa: {d.available_seats})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedDeparture && (
                                <div className="bg-blue-50 p-4 rounded text-sm">
                                    <p><strong>Harga Quad:</strong> {formatCurrency(selectedDeparture.price_quad)}</p>
                                    <p><strong>Harga Triple:</strong> {formatCurrency(selectedDeparture.price_triple)}</p>
                                    <p><strong>Harga Double:</strong> {formatCurrency(selectedDeparture.price_double)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 2: Data Penanggung Jawab */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">2. Data Penanggung Jawab (Ketua Rombongan)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Nama Lengkap</label>
                                <input name="contact_name" onChange={handleContactChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">No. WhatsApp</label>
                                <input name="contact_phone" onChange={handleContactChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input name="contact_email" type="email" onChange={handleContactChange} className="w-full border p-2 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: Data Jemaah (Looping) */}
                    <div className="bg-white p-6 rounded shadow">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold">3. Daftar Jemaah</h3>
                            <button type="button" onClick={addPassenger} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+ Tambah Jemaah</button>
                        </div>

                        {formData.passengers.map((pax, index) => (
                            <div key={index} className="mb-4 p-4 border rounded bg-gray-50 relative">
                                <span className="absolute top-2 left-2 bg-gray-200 px-2 py-0.5 text-xs rounded font-bold">#{index + 1}</span>
                                {formData.passengers.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removePassenger(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Hapus
                                    </button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">NIK (KTP)</label>
                                        <input 
                                            type="text" 
                                            value={pax.nik}
                                            onChange={(e) => handlePassengerChange(index, 'nik', e.target.value)}
                                            className="w-full border p-2 rounded"
                                            placeholder="16 digit NIK"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Nama Lengkap (Sesuai Paspor)</label>
                                        <input 
                                            type="text" 
                                            value={pax.full_name}
                                            onChange={(e) => handlePassengerChange(index, 'full_name', e.target.value)}
                                            className="w-full border p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Jenis Kelamin</label>
                                        <select 
                                            value={pax.gender}
                                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Tipe Kamar</label>
                                        <select 
                                            value={pax.room_type}
                                            onChange={(e) => handlePassengerChange(index, 'room_type', e.target.value)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="quad">Quad (Sekamar Ber-4)</option>
                                            <option value="triple">Triple (Sekamar Ber-3)</option>
                                            <option value="double">Double (Sekamar Ber-2)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Bar (Sticky Bottom) */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg md:pl-64 z-10">
                        <div className="max-w-6xl mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Total Estimasi ({formData.passengers.length} Pax):</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || !selectedDeparture}
                                className={`px-6 py-3 rounded font-bold text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Memproses...' : 'Buat Booking Sekarang'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Spacer agar konten tidak tertutup summary bar */}
                    <div className="h-24"></div> 
                </form>
            </div>
        </Layout>
    );
};

export default CreateBooking;
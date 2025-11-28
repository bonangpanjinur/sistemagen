import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { 
    BriefcaseIcon, PencilSquareIcon, TrashIcon, PlusIcon, 
    ArrowLeftIcon, CheckCircleIcon, XCircleIcon 
} from '@heroicons/react/24/outline';

const Packages = () => {
    // Mode: 'list', 'create', 'edit'
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState([]);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Form State
    const initialForm = {
        name: '', type: 'umrah', duration_days: 9, description: '',
        included_facilities: ['Tiket Pesawat PP', 'Visa Umrah', 'Hotel', 'Makan 3x Sehari', 'Transportasi Bus AC', 'Muthawif Profesional'],
        excluded_facilities: ['Pembuatan Paspor', 'Vaksin Meningitis', 'Pengeluaran Pribadi', 'Laundry'],
        itinerary: [],
        status: 'active'
    };
    const [formData, setFormData] = useState(initialForm);
    const [editId, setEditId] = useState(null);

    // Load Data
    useEffect(() => {
        if (viewMode === 'list') fetchPackages();
    }, [viewMode]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/umh/v1/packages');
            setPackages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleCreate = () => {
        setFormData(initialForm);
        // Generate Default Itinerary based on duration
        const defaultItin = Array.from({ length: 9 }, (_, i) => ({
            day_number: i + 1, title: `Hari ke-${i + 1}`, description: '', meal_plan: 'B/L/D'
        }));
        setFormData(prev => ({ ...prev, itinerary: defaultItin }));
        setEditId(null);
        setViewMode('create');
    };

    const handleEdit = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/umh/v1/packages/${id}`);
            setFormData(res.data);
            setEditId(id);
            setViewMode('edit');
        } catch (err) {
            setError("Gagal mengambil data paket");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin hapus paket ini? Jadwal keberangkatan terkait mungkin akan error.")) return;
        try {
            await api.delete(`/umh/v1/packages/${id}`);
            fetchPackages();
        } catch (err) {
            alert("Gagal menghapus");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (viewMode === 'create') {
                await api.post('/umh/v1/packages', formData);
                setSuccessMsg("Paket berhasil dibuat!");
            } else {
                await api.put(`/umh/v1/packages/${editId}`, formData);
                setSuccessMsg("Paket berhasil diupdate!");
            }
            setTimeout(() => {
                setSuccessMsg(null);
                setViewMode('list');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    // --- FORM HELPERS ---

    const handleBasicChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Dynamic List Handler (Facilities)
    const handleListChange = (type, index, value) => {
        const newList = [...formData[type]];
        newList[index] = value;
        setFormData({ ...formData, [type]: newList });
    };
    const addListItem = (type) => setFormData({ ...formData, [type]: [...formData[type], ''] });
    const removeListItem = (type, index) => {
        const newList = formData[type].filter((_, i) => i !== index);
        setFormData({ ...formData, [type]: newList });
    };

    // Itinerary Handler
    const handleItinChange = (index, field, value) => {
        const newItin = [...formData.itinerary];
        newItin[index][field] = value;
        setFormData({ ...formData, itinerary: newItin });
    };
    
    const regenerateItinerary = () => {
        if(!window.confirm("Reset Itinerary sesuai durasi hari? Data lama akan hilang.")) return;
        const newItin = Array.from({ length: formData.duration_days }, (_, i) => ({
            day_number: i + 1, title: `Hari ke-${i + 1}`, description: '', meal_plan: 'B/L/D'
        }));
        setFormData({ ...formData, itinerary: newItin });
    };

    // --- RENDERERS ---

    if (viewMode === 'list') {
        return (
            <Layout title="Katalog Paket Travel">
                <div className="bg-white rounded shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-gray-600">
                            <BriefcaseIcon className="h-6 w-6" />
                            <span>Kelola template produk paket Anda di sini.</span>
                        </div>
                        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                            <PlusIcon className="h-5 w-5" /> Buat Paket Baru
                        </button>
                    </div>

                    {loading ? <Spinner /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-sm text-gray-600">
                                        <th className="p-3 border-b">Nama Paket</th>
                                        <th className="p-3 border-b">Tipe</th>
                                        <th className="p-3 border-b">Durasi</th>
                                        <th className="p-3 border-b">Status</th>
                                        <th className="p-3 border-b text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {packages.length === 0 ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">Belum ada paket.</td></tr>
                                    ) : (
                                        packages.map(pkg => (
                                            <tr key={pkg.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{pkg.name}</td>
                                                <td className="p-3 uppercase text-xs font-bold text-gray-500">{pkg.type}</td>
                                                <td className="p-3">{pkg.duration_days} Hari</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>
                                                        {pkg.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 flex justify-center gap-2">
                                                    <button onClick={() => handleEdit(pkg.id)} className="text-blue-600 hover:text-blue-800"><PencilSquareIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleDelete(pkg.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5"/></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }

    // FORM VIEW (Create / Edit)
    return (
        <Layout title={viewMode === 'create' ? "Buat Paket Baru" : "Edit Paket"}>
            <div className="max-w-5xl mx-auto bg-white rounded shadow-lg p-6">
                <button onClick={() => setViewMode('list')} className="mb-4 text-gray-500 flex items-center gap-1 hover:text-gray-800">
                    <ArrowLeftIcon className="h-4 w-4" /> Kembali ke Daftar
                </button>

                {error && <Alert type="error" message={error} />}
                {successMsg && <Alert type="success" message={successMsg} />}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: INFO DASAR */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">1. Informasi Dasar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Nama Paket</label>
                                <input name="name" value={formData.name} onChange={handleBasicChange} className="w-full border p-2 rounded" placeholder="Contoh: Umrah Reguler 9 Hari Hemat" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipe Paket</label>
                                <select name="type" value={formData.type} onChange={handleBasicChange} className="w-full border p-2 rounded">
                                    <option value="umrah">Umrah</option>
                                    <option value="haji">Haji</option>
                                    <option value="tour">Wisata Halal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Durasi (Hari)</label>
                                <div className="flex gap-2">
                                    <input type="number" name="duration_days" value={formData.duration_days} onChange={handleBasicChange} className="w-full border p-2 rounded" min="1" />
                                    <button type="button" onClick={regenerateItinerary} className="bg-yellow-100 text-yellow-800 px-3 text-xs rounded whitespace-nowrap hover:bg-yellow-200">
                                        Reset Itinerary
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
                                <textarea name="description" value={formData.description} onChange={handleBasicChange} className="w-full border p-2 rounded h-20"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: FASILITAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-6">
                        <div>
                            <h3 className="text-md font-bold mb-2 flex items-center gap-2 text-green-700">
                                <CheckCircleIcon className="h-5 w-5"/> Termasuk (Included)
                            </h3>
                            {formData.included_facilities.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input value={item} onChange={(e) => handleListChange('included_facilities', idx, e.target.value)} className="w-full border p-2 rounded text-sm" />
                                    <button type="button" onClick={() => removeListItem('included_facilities', idx)} className="text-red-500">x</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem('included_facilities')} className="text-sm text-blue-600 hover:underline">+ Tambah Item</button>
                        </div>
                        <div>
                            <h3 className="text-md font-bold mb-2 flex items-center gap-2 text-red-700">
                                <XCircleIcon className="h-5 w-5"/> Tidak Termasuk (Excluded)
                            </h3>
                            {formData.excluded_facilities.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input value={item} onChange={(e) => handleListChange('excluded_facilities', idx, e.target.value)} className="w-full border p-2 rounded text-sm" />
                                    <button type="button" onClick={() => removeListItem('excluded_facilities', idx)} className="text-red-500">x</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem('excluded_facilities')} className="text-sm text-blue-600 hover:underline">+ Tambah Item</button>
                        </div>
                    </div>

                    {/* SECTION 3: ITINERARY BUILDER */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">3. Rencana Perjalanan (Itinerary)</h3>
                        <div className="space-y-4">
                            {formData.itinerary.map((day, idx) => (
                                <div key={idx} className="bg-gray-50 border p-4 rounded flex gap-4 items-start">
                                    <div className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg flex-shrink-0">
                                        {day.day_number}
                                    </div>
                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500">Judul Kegiatan</label>
                                            <input 
                                                value={day.title} 
                                                onChange={(e) => handleItinChange(idx, 'title', e.target.value)} 
                                                className="w-full border p-2 rounded"
                                                placeholder="Contoh: Tiba di Jeddah"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500">Meal Plan (Makan)</label>
                                            <input 
                                                value={day.meal_plan} 
                                                onChange={(e) => handleItinChange(idx, 'meal_plan', e.target.value)} 
                                                className="w-full border p-2 rounded"
                                                placeholder="B/L/D"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-gray-500">Deskripsi Detail</label>
                                            <textarea 
                                                value={day.description} 
                                                onChange={(e) => handleItinChange(idx, 'description', e.target.value)} 
                                                className="w-full border p-2 rounded h-20 text-sm"
                                                placeholder="Jelaskan aktivitas jamaah hari ini..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER ACTION */}
                    <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
                        <button type="button" onClick={() => setViewMode('list')} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Batal</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
                            {loading ? 'Menyimpan...' : 'Simpan Paket'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Packages;
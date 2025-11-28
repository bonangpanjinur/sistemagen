import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { 
    UsersIcon, PencilSquareIcon, TrashIcon, PlusIcon, 
    ArrowLeftIcon, MagnifyingGlassIcon, UserCircleIcon, 
    IdentificationIcon, MapPinIcon, HeartIcon
} from '@heroicons/react/24/outline';

const Jamaah = () => {
    const [viewMode, setViewMode] = useState('list'); // list | form
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [msg, setMsg] = useState(null);

    // List State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Form State
    const initialForm = {
        full_name: '', full_name_ar: '', nik: '', passport_number: '', gender: 'L',
        birth_place: '', birth_date: '', phone: '', email: '',
        address: '', city: '', job_title: '', father_name: '',
        disease_history: '', clothing_size: 'L'
    };
    const [formData, setFormData] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [history, setHistory] = useState([]); // Untuk mode edit

    // --- FETCH DATA ---
    useEffect(() => {
        if (viewMode === 'list') fetchJamaah();
    }, [viewMode, page, search]);

    const fetchJamaah = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/umh/v1/jamaah?page=${page}&search=${search}`);
            setData(res.data);
            setTotalPages(res.total_pages);
            setTotalItems(res.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset ke halaman 1
        fetchJamaah();
    };

    const handleCreate = () => {
        setFormData(initialForm);
        setEditId(null);
        setHistory([]);
        setViewMode('form');
    };

    const handleEdit = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/umh/v1/jamaah/${id}`);
            setFormData(res.data); // Data utama
            setHistory(res.data.history || []); // History booking
            setEditId(id);
            setViewMode('form');
        } catch (err) {
            setMsg({ type: 'error', text: 'Gagal mengambil data' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin hapus data jemaah ini?")) return;
        try {
            await api.delete(`/umh/v1/jamaah/${id}`);
            fetchJamaah();
        } catch (err) {
            alert("Gagal menghapus");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editId) {
                await api.put(`/umh/v1/jamaah/${editId}`, formData);
                setMsg({ type: 'success', text: 'Data Jemaah berhasil diupdate!' });
            } else {
                await api.post('/umh/v1/jamaah', formData);
                setMsg({ type: 'success', text: 'Jemaah baru berhasil ditambahkan!' });
            }
            setTimeout(() => {
                setMsg(null);
                setViewMode('list');
            }, 1500);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- RENDERERS ---

    if (viewMode === 'list') {
        return (
            <Layout title="Database Jemaah (CRM)">
                <div className="bg-white rounded shadow p-6">
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <form onSubmit={handleSearch} className="relative w-full md:w-1/2">
                            <input 
                                type="text" 
                                placeholder="Cari Nama / NIK / Paspor..." 
                                className="w-full border p-2 pl-10 rounded"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        </form>
                        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                            <PlusIcon className="h-5 w-5" /> Jemaah Baru
                        </button>
                    </div>

                    {msg && <Alert type={msg.type} message={msg.text} />}

                    {loading ? <Spinner /> : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 border-b text-left text-gray-600">
                                            <th className="p-3">Nama Lengkap</th>
                                            <th className="p-3">Identitas (NIK/Paspor)</th>
                                            <th className="p-3">Kontak & Kota</th>
                                            <th className="p-3 text-center">L/P</th>
                                            <th className="p-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">Data tidak ditemukan.</td></tr>
                                        ) : (
                                            data.map(item => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-blue-700">{item.full_name}</td>
                                                    <td className="p-3">
                                                        <div className="text-xs text-gray-500">NIK: {item.nik || '-'}</div>
                                                        <div className="text-xs text-gray-500">Paspor: {item.passport_number || '-'}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div>{item.phone}</div>
                                                        <div className="text-xs text-gray-500">{item.city}</div>
                                                    </td>
                                                    <td className="p-3 text-center font-bold">
                                                        <span className={`px-2 py-1 rounded text-xs ${item.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                                            {item.gender}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(item.id)} className="text-blue-600 hover:text-blue-800" title="Edit Detail">
                                                            <PencilSquareIcon className="h-5 w-5"/>
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                                                            <TrashIcon className="h-5 w-5"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                                <div className="text-xs text-center text-gray-500 mt-2">Total Data: {totalItems} Jemaah</div>
                            </div>
                        </>
                    )}
                </div>
            </Layout>
        );
    }

    // FORM VIEW
    return (
        <Layout title={editId ? "Edit Data Jemaah" : "Input Jemaah Baru"}>
            <div className="max-w-5xl mx-auto">
                <button onClick={() => setViewMode('list')} className="mb-4 text-gray-500 flex items-center gap-1 hover:text-gray-800">
                    <ArrowLeftIcon className="h-4 w-4" /> Kembali ke Daftar
                </button>

                {msg && <Alert type={msg.type} message={msg.text} />}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* KOLOM KIRI: Form Input */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* Card 1: Data Diri */}
                        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <UserCircleIcon className="h-6 w-6 text-blue-500"/> Identitas Pribadi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Lengkap (Sesuai KTP/Paspor)</label>
                                    <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full border p-2 rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Ayah Kandung</label>
                                    <input name="father_name" value={formData.father_name} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nomor Induk Kependudukan (NIK)</label>
                                    <input name="nik" value={formData.nik} onChange={handleChange} className="w-full border p-2 rounded" placeholder="16 Digit" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                                    <input name="birth_place" value={formData.birth_place} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pekerjaan</label>
                                    <input name="job_title" value={formData.job_title} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Kontak & Alamat */}
                        <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <MapPinIcon className="h-6 w-6 text-green-500"/> Kontak & Domisili
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">No. Handphone (WA)</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email (Opsional)</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded h-20"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kota / Kabupaten</label>
                                    <input name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Dokumen Perjalanan */}
                        <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <IdentificationIcon className="h-6 w-6 text-purple-500"/> Dokumen Imigrasi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nomor Paspor</label>
                                    <input name="passport_number" value={formData.passport_number} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama di Paspor (3 Kata)</label>
                                    <input name="full_name_ar" value={formData.full_name_ar} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Opsional (Untuk Visa)" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* KOLOM KANAN: Sidebar Info */}
                    <div className="space-y-6">
                        
                        {/* Card 4: Kesehatan & Lainnya */}
                        <div className="bg-white p-6 rounded shadow border-t-4 border-red-500">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <HeartIcon className="h-6 w-6 text-red-500"/> Kesehatan & Logistik
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Riwayat Penyakit</label>
                                    <textarea name="disease_history" value={formData.disease_history} onChange={handleChange} className="w-full border p-2 rounded h-20" placeholder="Diabetes, Jantung, Asma..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ukuran Pakaian (Batik/Jaket)</label>
                                    <select name="clothing_size" value={formData.clothing_size} onChange={handleChange} className="w-full border p-2 rounded">
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Card 5: History Perjalanan (Hanya Mode Edit) */}
                        {editId && (
                            <div className="bg-white p-6 rounded shadow">
                                <h3 className="font-bold text-lg mb-4 text-gray-700">Riwayat Perjalanan</h3>
                                {history.length === 0 ? (
                                    <p className="text-sm text-gray-500">Belum ada riwayat booking.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {history.map((h, idx) => (
                                            <li key={idx} className="text-sm border-b pb-2">
                                                <div className="font-bold text-blue-600">{h.package_name}</div>
                                                <div className="text-gray-500">{h.departure_date}</div>
                                                <div className={`text-xs mt-1 uppercase inline-block px-2 py-0.5 rounded ${h.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {h.status}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        <div className="sticky top-4">
                            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 mb-2">
                                {loading ? 'Menyimpan...' : 'Simpan Data Jemaah'}
                            </button>
                            <button type="button" onClick={() => setViewMode('list')} className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                                Batal
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Jamaah;
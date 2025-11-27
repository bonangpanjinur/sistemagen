import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Import API helper langsung
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Plus, Trash2, CheckSquare, Hotel, Plane } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    const { data, loading, fetchData, createItem } = useCRUD('umh/v1/packages');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    
    // State untuk menyimpan Data Master yang diambil dari API
    const [masters, setMasters] = useState({
        hotels: [],
        airlines: [],
        promos: [],
        facilities: []
    });

    // Load Master Data saat komponen dimuat
    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [h, a, p, f] = await Promise.all([
                    api.get('umh/v1/masters?type=hotel'),
                    api.get('umh/v1/masters?type=airline'),
                    api.get('umh/v1/masters?type=promo'),
                    api.get('umh/v1/masters?type=facility')
                ]);
                setMasters({
                    hotels: h.data || [],
                    airlines: a.data || [],
                    promos: p.data || [],
                    facilities: f.data || []
                });
            } catch (error) {
                console.error("Gagal memuat master data", error);
            }
        };
        loadMasters();
        fetchData();
    }, [fetchData]);

    const initialForm = {
        package_name: '', duration: 9, departure_city: 'Jakarta',
        category_id: '', sub_category: '',
        dates: [{ date: '', quota: 45 }],
        prices: [ { room_type: 'Quad', price: 0 }, { room_type: 'Triple', price: 0 }, { room_type: 'Double', price: 0 } ],
        airlines: [], hotels: [], facilities: [], promo_types: [],
        itinerary_mode: 'manual', itinerary_data: [{ day: 1, activity: '' }]
    };
    const [formData, setFormData] = useState(initialForm);

    // ... (Helpers addDate, removeDate, updateDate, updatePrice SAMA SEPERTI SEBELUMNYA) ...
    const addDate = () => setFormData({ ...formData, dates: [...formData.dates, { date: '', quota: 45 }] });
    const removeDate = (idx) => setFormData({ ...formData, dates: formData.dates.filter((_, i) => i !== idx) });
    const updateDate = (idx, field, val) => { const d = [...formData.dates]; d[idx][field] = val; setFormData({ ...formData, dates: d }); };
    const updatePrice = (idx, val) => { const p = [...formData.prices]; p[idx].price = val; setFormData({ ...formData, prices: p }); };

    const toggleCheckbox = (field, value) => {
        const list = formData[field] || [];
        if (list.includes(value)) setFormData({ ...formData, [field]: list.filter(i => i !== value) });
        else setFormData({ ...formData, [field]: [...list, value] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (await createItem(formData)) { setIsModalOpen(false); setFormData(initialForm); }
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'package_name', className: 'font-bold' },
        { header: 'Kota Asal', accessor: 'departure_city' },
        { header: 'Durasi', accessor: 'duration', render: r => `${r.duration} Hari` },
        { header: 'Harga Mulai', accessor: 'start_from', render: r => formatCurrency(r.start_from) }
    ];

    return (
        <Layout title="Master Paket Umroh">
            <div className="flex justify-between mb-4 items-center">
                <div className="text-gray-600 text-sm">
                    Pastikan Anda sudah mengisi <strong>Data Master</strong> (Hotel/Maskapai) sebelum membuat paket.
                </div>
                <button onClick={() => { setFormData(initialForm); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex gap-2">
                    <Plus size={18}/> Buat Paket
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Paket Baru" size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex border-b space-x-2 overflow-x-auto">
                        {['basic', 'dates', 'facilities', 'itinerary'].map(t => (
                            <button key={t} type="button" onClick={() => setActiveTab(t)} className={`px-4 py-2 capitalize border-b-2 whitespace-nowrap ${activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>{t}</button>
                        ))}
                    </div>

                    {/* TAB BASIC (Sama) */}
                    {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nama Paket</label><input className="w-full border p-2 rounded" value={formData.package_name} onChange={e => setFormData({...formData, package_name: e.target.value})} required /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Durasi (Hari)</label><input type="number" className="w-full border p-2 rounded" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Kota Keberangkatan</label><input className="w-full border p-2 rounded" value={formData.departure_city} onChange={e => setFormData({...formData, departure_city: e.target.value})} placeholder="Jakarta" /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Kategori</label><select className="w-full border p-2 rounded" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}><option value="">Pilih</option><option value="1">Reguler</option><option value="2">Plus</option><option value="3">Haji</option></select></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Sub Kategori</label><input className="w-full border p-2 rounded" value={formData.sub_category} onChange={e => setFormData({...formData, sub_category: e.target.value})} placeholder="Bintang 5" /></div>
                        </div>
                    )}

                    {/* TAB DATES (Sama) */}
                    {activeTab === 'dates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-3 rounded border">
                                <div className="flex justify-between mb-2"><label className="font-bold">Jadwal</label><button type="button" onClick={addDate} className="text-blue-600 text-xs">+ Tambah</button></div>
                                {formData.dates.map((d, i) => (
                                    <div key={i} className="flex gap-2 mb-2"><input type="date" className="border p-1 rounded w-full" value={d.date} onChange={e => updateDate(i, 'date', e.target.value)} /><input type="number" className="border p-1 rounded w-20" value={d.quota} onChange={e => updateDate(i, 'quota', e.target.value)} placeholder="Quota" /></div>
                                ))}
                            </div>
                            <div className="bg-green-50 p-3 rounded border">
                                <label className="font-bold mb-2 block">Harga</label>
                                {formData.prices.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center mb-2"><span className="w-20 font-semibold text-sm">{p.room_type}</span><input type="number" className="border p-2 rounded w-full" value={p.price} onChange={e => updatePrice(i, e.target.value)} placeholder="Rp" /></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB FACILITIES (DINAMIS DARI MASTER DATA) */}
                    {activeTab === 'facilities' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Maskapai Dinamis */}
                            <div>
                                <label className="font-bold mb-2 block flex items-center gap-2"><Plane size={16}/> Maskapai</label>
                                <div className="h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                                    {masters.airlines.length > 0 ? masters.airlines.map(a => (
                                        <label key={a.id} className="flex gap-2 items-center p-1 hover:bg-white rounded cursor-pointer">
                                            <input type="checkbox" checked={formData.airlines.includes(a.name)} onChange={() => toggleCheckbox('airlines', a.name)} /> 
                                            <span>{a.name}</span>
                                        </label>
                                    )) : <p className="text-xs text-gray-400 italic">Belum ada data maskapai.</p>}
                                </div>
                            </div>

                            {/* Hotel Dinamis */}
                            <div>
                                <label className="font-bold mb-2 block flex items-center gap-2"><Hotel size={16}/> Hotel</label>
                                <div className="h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                                    {masters.hotels.length > 0 ? masters.hotels.map(h => (
                                        <label key={h.id} className="flex gap-2 items-center p-1 hover:bg-white rounded cursor-pointer">
                                            <input type="checkbox" checked={formData.hotels.includes(h.name)} onChange={() => toggleCheckbox('hotels', h.name)} /> 
                                            <span>{h.name} <small className="text-gray-500">({h.description})</small></span>
                                        </label>
                                    )) : <p className="text-xs text-gray-400 italic">Belum ada data hotel.</p>}
                                </div>
                            </div>

                            {/* Promo Dinamis */}
                            <div className="md:col-span-2">
                                <label className="font-bold mb-2 block flex items-center gap-2"><Tag size={16}/> Promo Tersedia</label>
                                <div className="flex flex-wrap gap-2">
                                    {masters.promos.map(p => (
                                        <label key={p.id} className={`px-3 py-1 border rounded-full text-xs cursor-pointer transition ${formData.promo_types.includes(p.name) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>
                                            <input type="checkbox" className="hidden" checked={formData.promo_types.includes(p.name)} onChange={() => toggleCheckbox('promo_types', p.name)} /> 
                                            {p.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB ITINERARY (Sama) */}
                    {activeTab === 'itinerary' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Isi kegiatan per hari.</p>
                            {formData.itinerary_data.map((d, i) => (
                                <div key={i} className="flex gap-2 mb-2"><span className="w-16 pt-2 font-bold text-gray-500">Hari {d.day}</span><textarea className="w-full border p-2 rounded" rows="1" value={d.activity} onChange={e => {const n = [...formData.itinerary_data]; n[i].activity = e.target.value; setFormData({...formData, itinerary_data: n})}}></textarea></div>
                            ))}
                            <button type="button" onClick={() => setFormData({...formData, itinerary_data: [...formData.itinerary_data, {day: formData.itinerary_data.length+1, activity: ''}]})} className="text-blue-600 text-sm">+ Tambah Hari</button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;
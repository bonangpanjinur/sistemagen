import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, MapPin, Upload, FileText, List, Plane, Trash2, Tag, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    
    // Master Data
    const { data: hotels } = useCRUD('umh/v1/hotels');
    const { data: airlines } = useCRUD('umh/v1/flights');
    const { data: categories } = useCRUD('umh/v1/package-categories');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); 

    const [formData, setFormData] = useState({});
    const [itineraryMode, setItineraryMode] = useState('manual'); 

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        // Parse prices jika string JSON dari DB, atau gunakan default
        let prices = { quad: 0, triple: 0, double: 0 };
        if (item && item.prices) {
            prices = typeof item.prices === 'string' ? JSON.parse(item.prices) : item.prices;
        }

        setFormData(item ? { ...item, prices } : { 
            status: 'active', 
            itinerary_type: 'manual',
            itinerary_items: [],
            facilities: '',
            service_type: 'umroh', 
            category_id: '',
            accommodations: [],
            prices: prices
        });
        setItineraryMode(item?.itinerary_type || 'manual');
        setActiveTab('details'); 
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { 
            ...formData, 
            itinerary_type: itineraryMode,
            // Simpan harga quad sebagai harga dasar (untuk display tabel)
            price: formData.prices?.quad || 0
        };
        const success = modalMode === 'create' 
            ? await createItem(payload) 
            : await updateItem(currentItem.id, payload);
        if (success) setIsModalOpen(false);
    };

    // --- HARGA DINAMIS ---
    const handlePriceChange = (type, value) => {
        setFormData(prev => ({
            ...prev,
            prices: { ...prev.prices, [type]: parseInt(value) || 0 }
        }));
    };

    // --- AKOMODASI ---
    const addAccommodation = () => {
        setFormData(prev => ({
            ...prev,
            accommodations: [...(prev.accommodations || []), { hotel_id: '', city: 'Makkah' }]
        }));
    };

    const removeAccommodation = (index) => {
        const newAcc = [...(formData.accommodations || [])];
        newAcc.splice(index, 1);
        setFormData({ ...formData, accommodations: newAcc });
    };

    const updateAccommodation = (index, field, value) => {
        const newAcc = [...(formData.accommodations || [])];
        newAcc[index][field] = value;
        setFormData({ ...formData, accommodations: newAcc });
    };

    // --- ITINERARY ---
    const handleItineraryAdd = () => {
        const items = formData.itinerary_items || [];
        setFormData({
            ...formData,
            itinerary_items: [...items, { day: items.length + 1, title: '', description: '' }]
        });
    };

    const handleItineraryChange = (index, field, value) => {
        const items = [...(formData.itinerary_items || [])];
        items[index][field] = value;
        setFormData({ ...formData, itinerary_items: items });
    };

    // Columns
    const columns = [
        { header: 'Nama Paket', accessor: 'name', sortable: true },
        { header: 'Jenis', accessor: 'service_type', render: row => <span className="uppercase text-xs font-bold text-gray-600">{row.service_type}</span>},
        { header: 'Kategori', accessor: 'category_id', render: row => {
            const cat = categories?.find(c => c.id == row.category_id);
            return <span className="badge bg-purple-100 text-purple-800">{cat ? cat.name : '-'}</span>;
        }},
        { header: 'Durasi', accessor: 'duration', render: row => `${row.duration || 9} Hari` },
        { header: 'Harga (Mulai)', accessor: 'price', render: row => formatCurrency(row.price) },
        { header: 'Status', accessor: 'status', render: row => <span className={`badge ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{row.status}</span>}
    ];

    return (
        <Layout title="Manajemen Paket Umroh & Haji">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Buat Paket Baru
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
                userCapabilities={user?.role}
                editCapability="manage_options"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Buat Paket Baru' : 'Edit Paket'}>
                <form onSubmit={handleSubmit} className="h-[75vh] flex flex-col">
                    
                    <div className="flex border-b border-gray-200 mb-4 bg-gray-50 rounded-t-lg">
                        <button type="button" onClick={() => setActiveTab('details')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'details' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Detail & Harga</button>
                        <button type="button" onClick={() => setActiveTab('accommodation')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'accommodation' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Akomodasi</button>
                        <button type="button" onClick={() => setActiveTab('itinerary')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'itinerary' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Fasilitas & Jadwal</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 p-1">
                        
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Jenis Ibadah</label>
                                        <select className="input-field" value={formData.service_type || 'umroh'} onChange={e => setFormData({...formData, service_type: e.target.value})}>
                                            <option value="umroh">Umroh</option>
                                            <option value="haji">Haji</option>
                                            <option value="tour">Wisata Halal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Kategori Paket</label>
                                        <select className="input-field" value={formData.category_id || ''} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories && categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Nama Paket</label>
                                    <input className="input-field" placeholder="Contoh: Umroh Syawal 1446H - Bintang 5" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Durasi (Hari)</label>
                                        <input type="number" className="input-field" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Status</label>
                                        <select className="input-field" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="active">Aktif (Open)</option>
                                            <option value="full">Penuh (Sold Out)</option>
                                            <option value="archived">Arsip (Selesai)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* VARIAN HARGA */}
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-2">
                                    <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><DollarSign size={16}/> Varian Harga Per Kamar</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-700 block mb-1">Quad (Sekamar 4)</label>
                                            <input type="number" className="input-field text-sm" placeholder="Rp..." 
                                                value={formData.prices?.quad || ''} onChange={e => handlePriceChange('quad', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-700 block mb-1">Triple (Sekamar 3)</label>
                                            <input type="number" className="input-field text-sm" placeholder="Rp..." 
                                                value={formData.prices?.triple || ''} onChange={e => handlePriceChange('triple', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-700 block mb-1">Double (Sekamar 2)</label>
                                            <input type="number" className="input-field text-sm" placeholder="Rp..." 
                                                value={formData.prices?.double || ''} onChange={e => handlePriceChange('double', e.target.value)} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-green-600 mt-2">*Harga Quad wajib diisi sebagai harga dasar.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'accommodation' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Maskapai Penerbangan</label>
                                    <select className="input-field" value={formData.airline_id || ''} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                                        <option value="">-- Pilih Maskapai --</option>
                                        {airlines && airlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                    </select>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="label font-bold">Daftar Hotel</label>
                                        <button type="button" onClick={addAccommodation} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">+ Tambah Hotel</button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {(formData.accommodations || []).map((acc, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                                                <select className="border rounded p-2 text-sm w-1/3" value={acc.city} onChange={e => updateAccommodation(idx, 'city', e.target.value)}>
                                                    <option value="Makkah">Makkah</option>
                                                    <option value="Madinah">Madinah</option>
                                                    <option value="Jeddah">Jeddah</option>
                                                    <option value="Transit">Transit</option>
                                                </select>
                                                <select className="border rounded p-2 text-sm flex-1" value={acc.hotel_id} onChange={e => updateAccommodation(idx, 'hotel_id', e.target.value)}>
                                                    <option value="">-- Pilih Hotel --</option>
                                                    {hotels && hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                                                </select>
                                                <button type="button" onClick={() => removeAccommodation(idx)} className="text-red-500 hover:bg-red-100 p-2 rounded"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        {(formData.accommodations?.length === 0) && <p className="text-sm text-gray-400 italic text-center py-4 border border-dashed rounded bg-gray-50">Belum ada hotel yang dipilih.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'itinerary' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="label">Fasilitas Termasuk (Include)</label>
                                    <textarea className="input-field h-24" placeholder="Tiket, Visa, Makan..." value={formData.facilities || ''} onChange={e => setFormData({...formData, facilities: e.target.value})}></textarea>
                                </div>
                                
                                <div>
                                    <label className="label">Tidak Termasuk (Exclude)</label>
                                    <textarea className="input-field h-20" placeholder="Paspor, Vaksin..." value={formData.excludes || ''} onChange={e => setFormData({...formData, excludes: e.target.value})}></textarea>
                                </div>

                                <div className="border-t pt-4">
                                    <label className="label font-bold mb-3">Itinerary Perjalanan</label>
                                    <div className="flex gap-4 mb-4 bg-gray-100 p-2 rounded-lg">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="radio" name="itinerary_mode" value="manual" checked={itineraryMode === 'manual'} onChange={() => setItineraryMode('manual')} /> Input Manual</label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="radio" name="itinerary_mode" value="upload" checked={itineraryMode === 'upload'} onChange={() => setItineraryMode('upload')} /> Upload File</label>
                                    </div>

                                    {itineraryMode === 'manual' ? (
                                        <div className="space-y-3">
                                            {(formData.itinerary_items || []).map((day, idx) => (
                                                <div key={idx} className="border p-3 rounded bg-white shadow-sm flex gap-3 items-start">
                                                    <div className="bg-blue-100 text-blue-800 font-bold p-2 rounded w-16 text-center text-xs pt-3">Hari {day.day}</div>
                                                    <div className="flex-1 space-y-2">
                                                        <input type="text" className="w-full border rounded p-1 text-sm font-bold" placeholder="Kegiatan" value={day.title} onChange={e => handleItineraryChange(idx, 'title', e.target.value)} />
                                                        <textarea className="w-full border rounded p-1 text-sm h-16" placeholder="Deskripsi..." value={day.description} onChange={e => handleItineraryChange(idx, 'description', e.target.value)} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={handleItineraryAdd} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 font-bold text-sm">+ Tambah Hari</button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                                            <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Upload file Itinerary (PDF/Gambar)</p>
                                            <input type="file" className="mt-2 text-sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-2 border-t flex justify-end gap-2 bg-white pb-1">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;
import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, MapPin, Upload, FileText, List, Plane, Trash2, Tag, Layers } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    
    // --- FETCH DATA MASTER ---
    const { data: hotels } = useCRUD('umh/v1/hotels');
    const { data: airlines } = useCRUD('umh/v1/flights');
    // FETCH KATEGORI DINAMIS (Sub-Kategori)
    const { data: categories } = useCRUD('umh/v1/package-categories');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); 

    // Form State
    const [formData, setFormData] = useState({});
    const [itineraryMode, setItineraryMode] = useState('manual'); 

    // Helpers
    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { 
            status: 'active', 
            itinerary_type: 'manual',
            itinerary_items: [],
            facilities: '',
            service_type: 'umroh', // Default Kategori Utama
            category_id: '',       // Default Sub-Kategori Dinamis
            accommodations: [] 
        });
        setItineraryMode(item?.itinerary_type || 'manual');
        setActiveTab('details'); 
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, itinerary_type: itineraryMode };
        const success = modalMode === 'create' 
            ? await createItem(payload) 
            : await updateItem(currentItem.id, payload);
        if (success) setIsModalOpen(false);
    };

    // --- LOGIC MULTI HOTEL ---
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

    // --- LOGIC ITINERARY ---
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
        // KATEGORI UTAMA (Hardcoded Types)
        { header: 'Jenis', accessor: 'service_type', render: row => {
            const types = { 'umroh': 'Umroh', 'haji': 'Haji', 'tour': 'Wisata Halal' };
            return <span className="text-xs font-bold text-gray-600">{types[row.service_type] || row.service_type?.toUpperCase()}</span>;
        }},
        // SUB-KATEGORI (Dinamis dari Database)
        { header: 'Kategori', accessor: 'category_id', render: row => {
            // Lookup nama kategori berdasarkan ID
            const cat = categories?.find(c => c.id == row.category_id);
            return (
                <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    <Tag size={10} /> {cat ? cat.name : '-'}
                </span>
            );
        }},
        { header: 'Durasi', accessor: 'duration', render: row => `${row.duration || 9} Hari` },
        { header: 'Maskapai', accessor: 'airline_name', render: row => (
            <span className="flex items-center gap-1 text-xs text-blue-600"><Plane size={10}/> {row.airline_name || '-'}</span>
        )},
        { header: 'Harga Mulai', accessor: 'price', render: row => formatCurrency(row.price) },
        { header: 'Status', accessor: 'status', render: row => (
            <span className={`px-2 py-1 rounded text-xs ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
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

            {/* MODAL BESAR */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Buat Paket Baru' : 'Edit Paket'}>
                <form onSubmit={handleSubmit} className="h-[70vh] flex flex-col">
                    
                    {/* TABS NAVIGATION */}
                    <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                        <button type="button" onClick={() => setActiveTab('details')} 
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Detail & Akomodasi
                        </button>
                        <button type="button" onClick={() => setActiveTab('facilities')} 
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'facilities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Fasilitas
                        </button>
                        <button type="button" onClick={() => setActiveTab('itinerary')} 
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'itinerary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Itinerary
                        </button>
                    </div>

                    {/* SCROLLABLE CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        
                        {/* TAB 1: DETAILS & ACCOMMODATION */}
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                {/* SECTION KATEGORI */}
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Ibadah (Utama)</label>
                                        <select className="w-full border rounded p-2 text-sm" 
                                            value={formData.service_type || 'umroh'} 
                                            onChange={e => setFormData({...formData, service_type: e.target.value})}
                                        >
                                            <option value="umroh">Umroh</option>
                                            <option value="haji">Haji</option>
                                            <option value="tour">Wisata Halal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Kategori / Sub-Jenis (Dinamis)</label>
                                        <select className="w-full border rounded p-2 text-sm" 
                                            value={formData.category_id || ''} 
                                            onChange={e => setFormData({...formData, category_id: e.target.value})}
                                            required
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {/* Render Kategori dari API */}
                                            {categories && categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-500 mt-1">*Kelola di menu Kategori Paket</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                                    <input type="text" className="mt-1 w-full border rounded p-2" 
                                        placeholder="Contoh: Umroh Syawal 1446H - Bintang 5"
                                        value={formData.name || ''} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Durasi (Hari)</label>
                                        <input type="number" className="mt-1 w-full border rounded p-2" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Harga Dasar (Quad)</label>
                                        <input type="number" className="mt-1 w-full border rounded p-2" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={16}/> Akomodasi & Transportasi</h4>
                                    
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-600">Maskapai Penerbangan (Master Data)</label>
                                        <select className="mt-1 w-full border rounded p-2 text-sm" 
                                            value={formData.airline_id || ''} 
                                            onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                                            <option value="">-- Pilih Maskapai --</option>
                                            {airlines && airlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                        </select>
                                    </div>

                                    {/* DYNAMIC HOTELS */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-semibold text-gray-600">Daftar Hotel (Bisa lebih dari 2)</label>
                                            <button type="button" onClick={addAccommodation} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                                                + Tambah Hotel
                                            </button>
                                        </div>
                                        
                                        {(formData.accommodations || []).map((acc, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                                                <select className="border rounded p-1 text-sm w-1/3"
                                                    value={acc.city} onChange={e => updateAccommodation(idx, 'city', e.target.value)}>
                                                    <option value="Makkah">Makkah</option>
                                                    <option value="Madinah">Madinah</option>
                                                    <option value="Jeddah">Jeddah</option>
                                                    <option value="Transit">Transit (Turki/Dll)</option>
                                                </select>
                                                <select className="border rounded p-1 text-sm flex-1"
                                                    value={acc.hotel_id} onChange={e => updateAccommodation(idx, 'hotel_id', e.target.value)}>
                                                    <option value="">-- Pilih Hotel (Master) --</option>
                                                    {hotels && hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                                                </select>
                                                <button type="button" onClick={() => removeAccommodation(idx)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        ))}
                                        {(formData.accommodations?.length === 0) && <p className="text-xs text-gray-400 italic">Belum ada hotel dipilih.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: FACILITIES */}
                        {activeTab === 'facilities' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Fasilitas Termasuk (Include)</label>
                                <textarea className="w-full border rounded p-2 h-32" 
                                    placeholder="Tiket Pesawat PP, Visa Umroh, Makan 3x Sehari..."
                                    value={formData.facilities || ''}
                                    onChange={e => setFormData({...formData, facilities: e.target.value})}
                                ></textarea>
                                
                                <label className="block text-sm font-medium text-gray-700">Tidak Termasuk (Exclude)</label>
                                <textarea className="w-full border rounded p-2 h-20" 
                                    placeholder="Paspor, Vaksin, Keperluan Pribadi..."
                                    value={formData.excludes || ''}
                                    onChange={e => setFormData({...formData, excludes: e.target.value})}
                                ></textarea>
                            </div>
                        )}

                        {/* TAB 3: ITINERARY */}
                        {activeTab === 'itinerary' && (
                            <div className="space-y-4">
                                <div className="flex gap-4 mb-4 bg-gray-100 p-2 rounded-lg">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="itinerary_mode" value="manual" 
                                            checked={itineraryMode === 'manual'} onChange={() => setItineraryMode('manual')} />
                                        <span className="text-sm font-medium"><List size={14} className="inline"/> Input Manual</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="itinerary_mode" value="upload" 
                                            checked={itineraryMode === 'upload'} onChange={() => setItineraryMode('upload')} />
                                        <span className="text-sm font-medium"><Upload size={14} className="inline"/> Upload File PDF/Image</span>
                                    </label>
                                </div>

                                {itineraryMode === 'upload' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                                        <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 mb-4">Upload file Itinerary lengkap (PDF/JPG/PNG)</p>
                                        <input type="file" className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100
                                        "/>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(formData.itinerary_items || []).map((day, idx) => (
                                            <div key={idx} className="border p-3 rounded bg-white shadow-sm flex gap-3 items-start">
                                                <div className="bg-blue-100 text-blue-800 font-bold p-2 rounded w-16 text-center text-xs">
                                                    Hari {day.day}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input type="text" className="w-full border rounded p-1 text-sm font-bold" 
                                                        placeholder="Judul Kegiatan (Misal: Tiba di Jeddah)"
                                                        value={day.title} onChange={e => handleItineraryChange(idx, 'title', e.target.value)} />
                                                    <textarea className="w-full border rounded p-1 text-sm h-16" 
                                                        placeholder="Deskripsi detail..."
                                                        value={day.description} onChange={e => handleItineraryChange(idx, 'description', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleItineraryAdd} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 font-bold text-sm">
                                            + Tambah Hari
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="pt-4 mt-2 border-t flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-700">Batal</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, MapPin, Star, Phone, Globe, Building, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Hotels = () => {
    // --- DATA HOOK ---
    // Menggunakan endpoint master hotel
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hotels');
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [cityFilter, setCityFilter] = useState('all'); // all, Makkah, Madinah, Jeddah, Lainnya

    // Default form state
    const defaultForm = {
        name: '',
        city: 'Makkah',
        rating: '5',
        distance: '',
        address: '',
        map_link: '',
        contact_phone: '',
        facilities: '' // Wifi, Restaurant, Shuttle, etc.
    };
    const [formData, setFormData] = useState(defaultForm);

    // --- HANDLERS ---
    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || defaultForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi sederhana
        if (!formData.name || !formData.city) {
            toast.error("Nama Hotel dan Kota wajib diisi!");
            return;
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) {
            setIsModalOpen(false);
            fetchData();
        }
    };

    // --- FILTERING ---
    const filteredData = cityFilter === 'all' 
        ? data 
        : data?.filter(item => item.city === cityFilter);

    // --- KOLOM TABEL ---
    const columns = [
        { 
            header: 'Nama Hotel', 
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="font-bold text-gray-800">{row.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={12} /> {row.address || row.city}
                    </div>
                </div>
            )
        },
        { 
            header: 'Kota', 
            accessor: 'city', 
            render: (row) => {
                const badgeColor = 
                    row.city === 'Makkah' ? 'bg-gray-800 text-gold-500 border-gold-500' : // Hitam-Emas untuk Makkah
                    row.city === 'Madinah' ? 'bg-green-100 text-green-800' : 
                    'bg-blue-100 text-blue-800';
                
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${badgeColor}`}>
                        {row.city}
                    </span>
                );
            }
        },
        { 
            header: 'Rating', 
            accessor: 'rating', 
            render: (row) => (
                <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                        {[...Array(parseInt(row.rating || 0))].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">({row.rating})</span>
                </div>
            ) 
        },
        { 
            header: 'Jarak ke Masjid', 
            accessor: 'distance',
            render: (row) => row.distance ? (
                <span className={`font-medium text-sm ${parseInt(row.distance) > 500 ? 'text-red-500' : 'text-green-600'}`}>
                    ± {row.distance} m
                </span>
            ) : '-'
        },
        {
            header: 'Kontak',
            accessor: 'contact_phone',
            render: (row) => row.contact_phone ? (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} /> {row.contact_phone}
                </div>
            ) : '-'
        }
    ];

    return (
        <Layout title="Master Data Hotel">
            {/* --- DASHBOARD FILTER --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {['all', 'Makkah', 'Madinah', 'Jeddah', 'Transit'].map((city) => (
                            <button
                                key={city}
                                onClick={() => setCityFilter(city)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    cityFilter === city 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {city === 'all' ? 'Semua Kota' : city}
                            </button>
                        ))}
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={() => handleOpenModal('create')} 
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} /> Tambah Hotel
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <CrudTable 
                columns={columns} 
                data={filteredData} 
                loading={loading} 
                onEdit={(item) => handleOpenModal('edit', item)} 
                onDelete={deleteItem}
            />

            {/* --- MODAL FORM --- */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={modalMode === 'create' ? 'Tambah Data Hotel' : 'Edit Data Hotel'}
                size="max-w-3xl" // Modal lebih lebar
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Section 1: Info Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="label">Nama Hotel</label>
                            <input 
                                className="input-field" 
                                placeholder="Contoh: Swissotel Al Maqam" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2"><MapPin size={14}/> Kota Lokasi</label>
                            <select 
                                className="input-field" 
                                value={formData.city} 
                                onChange={e => setFormData({...formData, city: e.target.value})}
                            >
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Transit">Transit / Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="label flex items-center gap-2"><Star size={14} className="text-yellow-500"/> Rating Bintang</label>
                            <select 
                                className="input-field" 
                                value={formData.rating} 
                                onChange={e => setFormData({...formData, rating: e.target.value})}
                            >
                                <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                                <option value="3">⭐⭐⭐ (3 Bintang)</option>
                                <option value="2">⭐⭐ (2 Bintang)</option>
                                <option value="1">⭐ (1 Bintang)</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Jarak ke Masjid (Meter)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="input-field pr-12" 
                                    placeholder="0" 
                                    value={formData.distance} 
                                    onChange={e => setFormData({...formData, distance: e.target.value})} 
                                />
                                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">meter</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Estimasi jarak jalan kaki.</p>
                        </div>

                        <div>
                            <label className="label flex items-center gap-2"><Phone size={14}/> No. Telepon Hotel</label>
                            <input 
                                className="input-field" 
                                placeholder="+966..." 
                                value={formData.contact_phone} 
                                onChange={e => setFormData({...formData, contact_phone: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Section 2: Detail Lokasi */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Building size={16}/> Detail Lokasi & Fasilitas
                        </h4>
                        
                        <div>
                            <label className="label">Alamat Lengkap</label>
                            <textarea 
                                className="input-field h-20" 
                                placeholder="Alamat jalan atau area..." 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label flex items-center gap-2"><Globe size={14}/> Link Google Maps</label>
                                <input 
                                    className="input-field" 
                                    placeholder="https://maps.google.com/..." 
                                    value={formData.map_link} 
                                    onChange={e => setFormData({...formData, map_link: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="label">Fasilitas Utama</label>
                                <input 
                                    className="input-field" 
                                    placeholder="Wifi, Shuttle Bus, Breakfast..." 
                                    value={formData.facilities} 
                                    onChange={e => setFormData({...formData, facilities: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary px-6"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary px-6"
                        >
                            {modalMode === 'create' ? 'Simpan Hotel' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Hotels;
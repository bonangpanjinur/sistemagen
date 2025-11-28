import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Briefcase, DollarSign, Building, List, Save } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    // Pastikan endpoint ini benar di PHP
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    
    // Data Master untuk Dropdown
    const { data: hotels } = useCRUD('umh/v1/hotels');
    const { data: airlines } = useCRUD('umh/v1/flights');
    const { data: categories } = useCRUD('umh/v1/package-categories');

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('basic'); // basic, pricing, facilities
    const [currentItem, setCurrentItem] = useState(null);
    
    // Initial State Lengkap
    const initialForm = {
        name: '',
        service_type: 'umroh',
        category_id: '',
        airline_id: '',
        duration: 9,
        departure_city: 'Jakarta',
        price_quad: 0,
        price_triple: 0,
        price_double: 0,
        hotel_makkah_id: '',
        hotel_madinah_id: '',
        facilities: '',
        excludes: '',
        status: 'active'
    };

    const [formData, setFormData] = useState(initialForm);

    // Parser data saat Edit (karena data di database mungkin string JSON)
    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setActiveTab('basic');
        
        if (item) {
            // Parse Harga
            let prices = { quad: 0, triple: 0, double: 0 };
            try {
                if (typeof item.prices === 'string') prices = JSON.parse(item.prices);
                else if (typeof item.prices === 'object' && item.prices !== null) prices = item.prices;
            } catch(e) { console.error("Error parse prices", e); }

            // Parse Akomodasi
            let acc = [];
            try {
                if (typeof item.accommodations === 'string') acc = JSON.parse(item.accommodations);
                else if (Array.isArray(item.accommodations)) acc = item.accommodations;
            } catch(e) { console.error("Error parse accommodation", e); }
            
            const hotelMakkah = acc.find(h => h.city === 'Makkah')?.hotel_id || '';
            const hotelMadinah = acc.find(h => h.city === 'Madinah')?.hotel_id || '';

            setFormData({
                ...initialForm,
                ...item,
                price_quad: prices.quad || item.price || 0,
                price_triple: prices.triple || 0,
                price_double: prices.double || 0,
                hotel_makkah_id: hotelMakkah,
                hotel_madinah_id: hotelMadinah
            });
        } else {
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Construct Payload
        const payload = {
            name: formData.name,
            service_type: formData.service_type,
            category_id: formData.category_id,
            airline_id: formData.airline_id,
            duration: formData.duration,
            status: formData.status,
            facilities: formData.facilities,
            excludes: formData.excludes,
            
            // Harga Utama & Varian JSON
            price: formData.price_quad, 
            prices: JSON.stringify({
                quad: formData.price_quad,
                triple: formData.price_triple,
                double: formData.price_double
            }),

            // Akomodasi JSON
            accommodations: JSON.stringify([
                { city: 'Makkah', hotel_id: formData.hotel_makkah_id },
                { city: 'Madinah', hotel_id: formData.hotel_madinah_id }
            ])
        };

        const success = modalMode === 'create' 
            ? await createItem(payload) 
            : await updateItem(currentItem.id, payload);
        
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name' },
        { header: 'Tipe', accessor: 'service_type', render: r => <span className="uppercase text-xs font-bold bg-gray-100 px-2 py-1 rounded">{r.service_type}</span> },
        { header: 'Durasi', accessor: 'duration', render: r => `${r.duration} Hari` },
        { header: 'Harga Mulai', accessor: 'price', render: r => formatCurrency(r.price) },
        { header: 'Status', accessor: 'status' }
    ];

    const TabBtn = ({ id, icon: Icon, label }) => (
        <button type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 border-b-2 ${activeTab === id ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500'}`}>
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <Layout title="Manajemen Paket Umrah & Haji">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Paket
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={(item) => handleOpenModal('edit', item)} onDelete={deleteItem} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Buat Paket Baru' : 'Edit Paket'} size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2 border-b mb-6">
                        <TabBtn id="basic" icon={Briefcase} label="Info Dasar" />
                        <TabBtn id="pricing" icon={DollarSign} label="Harga & Varian" />
                        <TabBtn id="facilities" icon={Building} label="Fasilitas" />
                    </div>

                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2"><label className="label">Nama Paket</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                                <div><label className="label">Jenis Layanan</label><select className="input-field" value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})}><option value="umroh">Umrah</option><option value="haji">Haji</option><option value="tour">Wisata Halal</option></select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Kategori</label>
                                    <select className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                                        <option value="">-- Pilih --</option>
                                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Maskapai</label>
                                    <select className="input-field" value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                                        <option value="">-- Pilih --</option>
                                        {airlines?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Durasi (Hari)</label><input type="number" className="input-field" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
                                <div><label className="label">Status</label><select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="active">Aktif</option><option value="draft">Draft</option></select></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="bg-blue-50 p-4 rounded border border-blue-200 space-y-4">
                            <div>
                                <label className="label">Harga Quad (Sekamar Ber-4)</label>
                                <input type="number" className="input-field font-bold text-lg" value={formData.price_quad} onChange={e => setFormData({...formData, price_quad: e.target.value})} placeholder="0" />
                                <p className="text-xs text-gray-500">*Harga dasar yang tampil di list.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Harga Triple (Ber-3)</label><input type="number" className="input-field" value={formData.price_triple} onChange={e => setFormData({...formData, price_triple: e.target.value})} /></div>
                                <div><label className="label">Harga Double (Ber-2)</label><input type="number" className="input-field" value={formData.price_double} onChange={e => setFormData({...formData, price_double: e.target.value})} /></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'facilities' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Hotel Makkah</label><select className="input-field" value={formData.hotel_makkah_id} onChange={e => setFormData({...formData, hotel_makkah_id: e.target.value})}><option value="">-- Pilih --</option>{hotels?.filter(h => h.location === 'Makkah').map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                                <div><label className="label">Hotel Madinah</label><select className="input-field" value={formData.hotel_madinah_id} onChange={e => setFormData({...formData, hotel_madinah_id: e.target.value})}><option value="">-- Pilih --</option>{hotels?.filter(h => h.location === 'Madinah').map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Termasuk (Include)</label><textarea className="input-field h-24" value={formData.facilities} onChange={e => setFormData({...formData, facilities: e.target.value})}></textarea></div>
                                <div><label className="label">Tidak Termasuk (Exclude)</label><textarea className="input-field h-24" value={formData.excludes} onChange={e => setFormData({...formData, excludes: e.target.value})}></textarea></div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary flex items-center gap-2"><Save size={16} /> Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Packages;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Package as IconPkg, Building, Plane } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    // 1. Data Paket Utama
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    
    // 2. Data Master untuk Dropdown
    const { data: hotels } = useCRUD('umh/v1/hotels');
    const { data: flights } = useCRUD('umh/v1/flights');
    const { data: categories } = useCRUD('umh/v1/package-categories');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    const initialForm = {
        name: '', 
        category_id: '', 
        duration: 9, 
        price: 0, 
        hotel_makkah: '',
        hotel_madinah: '',
        airline: '',
        facilities: '',
        description: ''
    };
    const [formData, setFormData] = useState(initialForm);

    // Load data master saat komponen dimuat
    useEffect(() => { 
        fetchData();
        // Hotels & Flights akan auto-load karena useCRUD fetch otomatis di init, 
        // tapi jika tidak, kita bisa panggil manual methodnya jika kita destructure fetchData dari hooknya.
        // Asumsi: useCRUD melakukan fetch otomatis di useEffect internalnya.
    }, [fetchData]);

    // Filter Hotel berdasarkan Kota (Opsional, untuk memudahkan)
    const makkahHotels = hotels ? hotels.filter(h => h.city === 'Makkah' || !h.city) : [];
    const madinahHotels = hotels ? hotels.filter(h => h.city === 'Madinah' || !h.city) : [];

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name', className: 'font-bold' },
        { header: 'Durasi', accessor: 'duration', render: r => r.duration + ' Hari' },
        { header: 'Harga Dasar', accessor: 'price', render: r => formatCurrency(r.price) },
        { header: 'Hotel', accessor: 'hotel_makkah', render: r => (
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-1"><Building size={10} className="text-gray-400"/> <span className="font-semibold text-gray-700">Makkah:</span> {r.hotel_makkah || '-'}</div>
                <div className="flex items-center gap-1"><Building size={10} className="text-gray-400"/> <span className="font-semibold text-gray-700">Madinah:</span> {r.hotel_madinah || '-'}</div>
            </div>
        )},
        { header: 'Maskapai', accessor: 'airline', render: r => r.airline ? <div className="flex items-center gap-1"><Plane size={12}/> {r.airline}</div> : '-' }
    ];

    return (
        <Layout title="Paket Umroh & Haji">
            <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-500 text-sm">Kelola katalog paket perjalanan Anda.</p>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2 items-center">
                    <Plus size={18}/> Tambah Paket
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode==='create' ? "Tambah Paket Baru" : "Edit Paket"} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Nama Paket</label>
                            <input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Umroh Hemat 9 Hari" />
                        </div>
                        
                        <div>
                            <label className="label">Kategori</label>
                            <select className="input-field" value={formData.category_id} onChange={e=>setFormData({...formData, category_id: e.target.value})}>
                                <option value="">-- Pilih Kategori --</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Durasi (Hari)</label>
                            <input type="number" className="input-field" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} />
                        </div>

                        <div className="col-span-2">
                            <label className="label">Harga Dasar (Rp)</label>
                            <input type="number" className="input-field text-lg font-semibold" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
                            <p className="text-xs text-gray-500 mt-1">Harga ini akan menjadi default saat buat jadwal keberangkatan.</p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 col-span-2 md:col-span-1">
                            <label className="label text-blue-800 flex items-center gap-2"><Building size={14}/> Hotel Makkah</label>
                            <select className="input-field" value={formData.hotel_makkah} onChange={e=>setFormData({...formData, hotel_makkah: e.target.value})}>
                                <option value="">-- Pilih Hotel Makkah --</option>
                                {makkahHotels.map(h => (
                                    <option key={h.id} value={h.name}>{h.name} ({h.rating}*)</option>
                                ))}
                                <option value="custom" disabled>--- Atau ketik manual jika belum ada di master ---</option>
                            </select>
                             {/* Fallback input manual jika perlu, tapi sekarang kita pakai select */}
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 col-span-2 md:col-span-1">
                            <label className="label text-green-800 flex items-center gap-2"><Building size={14}/> Hotel Madinah</label>
                            <select className="input-field" value={formData.hotel_madinah} onChange={e=>setFormData({...formData, hotel_madinah: e.target.value})}>
                                <option value="">-- Pilih Hotel Madinah --</option>
                                {madinahHotels.map(h => (
                                    <option key={h.id} value={h.name}>{h.name} ({h.rating}*)</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="col-span-2">
                            <label className="label flex items-center gap-2"><Plane size={14}/> Maskapai Penerbangan</label>
                            <select className="input-field" value={formData.airline} onChange={e=>setFormData({...formData, airline: e.target.value})}>
                                <option value="">-- Pilih Maskapai --</option>
                                {flights?.map(f => (
                                    <option key={f.id} value={f.name}>{f.name} ({f.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="label">Fasilitas / Keterangan</label>
                            <textarea className="input-field" rows="3" value={formData.facilities} onChange={e=>setFormData({...formData, facilities: e.target.value})} placeholder="Bus AC, Makan 3x, dll..."></textarea>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Packages;
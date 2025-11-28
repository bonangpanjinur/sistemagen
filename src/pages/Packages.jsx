import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Trash2, Building } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    // Relasi ke Master Data
    const { data: hotels } = useCRUD('umh/v1/hotels');
    const { data: airlines } = useCRUD('umh/v1/flights');
    const { data: categories } = useCRUD('umh/v1/package-categories');

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // State form
    const initialForm = {
        name: '', service_type: 'umroh', category_id: '', airline_id: '', duration: 9,
        price_quad: 0, price_triple: 0, price_double: 0,
        accommodations: [{ city: 'Makkah', hotel_id: '' }, { city: 'Madinah', hotel_id: '' }], // Default 2 hotel
        facilities: '', excludes: '', status: 'active'
    };
    const [formData, setFormData] = useState(initialForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        if (item) {
            // Parsing Accommodations JSON
            let parsedAcc = [];
            try {
                parsedAcc = typeof item.accommodations === 'string' ? JSON.parse(item.accommodations) : item.accommodations;
            } catch(e) { parsedAcc = []; }

            // Parsing Prices JSON
            let prices = {};
            try {
                prices = typeof item.prices === 'string' ? JSON.parse(item.prices) : item.prices || {};
            } catch(e) {}

            setFormData({
                ...initialForm, ...item,
                accommodations: Array.isArray(parsedAcc) && parsedAcc.length > 0 ? parsedAcc : initialForm.accommodations,
                price_quad: prices.quad || item.price || 0,
                price_triple: prices.triple || 0,
                price_double: prices.double || 0,
            });
        } else {
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    // --- LOGIKA MULTI HOTEL ---
    const addHotelRow = () => {
        setFormData(prev => ({
            ...prev,
            accommodations: [...prev.accommodations, { city: '', hotel_id: '' }]
        }));
    };

    const removeHotelRow = (index) => {
        const newAcc = [...formData.accommodations];
        newAcc.splice(index, 1);
        setFormData(prev => ({ ...prev, accommodations: newAcc }));
    };

    const updateHotelRow = (index, field, value) => {
        const newAcc = [...formData.accommodations];
        newAcc[index][field] = value;
        setFormData(prev => ({ ...prev, accommodations: newAcc }));
    };
    // ---------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: formData.price_quad, // Harga dasar
            prices: JSON.stringify({ quad: formData.price_quad, triple: formData.price_triple, double: formData.price_double }),
            accommodations: JSON.stringify(formData.accommodations) // Simpan sebagai JSON String
        };

        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name' },
        { header: 'Maskapai', accessor: 'airline_id', render: r => airlines?.find(a => a.id == r.airline_id)?.name || '-' }, // Relasi display
        { header: 'Harga Mulai', accessor: 'price', render: r => formatCurrency(r.price) },
        { header: 'Hotel', accessor: 'accommodations', render: r => {
            let acc = [];
            try { acc = typeof r.accommodations === 'string' ? JSON.parse(r.accommodations) : r.accommodations; } catch(e){}
            return <span className="text-xs">{Array.isArray(acc) ? acc.length + ' Hotel' : '-'}</span>
        }}
    ];

    return (
        <Layout title="Manajemen Paket">
            <div className="mb-4 flex justify-end"><button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Paket Baru</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Paket" size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Nama Paket</label><input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
                        <div><label className="label">Maskapai (Master Data)</label><select className="input-field" value={formData.airline_id} onChange={e=>setFormData({...formData, airline_id: e.target.value})}><option value="">-- Pilih Maskapai --</option>{airlines?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                    </div>
                    
                    {/* HARGA */}
                    <div className="bg-blue-50 p-4 rounded border">
                        <h4 className="font-bold text-sm mb-2 text-blue-800">Harga Paket Per Kamar</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="label text-xs">Quad (Ber-4)</label><input type="number" className="input-field" value={formData.price_quad} onChange={e=>setFormData({...formData, price_quad: e.target.value})} /></div>
                            <div><label className="label text-xs">Triple (Ber-3)</label><input type="number" className="input-field" value={formData.price_triple} onChange={e=>setFormData({...formData, price_triple: e.target.value})} /></div>
                            <div><label className="label text-xs">Double (Ber-2)</label><input type="number" className="input-field" value={formData.price_double} onChange={e=>setFormData({...formData, price_double: e.target.value})} /></div>
                        </div>
                    </div>

                    {/* MULTI HOTEL SECTION */}
                    <div className="border p-4 rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><Building size={16}/> Akomodasi Hotel</h4>
                            <button type="button" onClick={addHotelRow} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Tambah Hotel</button>
                        </div>
                        {formData.accommodations.map((row, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-500">Kota</label>
                                    <input className="input-field py-1 text-sm" value={row.city} onChange={e=>updateHotelRow(idx, 'city', e.target.value)} placeholder="Kota" />
                                </div>
                                <div className="flex-[2]">
                                    <label className="text-[10px] text-gray-500">Pilih Hotel (Master Data)</label>
                                    <select className="input-field py-1 text-sm" value={row.hotel_id} onChange={e=>updateHotelRow(idx, 'hotel_id', e.target.value)}>
                                        <option value="">-- Pilih Hotel --</option>
                                        {hotels?.map(h => <option key={h.id} value={h.id}>{h.name} ({h.rating}*)</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeHotelRow(idx)} className="text-red-500 hover:bg-red-100 p-2 rounded"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Packages;
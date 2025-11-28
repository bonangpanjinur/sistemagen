import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Trash2, Building, Plane } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    // Point 7: Ambil data master Hotel & Maskapai (Flights)
    const { data: hotels } = useCRUD('umh/v1/hotels');
    const { data: airlines } = useCRUD('umh/v1/flights'); 

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    const initialForm = {
        name: '', airline_id: '', 
        price_quad: 0, price_triple: 0, price_double: 0,
        accommodations: [{ city: 'Makkah', hotel_id: '' }, { city: 'Madinah', hotel_id: '' }], // Point 3: Array Hotel
    };
    const [formData, setFormData] = useState(initialForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        if (item) {
            let parsedAcc = [];
            try { parsedAcc = typeof item.accommodations === 'string' ? JSON.parse(item.accommodations) : item.accommodations; } catch(e) { parsedAcc = []; }
            let prices = {};
            try { prices = typeof item.prices === 'string' ? JSON.parse(item.prices) : item.prices || {}; } catch(e) {}

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

    // Point 3: Logic Tambah/Hapus Hotel
    const addHotelRow = () => setFormData(prev => ({ ...prev, accommodations: [...prev.accommodations, { city: '', hotel_id: '' }] }));
    const removeHotelRow = (idx) => setFormData(prev => ({ ...prev, accommodations: prev.accommodations.filter((_, i) => i !== idx) }));
    const updateHotelRow = (idx, field, val) => {
        const newAcc = [...formData.accommodations];
        newAcc[idx][field] = val;
        setFormData(prev => ({ ...prev, accommodations: newAcc }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: formData.price_quad, 
            prices: JSON.stringify({ quad: formData.price_quad, triple: formData.price_triple, double: formData.price_double }),
            accommodations: JSON.stringify(formData.accommodations) 
        };
        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name' },
        { header: 'Maskapai', accessor: 'airline_id', render: r => {
            const airline = airlines?.find(a => String(a.id) === String(r.airline_id));
            return airline ? <span className="flex items-center gap-1"><Plane size={12}/> {airline.name}</span> : '-';
        }},
        { header: 'Harga Mulai', accessor: 'price', render: r => formatCurrency(r.price) },
        { header: 'Hotel', accessor: 'accommodations', render: r => {
            let acc = [];
            try { acc = typeof r.accommodations === 'string' ? JSON.parse(r.accommodations) : r.accommodations; } catch(e){}
            return <span className="text-xs badge bg-gray-100 border px-2 py-1 rounded">{Array.isArray(acc) ? acc.length + ' Hotel' : '-'}</span>
        }}
    ];

    return (
        <Layout title="Paket Umroh">
            <div className="mb-4 flex justify-end"><button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Paket Baru</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Paket" size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Nama Paket</label><input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
                        {/* Point 7: Dropdown Maskapai */}
                        <div>
                            <label className="label">Maskapai (Master Data)</label>
                            <select className="input-field" value={formData.airline_id} onChange={e=>setFormData({...formData, airline_id: e.target.value})}>
                                <option value="">-- Pilih Maskapai --</option>
                                {airlines?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded border">
                        <div className="flex justify-between mb-2">
                            <h4 className="font-bold text-sm">Akomodasi Hotel (Point 3)</h4>
                            <button type="button" onClick={addHotelRow} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">+ Tambah Hotel</button>
                        </div>
                        {formData.accommodations.map((row, idx) => (
                            <div key={idx} className="flex gap-2 items-end mb-2">
                                <div className="w-1/3">
                                    <input className="input-field py-1 text-sm" value={row.city} onChange={e=>updateHotelRow(idx, 'city', e.target.value)} placeholder="Kota (Contoh: Dubai)" />
                                </div>
                                <div className="flex-1">
                                    {/* Point 7: Dropdown Hotel */}
                                    <select className="input-field py-1 text-sm" value={row.hotel_id} onChange={e=>updateHotelRow(idx, 'hotel_id', e.target.value)}>
                                        <option value="">-- Pilih Hotel --</option>
                                        {hotels?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeHotelRow(idx)} className="text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded">
                        <div><label className="label text-xs">Harga Quad</label><input type="number" className="input-field" value={formData.price_quad} onChange={e=>setFormData({...formData, price_quad: e.target.value})} /></div>
                        <div><label className="label text-xs">Harga Triple</label><input type="number" className="input-field" value={formData.price_triple} onChange={e=>setFormData({...formData, price_triple: e.target.value})} /></div>
                        <div><label className="label text-xs">Harga Double</label><input type="number" className="input-field" value={formData.price_double} onChange={e=>setFormData({...formData, price_double: e.target.value})} /></div>
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Packages;
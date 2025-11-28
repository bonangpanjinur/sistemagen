import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const Departures = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/departures');
    const { data: packages } = useCRUD('umh/v1/packages');

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    // Point 2: Tambah field price_override
    const [formData, setFormData] = useState({ package_id: '', departure_date: '', quota: 45, price_override: 0 });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item ? { ...item, departure_date: item.departure_date?.split('T')[0] } : { package_id: '', departure_date: '', quota: 45, price_override: 0 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    const columns = [
        { header: 'Tanggal', accessor: 'departure_date', render: r => formatDate(r.departure_date) },
        { header: 'Paket', accessor: 'package_name' }, 
        { 
            header: 'Harga Seat', 
            accessor: 'price', 
            render: r => {
                // Point 2: Visualisasi Harga Khusus
                const isOverride = parseFloat(r.price_override) > 0;
                return (
                    <div>
                        <div className="font-bold">{formatCurrency(isOverride ? r.price_override : r.base_price)}</div>
                        {isOverride && <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded">Harga Khusus</span>}
                    </div>
                )
            }
        },
        { header: 'Kuota', accessor: 'quota' },
    ];

    return (
        <Layout title="Jadwal Keberangkatan">
            <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2"><Plus size={18} /> Tambah Jadwal</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={(item) => handleOpenModal('edit', item)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Atur Jadwal">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Pilih Paket</label><select className="input-field" value={formData.package_id} onChange={e => setFormData({...formData, package_id: e.target.value})} required><option value="">-- Pilih Paket --</option>{packages?.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
                    <div><label className="label">Tanggal</label><input type="date" className="input-field" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} required /></div>
                    
                    {/* Point 2: Input Harga Khusus */}
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <label className="label text-yellow-800">Harga Khusus Tanggal Ini (Opsional)</label>
                        <input type="number" className="input-field" placeholder="0 (Ikut harga paket)" value={formData.price_override} onChange={e => setFormData({...formData, price_override: e.target.value})} />
                        <p className="text-xs text-yellow-700 mt-1">*Isi jika harga tanggal ini berbeda (Misal: High Season).</p>
                    </div>

                    <div><label className="label">Kuota Seat</label><input type="number" className="input-field" value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} /></div>
                    
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Departures;
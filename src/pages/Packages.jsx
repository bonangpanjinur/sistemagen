import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Edit, Trash2, Package as IconPkg } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Packages = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
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

    useEffect(() => { fetchData(); }, [fetchData]);

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
            <div className="text-xs">
                <div><span className="font-bold">Makkah:</span> {r.hotel_makkah || '-'}</div>
                <div><span className="font-bold">Madinah:</span> {r.hotel_madinah || '-'}</div>
            </div>
        )},
        { header: 'Maskapai', accessor: 'airline' }
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
                            <label className="label">Harga Dasar (Rp)</label>
                            <input type="number" className="input-field" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
                            <p className="text-xs text-gray-500 mt-1">Harga ini akan menjadi default saat buat jadwal.</p>
                        </div>
                        
                        <div>
                            <label className="label">Durasi (Hari)</label>
                            <input type="number" className="input-field" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} />
                        </div>

                        <div>
                            <label className="label">Hotel Makkah</label>
                            <input className="input-field" value={formData.hotel_makkah} onChange={e=>setFormData({...formData, hotel_makkah: e.target.value})} placeholder="Nama Hotel" />
                        </div>

                        <div>
                            <label className="label">Hotel Madinah</label>
                            <input className="input-field" value={formData.hotel_madinah} onChange={e=>setFormData({...formData, hotel_madinah: e.target.value})} placeholder="Nama Hotel" />
                        </div>
                        
                        <div>
                            <label className="label">Maskapai Penerbangan</label>
                            <input className="input-field" value={formData.airline} onChange={e=>setFormData({...formData, airline: e.target.value})} placeholder="Contoh: Garuda Indonesia" />
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
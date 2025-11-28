import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Departures = () => {
    // Pastikan endpoint 'umh/v1/departures' ada di PHP dan mengembalikan field 'package_name'
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/departures');
    const { data: packages } = useCRUD('umh/v1/packages'); // Ambil list paket untuk dropdown

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Default state untuk form
    const defaultForm = {
        package_id: '',
        departure_date: '',
        quota: 45,
        status: 'open'
    };
    const [formData, setFormData] = useState(defaultForm);

    // Handler untuk membuka modal (Create/Edit)
    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        if (item) {
            // Mode Edit: Isi form dengan data item
            setFormData({
                ...item,
                // PENTING: Format tanggal agar terbaca di input type="date" (ambil YYYY-MM-DD saja)
                departure_date: item.departure_date ? item.departure_date.split('T')[0] : ''
            });
        } else {
            // Mode Create: Reset form
            setFormData(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        
        if (success) {
            setIsModalOpen(false);
            fetchData(); // Refresh data agar tampilan tabel update
        }
    };

    const columns = [
        { 
            header: 'Tanggal', 
            accessor: 'departure_date', 
            render: r => formatDate(r.departure_date) 
        },
        { 
            header: 'Paket', 
            accessor: 'package_name', // Pastikan API backend melakukan JOIN ke tabel paket
            render: r => <span className="font-medium">{r.package_name || '-'}</span>
        }, 
        { 
            header: 'Kuota', 
            accessor: 'quota',
            render: r => `${r.quota} Seat`
        },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: r => {
                const statusColors = {
                    open: 'bg-green-100 text-green-700',
                    full: 'bg-red-100 text-red-700',
                    closed: 'bg-gray-100 text-gray-700'
                };
                return (
                    <span className={`badge px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[r.status] || 'bg-gray-100'}`}>
                        {r.status}
                    </span>
                );
            } 
        }
    ];

    return (
        <Layout title="Jadwal Keberangkatan">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => handleOpenModal('create')} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah Jadwal
                </button>
            </div>

            <CrudTable 
                columns={columns} 
                data={data} 
                loading={loading} 
                onEdit={(item) => handleOpenModal('edit', item)} 
                onDelete={deleteItem} 
            />

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={modalMode === 'create' ? 'Atur Jadwal Baru' : 'Edit Jadwal'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Pilih Paket</label>
                        <select 
                            className="input-field" 
                            value={formData.package_id} 
                            onChange={e => setFormData({...formData, package_id: e.target.value})} 
                            required
                        >
                            <option value="">-- Pilih Paket --</option>
                            {packages?.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Tanggal Keberangkatan</label>
                        <input 
                            type="date" 
                            className="input-field" 
                            value={formData.departure_date} 
                            onChange={e => setFormData({...formData, departure_date: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kuota Seat</label>
                            <input 
                                type="number" 
                                className="input-field" 
                                value={formData.quota} 
                                onChange={e => setFormData({...formData, quota: e.target.value})} 
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select 
                                className="input-field" 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="open">Open (Buka)</option>
                                <option value="full">Full (Penuh)</option>
                                <option value="closed">Closed (Tutup)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button type="submit" className="btn-primary w-full sm:w-auto">
                            Simpan Jadwal
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Departures;
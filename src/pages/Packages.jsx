import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast'; // [NEW] Import Toast untuk notifikasi

const Packages = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('packages');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Parse JSON prices helper
    const getPrices = (jsonString) => {
        try {
            return JSON.parse(jsonString) || { quad: 0, triple: 0, double: 0 };
        } catch (e) {
            return { quad: 0, triple: 0, double: 0 };
        }
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        // Setup initial prices object from JSON string if editing
        let initialPrices = { quad: 0, triple: 0, double: 0 };
        if (item && item.prices) {
            initialPrices = getPrices(item.prices);
        } else if (item && item.price) {
            // Fallback for old data
            initialPrices = { quad: item.price, triple: 0, double: 0 };
        }

        setFormData(item ? { ...item, pricesObj: initialPrices } : { 
            name: '', duration: 9, service_type: 'umroh', 
            pricesObj: { quad: 0, triple: 0, double: 0 } 
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert pricesObj back to JSON string and main price (Quad as default)
        const payload = {
            ...formData,
            price: formData.pricesObj.quad, // Set default listing price
            prices: JSON.stringify(formData.pricesObj)
        };
        delete payload.pricesObj; // Cleanup temp object

        const success = modalMode === 'create' 
            ? await createItem(payload) 
            : await updateItem(currentItem.id, payload);
        
        // [UX] Tambahkan notifikasi toast
        if (success) {
            setIsModalOpen(false);
            toast.success(modalMode === 'create' ? 'Paket berhasil ditambahkan!' : 'Paket berhasil diperbarui!');
        } else {
            toast.error('Gagal menyimpan paket.');
        }
    };

    // [UX] Wrapper untuk delete dengan konfirmasi & notifikasi
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
            const success = await deleteItem(id);
            if (success) toast.success('Paket telah dihapus.');
            else toast.error('Gagal menghapus paket.');
        }
    };

    const columns = [
        { header: 'Nama Paket', accessor: 'name', sortable: true },
        { header: 'Tipe', accessor: 'service_type', render: row => <span className="uppercase text-xs font-bold bg-gray-100 px-2 py-1 rounded">{row.service_type}</span> },
        { header: 'Durasi', accessor: 'duration', render: row => `${row.duration} Hari` },
        { 
            header: 'Harga (Quad/Start)', 
            accessor: 'price',
            render: (row) => formatCurrency(row.price)
        },
    ];

    return (
        <Layout title="Manajemen Paket Umrah & Haji">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => handleOpenModal('create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors"
                >
                    <Plus size={18} /> Tambah Paket
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={handleDelete} // Gunakan handler baru dengan toast
                userCapabilities={user?.role}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Paket Baru' : 'Edit Paket'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                        <input 
                            type="text" 
                            className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                            placeholder="Contoh: Paket Umrah Awal Ramadhan"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jenis Layanan</label>
                            <select 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.service_type || 'umroh'} 
                                onChange={e => setFormData({...formData, service_type: e.target.value})}
                            >
                                <option value="umroh">Umrah</option>
                                <option value="haji">Haji</option>
                                <option value="tour">Wisata Halal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Durasi (Hari)</label>
                            <input 
                                type="number" 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.duration || 9} 
                                onChange={e => setFormData({...formData, duration: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Pricing Variants Section */}
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                        <label className="block text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                            <DollarSign size={16}/> Varian Harga Sekamar
                        </label>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-600 font-bold uppercase">Quad (Sekamar Ber-4)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded p-2 pl-8 focus:ring-green-500 focus:border-green-500" 
                                        value={formData.pricesObj?.quad || 0} 
                                        onChange={e => setFormData({...formData, pricesObj: {...formData.pricesObj, quad: e.target.value}})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-600 font-bold uppercase">Triple (Ber-3)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 text-xs">Rp</span>
                                        <input 
                                            type="number" 
                                            className="w-full border rounded p-2 pl-8 focus:ring-green-500 focus:border-green-500" 
                                            value={formData.pricesObj?.triple || 0} 
                                            onChange={e => setFormData({...formData, pricesObj: {...formData.pricesObj, triple: e.target.value}})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 font-bold uppercase">Double (Ber-2)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 text-xs">Rp</span>
                                        <input 
                                            type="number" 
                                            className="w-full border rounded p-2 pl-8 focus:ring-green-500 focus:border-green-500" 
                                            value={formData.pricesObj?.double || 0} 
                                            onChange={e => setFormData({...formData, pricesObj: {...formData.pricesObj, double: e.target.value}})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 shadow-sm transition-colors">Simpan Paket</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;
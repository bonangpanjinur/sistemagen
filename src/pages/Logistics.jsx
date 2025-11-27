import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import { useData } from '../contexts/DataContext';
import useCRUD from '../hooks/useCRUD';
import Modal from '../components/Modal';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const Logistics = () => {
    const { user } = useData();
    // Gunakan endpoint logistics (yang mungkin gabungan data jamaah + status perlengkapan)
    const { data, loading, updateItem } = useCRUD('umh/v1/logistics');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [handoverData, setHandoverData] = useState({});

    // FITUR 6: Alur Logistik Sesuai Excel
    // Kolom: Nama Jamaah, Perlengkapan (Checklist), Diambil Oleh, Status
    const columns = [
        { header: 'Nama Jamaah', accessor: 'jamaah_name', sortable: true },
        { header: 'Paket', accessor: 'package_name' },
        { header: 'Alamat Pengiriman', accessor: 'address' }, // Dari Excel: ALAMAT PENGIRIMAN
        { header: 'Perlengkapan', accessor: 'items_status', render: (row) => {
            const items = row.items || { koper: false, kain_ihram: false, tas_paspor: false };
            const takenCount = Object.values(items).filter(Boolean).length;
            const total = Object.keys(items).length;
            return (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {takenCount}/{total} Item
                </span>
            );
        }},
        { header: 'Status Pengambilan', accessor: 'handover_status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${row.handover_status === 'taken' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {row.handover_status === 'taken' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                {row.handover_status === 'taken' ? 'Sudah Diambil' : 'Belum Diambil'}
            </span>
        )},
        { header: 'Diambil Oleh', accessor: 'taken_by', render: (row) => row.taken_by || '-' }, // Dari Excel: DI AMBIL OLEH
    ];

    const handleHandoverClick = (item) => {
        setCurrentItem(item);
        setHandoverData({
            handover_status: item.handover_status || 'pending',
            taken_by: item.taken_by || '',
            date_taken: item.date_taken || new Date().toISOString().split('T')[0],
            items: item.items || { koper: false, kain_ihram: false, batik: false }
        });
        setIsModalOpen(true);
    };

    const handleSaveHandover = async (e) => {
        e.preventDefault();
        // Update status logistik jamaah
        await updateItem(currentItem.id, handoverData);
        setIsModalOpen(false);
    };

    const toggleItemCheck = (key) => {
        setHandoverData(prev => ({
            ...prev,
            items: { ...prev.items, [key]: !prev.items[key] }
        }));
    };

    return (
        <Layout title="Logistik & Perlengkapan">
            <div className="mb-4 bg-white p-4 rounded shadow-sm border border-blue-100 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-gray-800">Distribusi Perlengkapan</h2>
                    <p className="text-sm text-gray-500">Kelola serah terima koper, kain ihram, dan perlengkapan jamaah.</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                    <Truck size={24} />
                </div>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                // Custom Action untuk "Serah Terima"
                renderRowActions={(row) => (
                    <button 
                        onClick={() => handleHandoverClick(row)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                        Update Serah Terima
                    </button>
                )}
                userCapabilities={user?.role}
                editCapability="manage_options"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Serah Terima: ${currentItem?.jamaah_name}`}>
                <form onSubmit={handleSaveHandover} className="space-y-4">
                    
                    {/* Checklist Item */}
                    <div className="bg-gray-50 p-3 rounded border">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Checklist Item Keluar</label>
                        <div className="space-y-2">
                            {['koper', 'kain_ihram', 'batik', 'tas_paspor', 'buku_doa'].map((itemKey) => (
                                <label key={itemKey} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={handoverData.items?.[itemKey] || false}
                                        onChange={() => toggleItemCheck(itemKey)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="capitalize text-sm">{itemKey.replace('_', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                className="mt-1 w-full border rounded p-2"
                                value={handoverData.handover_status}
                                onChange={e => setHandoverData({...handoverData, handover_status: e.target.value})}
                            >
                                <option value="pending">Belum Diambil</option>
                                <option value="taken">Sudah Diambil</option>
                                <option value="shipped">Dikirim Ekspedisi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input 
                                type="date" 
                                className="mt-1 w-full border rounded p-2"
                                value={handoverData.date_taken}
                                onChange={e => setHandoverData({...handoverData, date_taken: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diambil Oleh / Penerima</label>
                        <input 
                            type="text" 
                            className="mt-1 w-full border rounded p-2"
                            placeholder="Nama penerima atau agen..."
                            value={handoverData.taken_by}
                            onChange={e => setHandoverData({...handoverData, taken_by: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan Status</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Logistics;
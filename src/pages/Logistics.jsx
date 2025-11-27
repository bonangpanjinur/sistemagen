import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Package, Truck, CheckSquare, MapPin, ClipboardList } from 'lucide-react';

const Logistics = () => {
    const { data, loading, fetchData, updateItem, createItem } = useCRUD('umh/v1/logistics');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => { fetchData(); }, [fetchData]);

    // Daftar Perlengkapan Standar
    const itemsList = [
        'Koper Bagasi 24"', 'Koper Kabin 20"', 'Tas Paspor', 'Kain Ihram (Pria)', 
        'Mukena (Wanita)', 'Bahan Batik', 'Buku Doa', 'Syal', 'ID Card'
    ];

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({
            ...item,
            // Parse JSON string jika ada, atau array kosong
            items_taken: typeof item.items_taken === 'string' && item.items_taken.startsWith('[') 
                ? JSON.parse(item.items_taken) 
                : (item.items_taken ? item.items_taken.split(',') : []),
            taken_date: item.taken_date || new Date().toISOString().split('T')[0],
            delivery_method: item.delivery_method || 'Diambil Sendiri',
            status: item.status || 'Sebagian'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Convert array items kembali ke JSON string untuk disimpan
        const payload = {
            ...formData,
            items_taken: JSON.stringify(formData.items_taken)
        };
        
        const success = editId 
            ? await updateItem(editId, payload) 
            : await createItem(payload);
            
        if (success) {
            setIsModalOpen(false);
            fetchData();
        }
    };

    const toggleItem = (item) => {
        const currentItems = formData.items_taken || [];
        if (currentItems.includes(item)) {
            setFormData({ ...formData, items_taken: currentItems.filter(i => i !== item) });
        } else {
            setFormData({ ...formData, items_taken: [...currentItems, item] });
        }
    };

    const columns = [
        { header: 'Nama Jemaah', accessor: 'full_name', className: 'font-bold' },
        { header: 'Paket', accessor: 'package_type' },
        { 
            header: 'Perlengkapan Diambil', 
            accessor: 'items_taken', 
            render: (row) => {
                let items = [];
                try {
                    items = Array.isArray(row.items_taken) ? row.items_taken : JSON.parse(row.items_taken || '[]');
                } catch (e) {
                    items = row.items_taken ? row.items_taken.split(',') : [];
                }
                return <span className="text-xs text-gray-600">{items.length > 0 ? items.join(', ') : '-'}</span>;
            }
        },
        { header: 'Metode', accessor: 'delivery_method', render: r => r.delivery_method || 'Diambil Sendiri' },
        { header: 'Tgl Ambil', accessor: 'taken_date' },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: (row) => (
                <span className={`text-xs px-2 py-1 rounded-full ${
                    row.status === 'Lengkap' ? 'bg-green-100 text-green-800' : 
                    row.status === 'Belum Diambil' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.status || 'Belum'}
                </span>
            ) 
        }
    ];

    return (
        <Layout title="Logistik & Perlengkapan">
             <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Distribusi Perlengkapan</h2>
                    <p className="text-sm text-gray-500">Pantau status pengambilan koper, seragam, dan atribut jemaah.</p>
                </div>
                {/* Tombol Tambah Manual jika diperlukan, biasanya data muncul otomatis dari Jemaah */}
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Status Logistik" size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Info Jemaah */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-100 mb-4">
                        <h4 className="font-bold text-blue-800">{formData.full_name || 'Nama Jemaah'}</h4>
                        <p className="text-sm text-blue-600">Paket: {formData.package_type} | Agen: {formData.sub_agent_name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kiri: Checklist Barang */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Package size={16} /> Checklist Barang
                            </label>
                            <div className="border rounded-lg p-3 h-60 overflow-y-auto bg-gray-50 space-y-2">
                                {itemsList.map(item => (
                                    <label key={item} className="flex items-center space-x-3 p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                            checked={(formData.items_taken || []).includes(item)}
                                            onChange={() => toggleItem(item)}
                                        />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Kanan: Info Pengambilan */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Pengambilan</label>
                                <input 
                                    type="date" 
                                    className="w-full border p-2 rounded"
                                    value={formData.taken_date}
                                    onChange={e => setFormData({...formData, taken_date: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                    <Truck size={16} /> Metode Penyerahan
                                </label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={formData.delivery_method}
                                    onChange={e => setFormData({...formData, delivery_method: e.target.value})}
                                >
                                    <option value="Diambil Sendiri">Diambil Sendiri ke Kantor</option>
                                    <option value="Dikirim Ekspedisi">Dikirim via Ekspedisi (JNE/J&T)</option>
                                    <option value="Diantar Kurir">Diantar Kurir / Staff</option>
                                    <option value="Diambil Agen">Diwakilkan Agen</option>
                                </select>
                            </div>

                            {/* Kondisional: Jika Dikirim/Diantar */}
                            {(formData.delivery_method === 'Dikirim Ekspedisi' || formData.delivery_method === 'Diantar Kurir') && (
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                        <MapPin size={16} /> Alamat Pengiriman
                                    </label>
                                    <textarea 
                                        className="w-full border p-2 rounded bg-yellow-50" 
                                        rows="3"
                                        placeholder="Alamat lengkap penerima..."
                                        value={formData.delivery_address}
                                        onChange={e => setFormData({...formData, delivery_address: e.target.value})}
                                    ></textarea>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Penerima / Pengambil</label>
                                <input 
                                    className="w-full border p-2 rounded"
                                    placeholder="Nama orang yang mengambil..."
                                    value={formData.taken_by}
                                    onChange={e => setFormData({...formData, taken_by: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Status Akhir</label>
                                <select 
                                    className="w-full border p-2 rounded font-medium"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="Belum Diambil">Belum Diambil</option>
                                    <option value="Sebagian">Sebagian (Belum Lengkap)</option>
                                    <option value="Lengkap">Lengkap (Sudah Semua)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <ClipboardList size={18} /> Simpan Data Logistik
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Logistics;
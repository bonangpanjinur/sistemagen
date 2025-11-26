import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Packages = () => {
    // 1. Definisi Kolom
    const columns = [
        { header: 'Nama Paket', accessor: 'package_name' },
        { header: 'Keberangkatan', accessor: 'departure_date' },
        { header: 'Durasi', accessor: 'duration', render: (row) => `${row.duration} Hari` },
        { 
            header: 'Kuota', 
            accessor: 'slots_available',
            render: (row) => (
                <span className={`${row.slots_available < 5 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {row.slots_filled} / {row.slots_available}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: (row) => (
                <span className={`px-2 py-1 text-xs rounded-full ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.status}
                </span>
            )
        },
    ];

    // 2. Setup State & Hook
    const { data, loading, error, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/packages');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        package_name: '',
        departure_date: '',
        duration: 9,
        slots_available: 45,
        status: 'draft'
    });

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 3. Handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ package_name: '', departure_date: '', duration: 9, slots_available: 45, status: 'draft' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Manajemen Paket Umroh">
            <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">Atur paket perjalanan umroh dan haji.</p>
                <button 
                    onClick={() => { setEditId(null); setIsModalOpen(true); }} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Buat Paket Baru
                </button>
            </div>

            {loading ? <Spinner /> : (
                <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Paket" : "Paket Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Paket</label>
                        <input className="w-full border p-2 rounded" value={formData.package_name} onChange={(e) => setFormData({...formData, package_name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Tanggal Berangkat</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.departure_date} onChange={(e) => setFormData({...formData, departure_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Durasi (Hari)</label>
                            <input type="number" className="w-full border p-2 rounded" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Kuota Kursi</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.slots_available} onChange={(e) => setFormData({...formData, slots_available: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Simpan</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Packages;
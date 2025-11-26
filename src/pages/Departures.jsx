import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Departures = () => {
    const columns = [
        { header: 'Paket', accessor: 'package_name' }, // API harus kirim nama paket
        { header: 'Tgl Berangkat', accessor: 'departure_date' },
        { header: 'Tgl Pulang', accessor: 'return_date' },
        { header: 'Kursi Tersedia', accessor: 'available_seats' },
        { header: 'Status', accessor: 'status' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/departures');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        package_id: '',
        flight_id: '', // Opsional
        departure_date: '',
        return_date: '',
        total_seats: 45,
        available_seats: 45,
        status: 'scheduled',
        notes: ''
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ package_id: '', flight_id: '', departure_date: '', return_date: '', total_seats: 45, available_seats: 45, status: 'scheduled', notes: '' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Jadwal Keberangkatan">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Kalender Keberangkatan</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Jadwal Baru</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Jadwal" : "Jadwal Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">ID Paket</label>
                        <input className="w-full border p-2 rounded" type="number" value={formData.package_id} onChange={e => setFormData({...formData, package_id: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Tanggal Berangkat</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tanggal Pulang</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.return_date} onChange={e => setFormData({...formData, return_date: e.target.value})} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Total Kursi</label>
                            <input type="number" className="w-full border p-2 rounded" value={formData.total_seats} onChange={e => setFormData({...formData, total_seats: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Sisa Kursi</label>
                            <input type="number" className="w-full border p-2 rounded" value={formData.available_seats} onChange={e => setFormData({...formData, available_seats: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Status</label>
                        <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="scheduled">Terjadwal</option>
                            <option value="delayed">Ditunda</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Jadwal</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Departures;
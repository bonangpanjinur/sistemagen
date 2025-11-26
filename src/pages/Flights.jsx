import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Flights = () => {
    const columns = [
        { header: 'Maskapai', accessor: 'airline' },
        { header: 'No. Penerbangan', accessor: 'flight_number' },
        { header: 'Rute', accessor: 'route', render: (row) => `${row.departure_airport_code} ➝ ${row.arrival_airport_code}` },
        { header: 'Waktu Berangkat', accessor: 'departure_time' },
        { header: 'Kursi', accessor: 'total_seats' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/flights');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        airline: '',
        flight_number: '',
        departure_airport_code: '',
        arrival_airport_code: '',
        departure_time: '',
        arrival_time: '',
        total_seats: 0,
        cost_per_seat: 0
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ airline: '', flight_number: '', departure_airport_code: '', arrival_airport_code: '', departure_time: '', arrival_time: '', total_seats: 0, cost_per_seat: 0 });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Data Penerbangan">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Master Penerbangan</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Penerbangan</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Penerbangan" : "Tambah Penerbangan"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Maskapai</label>
                        <input className="w-full border p-2 rounded" value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})} required placeholder="Contoh: Garuda Indonesia" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nomor Penerbangan</label>
                            <input className="w-full border p-2 rounded" value={formData.flight_number} onChange={e => setFormData({...formData, flight_number: e.target.value})} required placeholder="GA-981" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Total Kursi</label>
                            <input type="number" className="w-full border p-2 rounded" value={formData.total_seats} onChange={e => setFormData({...formData, total_seats: e.target.value})} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Kode Bandara Asal</label>
                            <input className="w-full border p-2 rounded" value={formData.departure_airport_code} onChange={e => setFormData({...formData, departure_airport_code: e.target.value})} maxLength="3" placeholder="CGK" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Kode Bandara Tujuan</label>
                            <input className="w-full border p-2 rounded" value={formData.arrival_airport_code} onChange={e => setFormData({...formData, arrival_airport_code: e.target.value})} maxLength="3" placeholder="JED" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Waktu Berangkat</label>
                            <input type="datetime-local" className="w-full border p-2 rounded" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Waktu Tiba</label>
                            <input type="datetime-local" className="w-full border p-2 rounded" value={formData.arrival_time} onChange={e => setFormData({...formData, arrival_time: e.target.value})} />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Biaya per Kursi</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.cost_per_seat} onChange={e => setFormData({...formData, cost_per_seat: e.target.value})} />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Data</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Flights;
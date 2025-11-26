import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Logistics = () => {
    const columns = [
        { header: 'Nama Jamaah', accessor: 'jamaah_name' }, // Pastikan API mengirim field ini (hasil join)
        { header: 'Status Paspor', accessor: 'passport_status' },
        { header: 'Koper', accessor: 'suitcase_status' },
        { header: 'Meningitis', accessor: 'meningitis_status' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/logistics');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        jamaah_id: '',
        passport_status: 'Belum',
        meningitis_status: 'Belum',
        suitcase_status: 'Belum',
        delivery_method: 'Ambil Sendiri',
        notes: ''
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ jamaah_id: '', passport_status: 'Belum', meningitis_status: 'Belum', suitcase_status: 'Belum', delivery_method: 'Ambil Sendiri', notes: '' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Logistik & Perlengkapan">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Status Perlengkapan Jamaah</h2>
                {/* Tombol tambah mungkin opsional jika data logistik otomatis dibuat saat jamaah daftar */}
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Update Logistik</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Status Logistik">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">ID Jamaah</label>
                        <input className="w-full border p-2 rounded" type="number" value={formData.jamaah_id} onChange={e => setFormData({...formData, jamaah_id: e.target.value})} required placeholder="Masukkan ID Jamaah" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Status Paspor</label>
                            <select className="w-full border p-2 rounded" value={formData.passport_status} onChange={e => setFormData({...formData, passport_status: e.target.value})}>
                                <option value="Belum">Belum Diserahkan</option>
                                <option value="Diterima">Diterima Kantor</option>
                                <option value="Proses Visa">Proses Visa</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Suntik Meningitis</label>
                            <select className="w-full border p-2 rounded" value={formData.meningitis_status} onChange={e => setFormData({...formData, meningitis_status: e.target.value})}>
                                <option value="Belum">Belum</option>
                                <option value="Sudah">Sudah</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Status Koper</label>
                            <select className="w-full border p-2 rounded" value={formData.suitcase_status} onChange={e => setFormData({...formData, suitcase_status: e.target.value})}>
                                <option value="Belum">Belum Diambil</option>
                                <option value="Sudah">Sudah Diambil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Metode Pengiriman</label>
                            <select className="w-full border p-2 rounded" value={formData.delivery_method} onChange={e => setFormData({...formData, delivery_method: e.target.value})}>
                                <option value="Ambil Sendiri">Ambil Sendiri</option>
                                <option value="Ekspedisi">Ekspedisi (JNE/TIKI)</option>
                                <option value="Gojek/Grab">Gojek/Grab</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Catatan</label>
                        <textarea className="w-full border p-2 rounded" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Data</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Logistics;
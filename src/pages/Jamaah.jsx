import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Jamaah = () => {
    // Definisi Kolom
    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name' },
        { header: 'No. Paspor', accessor: 'passport_number' },
        { header: 'Gender', accessor: 'gender' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 text-xs rounded ${row.status === 'registered' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                    {row.status}
                </span>
            )
        }
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/jamaah');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ full_name: '', passport_number: '', gender: 'L', status: 'pending' });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ full_name: '', passport_number: '', gender: 'L', status: 'pending' });
        }
    };

    return (
        <Layout title="Data Jamaah">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Jamaah</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-green-600 text-white px-4 py-2 rounded">+ Daftar Baru</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={(item) => { setFormData(item); setEditId(item.id); setIsModalOpen(true); }} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Jamaah" : "Registrasi Jamaah"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Nama Sesuai Paspor" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    <input className="w-full border p-2 rounded" placeholder="Nomor Paspor" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} />
                    <select className="w-full border p-2 rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                    <button className="w-full bg-green-600 text-white py-2 rounded">Simpan Data</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Jamaah;
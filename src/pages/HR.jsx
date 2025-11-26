import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const HR = () => {
    const columns = [
        { header: 'Nama Karyawan', accessor: 'full_name' }, // Join dari tabel users
        { header: 'Jabatan', accessor: 'position' },
        { header: 'Departemen', accessor: 'department' },
        { 
            header: 'Gaji Pokok', 
            accessor: 'salary',
            render: (row) => `Rp ${parseInt(row.salary || 0).toLocaleString('id-ID')}`
        },
        { header: 'Status', accessor: 'status' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/hr');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        position: '',
        department: '',
        salary: 0,
        join_date: '',
        status: 'active'
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ user_id: '', position: '', department: '', salary: 0, join_date: '', status: 'active' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Human Resources (HR)">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Data Karyawan</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Profil Karyawan</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Profil Karyawan">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">ID User System</label>
                        <input className="w-full border p-2 rounded" type="number" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} required placeholder="ID User Login" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <input className="w-full border p-2 rounded" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="Contoh: Staff Finance" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Departemen</label>
                            <input className="w-full border p-2 rounded" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Finance" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Gaji Pokok</label>
                            <input className="w-full border p-2 rounded" type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tanggal Bergabung</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.join_date} onChange={e => setFormData({...formData, join_date: e.target.value})} />
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Profil</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default HR;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Tasks = () => {
    const columns = [
        { header: 'Judul Tugas', accessor: 'title' },
        { header: 'Ditugaskan Ke', accessor: 'assigned_to_name' }, // Pastikan API join ke tabel users
        { header: 'Tenggat Waktu', accessor: 'due_date' },
        { 
            header: 'Prioritas', 
            accessor: 'priority',
            render: (row) => (
                <span className={`px-2 py-1 text-xs rounded uppercase font-bold 
                    ${row.priority === 'high' ? 'text-red-600' : row.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {row.priority}
                </span>
            )
        },
        { header: 'Status', accessor: 'status' },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/tasks');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to_user_id: '',
        due_date: '',
        priority: 'medium',
        status: 'pending'
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ title: '', description: '', assigned_to_user_id: '', due_date: '', priority: 'medium', status: 'pending' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Manajemen Tugas (To-Do)">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Tugas Tim</h2>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ Buat Tugas</button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Tugas" : "Tugas Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Judul Tugas</label>
                        <input className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Contoh: Follow up jamaah pending" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Deskripsi</label>
                        <textarea className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Ditugaskan Ke (ID User)</label>
                            <input type="number" className="w-full border p-2 rounded" value={formData.assigned_to_user_id} onChange={e => setFormData({...formData, assigned_to_user_id: e.target.value})} placeholder="ID User" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tenggat Waktu</label>
                            <input type="date" className="w-full border p-2 rounded" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Prioritas</label>
                            <select className="w-full border p-2 rounded" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="pending">Pending</option>
                                <option value="in_progress">Sedang Dikerjakan</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded">Simpan Tugas</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Tasks;
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { CheckSquare, Clock, Flag, User } from 'lucide-react';

const Tasks = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/tasks');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', assigned_to_user_id: '', due_date: '', priority: 'medium', status: 'pending'
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

    const columns = [
        { header: 'Tugas', accessor: 'title', className: 'font-bold text-gray-800', render: r => (
            <div>
                <div>{r.title}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">{r.description}</div>
            </div>
        )},
        { header: 'Prioritas', accessor: 'priority', render: r => {
            const colors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-blue-600 bg-blue-50' };
            return <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase w-fit ${colors[r.priority]}`}><Flag size={12}/> {r.priority}</span>
        }},
        { header: 'Deadline', accessor: 'due_date', render: r => <div className="flex items-center gap-1 text-gray-600 text-xs"><Clock size={14}/> {r.due_date || '-'}</div> },
        { header: 'Status', accessor: 'status', render: r => {
            const styles = { pending: 'bg-gray-200 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' };
            return <span className={`px-2 py-1 rounded text-xs ${styles[r.status]}`}>{r.status.replace('_', ' ')}</span>
        }}
    ];

    return (
        <Layout title="Manajemen Tugas Tim">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><CheckSquare size={20}/></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Tugas</p>
                        <p className="text-lg font-bold">{data?.length || 0}</p>
                    </div>
                </div>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <CheckSquare size={18} /> Buat Tugas Baru
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={(item)=>{setFormData(item); setEditId(item.id); setIsModalOpen(true)}} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Tugas" : "Tugas Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Judul Tugas</label><input className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Contoh: Follow up jamaah pending" /></div>
                    <div><label className="label">Deskripsi Detail</label><textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Ditugaskan Ke (ID User)</label><input type="number" className="input-field" value={formData.assigned_to_user_id} onChange={e => setFormData({...formData, assigned_to_user_id: e.target.value})} /></div>
                        <div><label className="label">Tenggat Waktu</label><input type="date" className="input-field" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Prioritas</label><select className="input-field" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi (Urgent)</option></select></div>
                        <div><label className="label">Status</label><select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="pending">Belum Dimulai</option><option value="in_progress">Sedang Dikerjakan</option><option value="completed">Selesai</option></select></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Tugas</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Tasks;
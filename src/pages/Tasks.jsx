import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { ClipboardDocumentCheckIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Tasks = () => {
    const [departures, setDepartures] = useState([]);
    const [selectedDep, setSelectedDep] = useState('');
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ task_name: '', category: 'document', due_date: '' });

    useEffect(() => {
        api.get('/umh/v1/bookings/departures').then(res => setDepartures(res.data));
    }, []);

    useEffect(() => {
        if (selectedDep) fetchTasks();
    }, [selectedDep]);

    const fetchTasks = async () => {
        const res = await api.get(`/umh/v1/tasks?departure_id=${selectedDep}`);
        setTasks(res.data);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        await api.post('/umh/v1/tasks', { ...newTask, departure_id: selectedDep });
        setNewTask({ task_name: '', category: 'document', due_date: '' });
        fetchTasks();
    };

    const handleToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        await api.post(`/umh/v1/tasks/toggle/${id}`, { status: newStatus });
        fetchTasks();
    };

    return (
        <Layout title="Manajemen Tugas Tim">
            <div className="bg-white p-6 rounded shadow">
                <div className="mb-6 w-full md:w-1/3">
                    <label className="font-bold text-sm">Pilih Keberangkatan</label>
                    <select className="w-full border p-2 rounded" onChange={(e) => setSelectedDep(e.target.value)} value={selectedDep}>
                        <option value="">-- Pilih --</option>
                        {departures.map(d => <option key={d.id} value={d.id}>{d.departure_date} - {d.package_name}</option>)}
                    </select>
                </div>

                {selectedDep && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* List Task */}
                        <div>
                            <h3 className="font-bold mb-4">Daftar Checklist</h3>
                            <div className="space-y-2">
                                {tasks.map(t => (
                                    <div key={t.id} className={`p-3 border rounded flex justify-between items-center ${t.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleToggle(t.id, t.status)} className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${t.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                                {t.status === 'completed' && <CheckCircleIcon className="h-4 w-4" />}
                                            </button>
                                            <div>
                                                <div className={`font-medium ${t.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{t.task_name}</div>
                                                <div className="text-xs text-gray-500 uppercase">{t.category} • Due: {t.due_date}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && <p className="text-gray-400 text-sm">Belum ada tugas.</p>}
                            </div>
                        </div>

                        {/* Add Form */}
                        <div className="bg-gray-50 p-4 rounded h-fit">
                            <h3 className="font-bold mb-3">Tambah Tugas Baru</h3>
                            <form onSubmit={handleAdd} className="space-y-3">
                                <input className="w-full border p-2 rounded" placeholder="Nama Tugas (e.g. Booking Bus)" value={newTask.task_name} onChange={e => setNewTask({...newTask, task_name: e.target.value})} required />
                                <select className="w-full border p-2 rounded" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}>
                                    <option value="document">Dokumen</option>
                                    <option value="logistics">Logistik</option>
                                    <option value="transport">Transport</option>
                                    <option value="finance">Keuangan</option>
                                </select>
                                <input type="date" className="w-full border p-2 rounded" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} required />
                                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">Simpan</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Tasks;
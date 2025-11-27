import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { UserPlus, MapPin, Phone, Calendar, CreditCard } from 'lucide-react';

const Agents = () => {
    const columns = [
        { header: 'ID Agen', accessor: 'agent_code', className: 'font-mono text-xs font-bold text-blue-600' },
        { header: 'Nama Agen', accessor: 'name', className: 'font-medium' },
        { header: 'Wilayah', accessor: 'area' },
        { header: 'No. HP', accessor: 'phone' },
        { header: 'Bergabung', accessor: 'join_date' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                </span>
            )
        },
    ];

    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const initialForm = {
        agent_code: '', // Akan di-generate backend jika kosong
        name: '',
        ktp_number: '',
        phone: '',
        area: '',
        join_date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'active'
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData(initialForm);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Data Sub Agen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Daftar Mitra & Agen</h2>
                    <p className="text-sm text-gray-500">Kelola data perwakilan dan sub-agen</p>
                </div>
                <button 
                    onClick={() => { setEditId(null); setFormData(initialForm); setIsModalOpen(true); }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition flex items-center gap-2"
                >
                    <UserPlus size={18} /> Tambah Agen
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Data Agen" : "Registrasi Agen Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4 text-sm text-blue-800">
                        <strong>Info:</strong> ID Agen akan dibuat otomatis (Format: 00X-AGBTN) jika dikosongkan.
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Agen (Opsional)</label>
                            <input 
                                className="w-full border p-2 rounded bg-gray-100 text-gray-500" 
                                value={formData.agent_code} 
                                onChange={e => setFormData({...formData, agent_code: e.target.value})} 
                                placeholder="Auto-Generate"
                                disabled={!editId}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tgl Bergabung</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    type="date"
                                    className="w-full border p-2 pl-10 rounded" 
                                    value={formData.join_date} 
                                    onChange={e => setFormData({...formData, join_date: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Lengkap (Sesuai KTP)</label>
                        <input 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. KTP (NIK)</label>
                            <div className="relative">
                                <CreditCard size={16} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    className="w-full border p-2 pl-10 rounded" 
                                    value={formData.ktp_number} 
                                    onChange={e => setFormData({...formData, ktp_number: e.target.value})} 
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. HP / WA</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    className="w-full border p-2 pl-10 rounded" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="08..."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wilayah / Alamat</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                className="w-full border p-2 pl-10 rounded" 
                                value={formData.area} 
                                onChange={e => setFormData({...formData, area: e.target.value})} 
                                placeholder="Cth: Cilegon, Serang"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catatan (Notes)</label>
                        <textarea 
                            className="w-full border p-2 rounded" 
                            rows="2"
                            value={formData.notes} 
                            onChange={e => setFormData({...formData, notes: e.target.value})} 
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t flex justify-end space-x-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-medium"
                        >
                            Simpan Data
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Agents;
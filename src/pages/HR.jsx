import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, UserCheck, User, Trash2, Edit } from 'lucide-react'; // Tambahkan icon jika perlu
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import toast from 'react-hot-toast'; // [NEW] Import Toast

const HR = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('hr');
    
    // Ambil data users WP untuk relasi
    const [wpUsers, setWpUsers] = useState([]);
    
    useEffect(() => {
        const fetchWpUsers = async () => {
            try {
                // Asumsi endpoint users tersedia di API WP
                const res = await api.get('users');
                setWpUsers(res);
            } catch(e) { 
                console.error("Gagal memuat user WP:", e);
                // toast.error("Gagal memuat daftar user sistem"); // Opsional
            }
        };
        fetchWpUsers();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { name: '', position: '', phone: '', salary: 0, user_id: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // [UX] Tambahkan notifikasi toast
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
            
        if (success) {
            setIsModalOpen(false);
            toast.success(modalMode === 'create' ? 'Karyawan berhasil ditambahkan!' : 'Data karyawan diperbarui!');
        } else {
            toast.error('Gagal menyimpan data karyawan.');
        }
    };

    // [UX] Wrapper untuk delete dengan konfirmasi & notifikasi
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data karyawan ini?')) {
            const success = await deleteItem(id);
            if (success) toast.success('Data karyawan dihapus.');
            else toast.error('Gagal menghapus data.');
        }
    };

    const columns = [
        { header: 'Nama Karyawan', accessor: 'name', sortable: true },
        { header: 'Posisi', accessor: 'position' },
        { header: 'Kontak', accessor: 'phone' },
        { 
            header: 'Gaji Pokok', 
            accessor: 'salary',
            render: (row) => formatCurrency(row.salary)
        },
        {
            header: 'Akun Sistem',
            accessor: 'user_id',
            render: (row) => row.user_id ? (
                <span className="text-green-600 flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded border border-green-200 font-medium">
                    <UserCheck size={12}/> Terhubung
                </span>
            ) : (
                <span className="text-gray-400 text-xs italic">Belum ada akun</span>
            )
        }
    ];

    return (
        <Layout title="Human Resources (HR)">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => handleOpenModal('create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors"
                >
                    <Plus size={18} /> Tambah Karyawan
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={handleDelete} // Gunakan handler baru
                userCapabilities={user?.role}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Data Karyawan' : 'Edit Karyawan'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required
                            placeholder="Contoh: Budi Santoso"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posisi / Jabatan</label>
                            <input 
                                type="text" 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.position || ''} 
                                onChange={e => setFormData({...formData, position: e.target.value})}
                                placeholder="Staff Admin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                            <input 
                                type="text" 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.phone || ''} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="0812..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gaji Pokok</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                            <input 
                                type="number" 
                                className="w-full border rounded p-2 pl-8 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.salary || 0} 
                                onChange={e => setFormData({...formData, salary: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <User size={16}/> Tautkan dengan Akun Pengguna (Login)
                        </label>
                        <select 
                            className="w-full border rounded p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                            value={formData.user_id || ''}
                            onChange={e => setFormData({...formData, user_id: e.target.value})}
                        >
                            <option value="">-- Tidak Ada Akun Login --</option>
                            {wpUsers && wpUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                            ))}
                        </select>
                        <p className="text-xs text-blue-600 mt-1">
                            *Jika dipilih, karyawan ini bisa login ke sistem menggunakan akun tersebut. Namanya juga akan muncul otomatis di fitur Tugas & Marketing.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">
                            {modalMode === 'create' ? 'Simpan Data' : 'Update Data'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default HR;
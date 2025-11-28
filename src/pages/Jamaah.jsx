import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, User, FileText, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Jamaah = () => {
    const { user } = useData();
    // Fetch data packages & agents untuk dropdown
    const { data: packages } = useCRUD('packages');
    const { data: agents } = useCRUD('agents');
    
    // Fetch data jamaah (yang sekarang sudah include info pembayaran dari API baru)
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('jamaah');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { 
            full_name: '', 
            nik: '', 
            phone: '', 
            package_id: '',
            package_price: 0, // Harga deal bisa beda dari harga paket asli
            status: 'registered'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    // Saat paket dipilih, otomatis isi harga default
    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const selectedPkg = packages.find(p => String(p.id) === String(pkgId));
        setFormData(prev => ({
            ...prev,
            package_id: pkgId,
            package_price: selectedPkg ? selectedPkg.price : 0
        }));
    };

    const columns = [
        { header: 'Nama Lengkap', accessor: 'full_name', sortable: true },
        { header: 'Paket', accessor: 'package_name' },
        { 
            header: 'Harga Paket', 
            accessor: 'package_price',
            render: (row) => formatCurrency(row.package_price)
        },
        {
            header: 'Sudah Bayar',
            accessor: 'total_paid',
            render: (row) => (
                <span className="text-green-600 font-medium">
                    {formatCurrency(row.total_paid)}
                </span>
            )
        },
        {
            header: 'Status Bayar',
            accessor: 'payment_status_label',
            render: (row) => {
                let color = 'bg-gray-100 text-gray-600';
                if (row.payment_status_label === 'Lunas') color = 'bg-green-100 text-green-700';
                if (row.payment_status_label === 'Dicicil') color = 'bg-yellow-100 text-yellow-700';
                if (row.payment_status_label === 'Belum Bayar') color = 'bg-red-100 text-red-700';
                
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
                        {row.payment_status_label}
                    </span>
                );
            }
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs capitalize ${row.status === 'berangkat' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <Layout title="Manajemen Jemaah">
            <div className="flex justify-between mb-4">
                <div className="text-sm text-gray-500 pt-2">
                    Total Jemaah: <b>{data.length}</b>
                </div>
                <button 
                    onClick={() => handleOpenModal('create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={18} /> Tambah Jemaah
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
                userCapabilities={user?.role}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Tambah Jemaah Baru' : 'Edit Data Jemaah'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap (Sesuai Paspor)</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            value={formData.full_name || ''}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIK / No. KTP</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                value={formData.nik || ''}
                                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <CreditCard size={14}/> Detail Paket & Harga
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Paket</label>
                                <select 
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                                    value={formData.package_id || ''}
                                    onChange={handlePackageChange}
                                >
                                    <option value="">-- Pilih Paket Umrah/Haji --</option>
                                    {packages && packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Harga Deal (Rp) <span className="text-xs text-gray-500 font-normal">*Bisa diedit jika ada diskon</span>
                                </label>
                                <input 
                                    type="number" 
                                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border font-bold"
                                    value={formData.package_price || 0}
                                    onChange={(e) => setFormData({...formData, package_price: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status Keberangkatan</label>
                        <select 
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                            value={formData.status || 'registered'}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="registered">Terdaftar (Registered)</option>
                            <option value="documents_collected">Dokumen Lengkap</option>
                            <option value="visa_issued">Visa Terbit</option>
                            <option value="ready">Siap Berangkat</option>
                            <option value="completed">Selesai/Pulang</option>
                            <option value="cancelled">Batal</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Jamaah;
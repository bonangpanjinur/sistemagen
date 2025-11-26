import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const Agents = () => {
    // ---- Konfigurasi Kolom Tabel ----
    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nama Agen', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'No. HP', accessor: 'phone' },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: (item) => (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
            )
        },
    ];

    // ---- State Form & Modal ----
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // State awal form agar mudah di-reset
    const initialFormState = { 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        status: 'active' 
    };
    const [formData, setFormData] = useState(initialFormState);

    // ---- Integrasi Hook CRUD ----
    // Pastikan endpoint 'umh/v1/agents' sesuai dengan route API PHP Anda
    const { 
        data, 
        loading, 
        error, 
        fetchData, 
        createItem, 
        updateItem, 
        deleteItem 
    } = useCRUD('umh/v1/agents');

    // Load data saat halaman dibuka
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ---- Handlers ----
    
    const handleOpenCreate = () => {
        setFormData(initialFormState);
        setEditId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData(item); // Isi form dengan data yang dipilih
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus agen ini?')) {
            await deleteItem(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let success = false;
        if (editId) {
            success = await updateItem(editId, formData);
        } else {
            success = await createItem(formData);
        }

        if (success) {
            setIsModalOpen(false);
            setFormData(initialFormState); // Reset form
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ---- Render UI ----
    return (
        <Layout title="Manajemen Agen Travel">
            
            {/* Header Konten & Tombol Tambah */}
            <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Daftar Agen</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola mitra agen, edit informasi kontak, dan pantau status keaktifan.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button 
                        onClick={handleOpenCreate}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Tambah Agen Baru
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabel Data / Loading Spinner */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner />
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <CrudTable 
                        columns={columns} 
                        data={data} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                    {data.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500">
                            Belum ada data agen. Silakan tambah baru.
                        </div>
                    )}
                </div>
            )}

            {/* Modal Form */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editId ? "Edit Data Agen" : "Tambah Agen Baru"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input Nama */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Contoh: PT. Berkah Mulia"
                        />
                    </div>
                    
                    {/* Grid Email & HP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input 
                                type="email" 
                                name="email"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. HP / WA <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="phone"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Alamat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                        <textarea 
                            name="address"
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.address}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status Keagenan</label>
                        <select 
                            name="status"
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif / Suspend</option>
                        </select>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end pt-4 space-x-3 border-t mt-4">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Simpan Data')}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Agents;
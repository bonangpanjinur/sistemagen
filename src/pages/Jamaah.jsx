import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, User, FileText, Printer, Package, Upload } from 'lucide-react';

const Jamaah = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/jamaah');
    // Fetch packages untuk dropdown relasi
    const { data: packages } = useCRUD('umh/v1/packages');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // FITUR 8: Relasi Paket & Harga
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [roomType, setRoomType] = useState('quad'); // quad, triple, double

    // Effect: Update harga saat paket atau tipe kamar berubah
    useEffect(() => {
        if (selectedPackage) {
            let price = 0;
            // Simulasi struktur data paket yang punya varian harga
            const basePrice = parseInt(selectedPackage.price) || 25000000;
            
            if (roomType === 'quad') price = basePrice;
            if (roomType === 'triple') price = basePrice + 1000000; // +1 Jt
            if (roomType === 'double') price = basePrice + 2500000; // +2.5 Jt
            
            setFormData(prev => ({ ...prev, package_price: price }));
        }
    }, [selectedPackage, roomType]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        if (item) {
            setFormData(item);
            // Set existing package selection logic here if needed
        } else {
            setFormData({ status: 'registered', documents: {} });
        }
        setIsModalOpen(true);
    };

    const handlePackageSelect = (e) => {
        const pkgId = e.target.value;
        const pkg = packages.find(p => p.id == pkgId);
        setFormData(prev => ({ ...prev, package_id: pkgId }));
        setSelectedPackage(pkg);
    };
    
    // Handler untuk perubahan file (Simulasi)
    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            // Di sini nanti logika upload ke server atau convert base64
            console.log(`File selected for ${fieldName}:`, file.name);
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [fieldName]: file.name // Simpan nama file sementara
                }
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'No. Porsi / ID', accessor: 'registration_number' },
        { header: 'Nama Lengkap', accessor: 'full_name', sortable: true },
        { header: 'Paket', accessor: 'package_name' },
        { header: 'Tipe Kamar', accessor: 'room_type', render: (row) => row.room_type?.toUpperCase() || '-' },
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded text-xs ${row.status === 'departed' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {row.status}
            </span>
        )},
        { header: 'Dokumen', accessor: 'documents', render: (row) => {
            const docs = row.documents || {};
            const count = Object.keys(docs).length;
            return <span className="text-xs text-gray-500">{count} Uploaded</span>;
        }}
    ];

    return (
        <Layout title="Data Jamaah">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Daftar Jamaah Baru
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={deleteItem}
                userCapabilities={user?.role}
                editCapability="manage_options"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Formulir Jamaah">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* INFO PRIBADI */}
                    <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
                            <User size={16}/> Data Pribadi & Dokumen
                        </h4>
                        
                        <div className="space-y-4">
                            {/* Baris 1: Nama & Telepon */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Nama Lengkap</label>
                                    <input type="text" className="w-full border rounded p-2 text-sm" 
                                        value={formData.full_name || ''} 
                                        onChange={e => setFormData({...formData, full_name: e.target.value})} 
                                        placeholder="Sesuai KTP" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Telepon / WhatsApp</label>
                                    <input type="text" className="w-full border rounded p-2 text-sm" 
                                        value={formData.phone || ''} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                        placeholder="08xxxxxxxxxx" />
                                </div>
                            </div>

                            {/* Baris 2: NIK & Upload KTP */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">No. KTP / NIK</label>
                                    <input type="text" className="w-full border rounded p-1 text-sm mb-2" 
                                        value={formData.nik || ''} 
                                        onChange={e => setFormData({...formData, nik: e.target.value})} 
                                        placeholder="16 Digit NIK" />
                                    
                                    <div className="flex items-center gap-2 pt-2 border-t border-dashed border-gray-300">
                                        <div className="text-[10px] text-gray-500 whitespace-nowrap">Upload Scan KTP:</div>
                                        <input type="file" className="text-[10px] w-full text-slate-500 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                            onChange={(e) => handleFileChange(e, 'scan_ktp')}
                                        />
                                    </div>
                                </div>

                                {/* Baris 2: Paspor & Upload Paspor */}
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">No. Paspor</label>
                                    <input type="text" className="w-full border rounded p-1 text-sm mb-2" 
                                        value={formData.passport_number || ''} 
                                        onChange={e => setFormData({...formData, passport_number: e.target.value})} 
                                        placeholder="Nomor Paspor" />
                                    
                                    <div className="flex items-center gap-2 pt-2 border-t border-dashed border-gray-300">
                                        <div className="text-[10px] text-gray-500 whitespace-nowrap">Upload Paspor:</div>
                                        <input type="file" className="text-[10px] w-full text-slate-500 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                            onChange={(e) => handleFileChange(e, 'scan_passport')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RELASI PAKET & HARGA */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <h4 className="font-bold text-sm text-blue-800 mb-3 flex items-center gap-2 border-b border-blue-200 pb-2">
                            <Package size={16}/> Paket & Kamar
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Pilih Paket Umroh</label>
                                <select className="w-full border rounded p-2 text-sm" onChange={handlePackageSelect} value={formData.package_id || ''}>
                                    <option value="">-- Pilih Paket --</option>
                                    {packages && packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Start: {parseInt(p.price).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">Tipe Kamar</label>
                                    <select 
                                        className="w-full border rounded p-2 text-sm" 
                                        value={roomType} 
                                        onChange={(e) => { setRoomType(e.target.value); setFormData({...formData, room_type: e.target.value}); }}
                                    >
                                        <option value="quad">Quad (Sekamar Ber-4)</option>
                                        <option value="triple">Triple (Sekamar Ber-3)</option>
                                        <option value="double">Double (Sekamar Ber-2)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">Harga Paket Final</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 text-sm">Rp</span>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded p-2 pl-8 bg-gray-100 font-bold text-gray-800" 
                                            value={formData.package_price ? formData.package_price.toLocaleString() : 0} 
                                            readOnly 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* UPLOAD LAINNYA */}
                    <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
                            <FileText size={16}/> Dokumen Pendukung Lainnya
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                <span className="text-xs font-medium">Foto Resmi (Background Putih)</span>
                                <input type="file" className="text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100" 
                                    onChange={(e) => handleFileChange(e, 'photo_official')} />
                            </div>
                            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                <span className="text-xs font-medium">Kartu Keluarga (KK)</span>
                                <input type="file" className="text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100" 
                                    onChange={(e) => handleFileChange(e, 'scan_kk')} />
                            </div>
                            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                <span className="text-xs font-medium">Buku Nikah / Akta Lahir</span>
                                <input type="file" className="text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100" 
                                    onChange={(e) => handleFileChange(e, 'scan_marriage_birth_cert')} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 font-medium">Simpan Pendaftaran</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Jamaah;
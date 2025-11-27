import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Direct API
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { User, FileText, Briefcase, Users, Search, AlertCircle } from 'lucide-react';

const Jamaah = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/jamaah');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [activeTab, setActiveTab] = useState('pribadi');
    const [validationError, setValidationError] = useState(null);

    // Dynamic Data Lists
    const [packagesList, setPackagesList] = useState([]);
    const [agentsList, setAgentsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Untuk filter agen

    useEffect(() => {
        fetchData();
        // Load Packages & Agents untuk Dropdown
        const loadDropdowns = async () => {
            try {
                const [p, a] = await Promise.all([
                    api.get('umh/v1/packages'),
                    api.get('umh/v1/agents')
                ]);
                setPackagesList(p.data || []);
                setAgentsList(a.data || []);
            } catch (e) {
                console.error("Gagal load dropdown", e);
            }
        };
        loadDropdowns();
    }, [fetchData]);

    // Filter Agen berdasarkan pencarian
    const filteredAgents = agentsList.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.agent_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const initialForm = {
        registration_code: '', full_name: '', gender: 'L', birth_place: '', birth_date: '',
        marital_status: 'Menikah', occupation: '',
        ktp_number: '', passport_number: '', passport_name: '', passport_issued_date: '', passport_expiry_date: '', passport_issued_office: '',
        address: '', phone_number: '', city: '',
        father_name: '', mother_name: '', heir_name: '', heir_relation: '',
        package_id: '', package_type: '', // ID dan Nama
        sub_agent_id: '', sub_agent_name: '', // ID dan Nama
        room_type: 'Quad', departure_date: '', clothing_size: 'L', status: 'active', notes: ''
    };
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError(null);
        
        // Validasi Identitas
        if (!formData.ktp_number && !formData.passport_number) {
            setValidationError("Wajib isi salah satu: NIK (KTP) atau Nomor Paspor."); 
            setActiveTab('dokumen'); 
            return;
        }

        // Validasi Paket
        if (!formData.package_id) {
            setValidationError("Wajib memilih Paket Umroh.");
            setActiveTab('paket');
            return;
        }

        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) { setIsModalOpen(false); setFormData(initialForm); }
    };

    const handleEdit = (item) => {
        setFormData(item); 
        setEditId(item.id); 
        // Set nama agen di search bar agar terlihat
        setSearchTerm(item.sub_agent_name || '');
        setIsModalOpen(true); 
        setActiveTab('pribadi');
    };

    // Handle pemilihan Paket (Auto fill detail)
    const handlePackageSelect = (e) => {
        const pkgId = e.target.value;
        if (!pkgId) {
            setFormData({ ...formData, package_id: '', package_type: '', departure_date: '' });
            return;
        }

        const pkg = packagesList.find(p => p.id == pkgId);
        
        // Cari tanggal keberangkatan pertama dari paket (jika ada array dates)
        let defaultDate = '';
        if (pkg && pkg.dates && Array.isArray(pkg.dates) && pkg.dates.length > 0) {
            defaultDate = pkg.dates[0].date; // Ambil tanggal pertama
        } else if (pkg && pkg.departure_date) {
            defaultDate = pkg.departure_date; // Fallback ke tanggal single
        }

        setFormData({
            ...formData,
            package_id: pkgId,
            package_type: pkg ? pkg.package_name : '',
            departure_date: defaultDate // Auto-set tanggal
        });
    };

    // Handle pemilihan Agen
    const handleAgentSelect = (agent) => {
        setFormData({
            ...formData,
            sub_agent_id: agent.id,
            sub_agent_name: agent.name
        });
        setSearchTerm(agent.name); // Set text input tampilan
    };

    const columns = [
        { header: 'Kode', accessor: 'registration_code', className: 'font-mono text-xs font-bold text-blue-600' },
        { header: 'Nama Lengkap', accessor: 'full_name' },
        { header: 'Paket', accessor: 'package_type' },
        { header: 'Tgl Berangkat', accessor: 'departure_date' },
        { header: 'Agen', accessor: 'sub_agent_name' },
        { header: 'Status', accessor: 'status', render: r => <span className={`px-2 py-1 rounded text-xs ${r.status==='active'?'bg-green-100 text-green-800':'bg-gray-100'}`}>{r.status}</span> }
    ];

    return (
        <Layout title="Data Jemaah">
            <div className="flex justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold">Manajemen Jemaah</h2>
                    <p className="text-sm text-gray-500">Registrasi dan kelola data jemaah umroh.</p>
                </div>
                <button onClick={() => { setEditId(null); setFormData(initialForm); setSearchTerm(''); setIsModalOpen(true); setValidationError(null); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                    <User size={18} /> Registrasi Jemaah
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} onEdit={handleEdit} onDelete={deleteItem} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Data Jemaah" : "Registrasi Jemaah Baru"} size="max-w-5xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {validationError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
                            <AlertCircle className="text-red-500 mr-2" size={20}/>
                            <span className="text-red-700 text-sm">{validationError}</span>
                        </div>
                    )}
                    
                    <div className="flex border-b space-x-2 overflow-x-auto">
                        {['pribadi', 'dokumen', 'paket', 'keluarga'].map(t => (
                            <button key={t} type="button" onClick={() => setActiveTab(t)} className={`px-4 py-2 capitalize border-b-2 whitespace-nowrap ${activeTab === t ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}>{t}</button>
                        ))}
                    </div>

                    {/* TAB PRIBADI */}
                    {activeTab === 'pribadi' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Kode Registrasi</label><input className="w-full border p-2 rounded bg-gray-50" value={formData.registration_code} onChange={e => setFormData({...formData, registration_code: e.target.value})} placeholder="Auto / Manual JMH..." /></div>
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap (Sesuai KTP)</label><input className="w-full border p-2 rounded focus:ring-blue-500" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required /></div>
                            
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Jenis Kelamin</label><select className="w-full border p-2 rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tempat Lahir</label><input className="w-full border p-2 rounded" value={formData.birth_place} onChange={e => setFormData({...formData, birth_place: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tanggal Lahir</label><input type="date" className="w-full border p-2 rounded" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} /></div>
                            
                            <div><label className="text-xs font-bold text-gray-500 uppercase">No HP (WA)</label><input className="w-full border p-2 rounded" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label><input className="w-full border p-2 rounded" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Status Nikah</label><select className="w-full border p-2 rounded" value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value})}><option value="Menikah">Menikah</option><option value="Belum Menikah">Belum Menikah</option><option value="Janda">Janda</option><option value="Duda">Duda</option></select></div>
                            
                            <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500 uppercase">Alamat Lengkap</label><textarea className="w-full border p-2 rounded" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                        </div>
                    )}

                    {/* TAB DOKUMEN */}
                    {activeTab === 'dokumen' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                            <div className="md:col-span-2 bg-blue-50 p-3 rounded border border-blue-200 text-sm text-blue-800 mb-2">
                                <strong>Penting:</strong> Wajib mengisi NIK atau Nomor Paspor sebagai identitas unik jemaah.
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">NIK (KTP)</label><input className="w-full border p-2 rounded" value={formData.ktp_number} onChange={e => setFormData({...formData, ktp_number: e.target.value})} placeholder="16 digit NIK" /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">No. KK</label><input className="w-full border p-2 rounded" value={formData.kk_number} onChange={e => setFormData({...formData, kk_number: e.target.value})} /></div>
                            
                            <div className="md:col-span-2 border-t pt-4 mt-2"><h4 className="font-bold text-gray-700">Data Paspor</h4></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">No. Paspor</label><input className="w-full border p-2 rounded bg-green-50" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} placeholder="X7..." /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nama di Paspor</label><input className="w-full border p-2 rounded" value={formData.passport_name} onChange={e => setFormData({...formData, passport_name: e.target.value})} placeholder="Samakan dengan buku paspor" /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tgl Dikeluarkan</label><input type="date" className="w-full border p-2 rounded" value={formData.passport_issued_date} onChange={e => setFormData({...formData, passport_issued_date: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tgl Habis Berlaku</label><input type="date" className="w-full border p-2 rounded" value={formData.passport_expiry_date} onChange={e => setFormData({...formData, passport_expiry_date: e.target.value})} /></div>
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Kantor Imigrasi</label><input className="w-full border p-2 rounded" value={formData.passport_issued_office} onChange={e => setFormData({...formData, passport_issued_office: e.target.value})} placeholder="Cth: Kanim Kelas 1 Jakarta Selatan" /></div>
                        </div>
                    )}

                    {/* TAB PAKET (DINAMIS) */}
                    {activeTab === 'paket' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                            {/* Dropdown Paket */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Pilih Paket Umroh</label>
                                <select className="w-full border p-2 rounded bg-white focus:ring-blue-500" value={formData.package_id} onChange={handlePackageSelect}>
                                    <option value="">-- Pilih Paket yang Tersedia --</option>
                                    {packagesList.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.package_name} (Sisa Kuota: {pkg.dates && pkg.dates[0] ? pkg.dates[0].quota : '45'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Searchable Agen */}
                            <div className="md:col-span-2 relative">
                                <label className="text-xs font-bold text-gray-500 uppercase">Referensi Agen (Cari Nama)</label>
                                <input 
                                    className="w-full border p-2 rounded" 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Ketik nama agen untuk mencari..." 
                                />
                                {searchTerm && searchTerm !== formData.sub_agent_name && (
                                    <div className="absolute z-10 bg-white border shadow-lg w-full max-h-40 overflow-y-auto rounded mt-1">
                                        {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                                            <div key={agent.id} onClick={() => handleAgentSelect(agent)} className="p-2 hover:bg-blue-50 cursor-pointer border-b text-sm">
                                                <strong>{agent.name}</strong> <span className="text-gray-500 text-xs">({agent.agent_code}) - {agent.area}</span>
                                            </div>
                                        )) : (
                                            <div className="p-2 text-gray-500 text-sm italic">Agen tidak ditemukan.</div>
                                        )}
                                    </div>
                                )}
                                <input type="hidden" value={formData.sub_agent_id} /> {/* Simpan ID Agen tersembunyi */}
                            </div>

                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tipe Kamar</label><select className="w-full border p-2 rounded" value={formData.room_type} onChange={e => setFormData({...formData, room_type: e.target.value})}><option value="Quad">Quad (Sekamar Berempat)</option><option value="Triple">Triple (Sekamar Bertiga)</option><option value="Double">Double (Sekamar Berdua)</option></select></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tgl Keberangkatan</label><input type="date" className="w-full border p-2 rounded" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Ukuran Perlengkapan</label><select className="w-full border p-2 rounded" value={formData.clothing_size} onChange={e => setFormData({...formData, clothing_size: e.target.value})}><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option></select></div>
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Catatan Khusus</label><textarea className="w-full border p-2 rounded bg-yellow-50" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Riwayat penyakit, permintaan khusus, dll." /></div>
                        </div>
                    )}

                    {/* TAB KELUARGA */}
                    {activeTab === 'keluarga' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nama Ayah Kandung</label><input className="w-full border p-2 rounded" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} placeholder="Penting untuk mahram wanita" /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nama Ibu Kandung</label><input className="w-full border p-2 rounded" value={formData.mother_name} onChange={e => setFormData({...formData, mother_name: e.target.value})} /></div>
                            <div className="md:col-span-2 border-t pt-4 mt-2"><h4 className="font-bold text-gray-700">Ahli Waris / Kontak Darurat</h4></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nama Ahli Waris</label><input className="w-full border p-2 rounded" value={formData.heir_name} onChange={e => setFormData({...formData, heir_name: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Hubungan</label><input className="w-full border p-2 rounded" value={formData.heir_relation} onChange={e => setFormData({...formData, heir_relation: e.target.value})} placeholder="Istri / Anak / Saudara" /></div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t bg-gray-50 p-4 rounded-b-lg -mx-6 -mb-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium transition">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-medium">Simpan Data Jemaah</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Jamaah;
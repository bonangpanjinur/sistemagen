import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Megaphone, Users, Phone, Instagram, Facebook, Globe, MessageCircle, DollarSign, Calendar } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';

const Marketing = () => {
    const { user } = useData();
    const [activeTab, setActiveTab] = useState('leads'); // Default ke Leads karena lebih sering dipakai

    // --- LOGIKA LEADS (CALON JEMAAH) ---
    const [leads, setLeads] = useState([]);
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [leadForm, setLeadForm] = useState({});
    const [leadMode, setLeadMode] = useState('create');

    const fetchLeads = async () => {
        setLoadingLeads(true);
        try {
            const res = await api.get('leads');
            setLeads(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLeads(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'leads') fetchLeads();
    }, [activeTab]);

    const handleSaveLead = async (e) => {
        e.preventDefault();
        try {
            if (leadMode === 'create') {
                await api.post('leads', leadForm);
                toast.success('Calon Jemaah berhasil ditambahkan');
            } else {
                await api.put(`leads/${leadForm.id}`, leadForm);
                toast.success('Data diperbarui');
            }
            setIsLeadModalOpen(false);
            fetchLeads();
        } catch (err) {
            toast.error('Gagal menyimpan data');
        }
    };

    const handleDeleteLead = async (id) => {
        if(!confirm('Hapus data prospek ini?')) return;
        try {
            await api.delete(`leads/${id}`);
            toast.success('Dihapus');
            fetchLeads();
        } catch (err) {
            toast.error('Gagal menghapus');
        }
    }

    const leadColumns = [
        { header: 'Nama Calon', accessor: 'name', sortable: true },
        { 
            header: 'Kontak', 
            accessor: 'phone',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm">{row.phone}</span>
                    <a href={`https://wa.me/${row.phone.replace(/^0/, '62')}`} target="_blank" className="text-green-500 hover:text-green-700" title="Chat WhatsApp">
                        <MessageCircle size={16}/>
                    </a>
                </div>
            )
        },
        { 
            header: 'Sumber', 
            accessor: 'source',
            render: (row) => {
                const icons = {
                    'ig': <Instagram size={14} className="text-pink-600"/>,
                    'fb': <Facebook size={14} className="text-blue-600"/>,
                    'wa': <MessageCircle size={14} className="text-green-600"/>,
                    'walk_in': <Users size={14} className="text-gray-600"/>
                };
                return <div className="flex items-center gap-1 uppercase text-xs font-bold">{icons[row.source] || <Globe size={14}/>} {row.source}</div>
            }
        },
        { 
            header: 'Status Follow Up', 
            accessor: 'status',
            render: (row) => {
                const colors = {
                    'new': 'bg-blue-100 text-blue-700',
                    'contacting': 'bg-yellow-100 text-yellow-700',
                    'interested': 'bg-purple-100 text-purple-700',
                    'closing': 'bg-green-100 text-green-700',
                    'lost': 'bg-red-100 text-red-700'
                };
                return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[row.status] || 'bg-gray-100'}`}>{row.status}</span>
            }
        },
        { header: 'Catatan', accessor: 'notes' }
    ];

    // --- LOGIKA CAMPAIGNS (KAMPANYE IKLAN) ---
    const { data: campaigns, loading: loadingCamp, createItem, updateItem, deleteItem } = useCRUD('marketing');
    const [isCampModalOpen, setIsCampModalOpen] = useState(false);
    const [campForm, setCampForm] = useState({});
    const [campMode, setCampMode] = useState('create');

    const handleSaveCampaign = async (e) => {
        e.preventDefault();
        const success = campMode === 'create' 
            ? await createItem(campForm) 
            : await updateItem(campForm.id, campForm);
        
        if (success) {
            setIsCampModalOpen(false);
            toast.success(campMode === 'create' ? 'Kampanye dibuat' : 'Kampanye diperbarui');
        }
    };

    const campaignColumns = [
        { header: 'Nama Kampanye', accessor: 'title', sortable: true },
        { 
            header: 'Platform', 
            accessor: 'platform',
            render: (row) => (
                <span className="uppercase font-bold text-xs bg-gray-100 px-2 py-1 rounded">{row.platform}</span>
            )
        },
        { 
            header: 'Budget', 
            accessor: 'budget',
            render: (row) => formatCurrency(row.budget)
        },
        { 
            header: 'Periode', 
            accessor: 'start_date',
            render: (row) => (
                <div className="text-xs text-gray-600">
                    <div>Mulai: {formatDate(row.start_date)}</div>
                    <div>Selesai: {formatDate(row.end_date)}</div>
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <Layout title="Marketing & Sales">
            
            {/* TAB NAVIGATION */}
            <div className="flex gap-4 mb-6 border-b">
                <button 
                    onClick={() => setActiveTab('leads')}
                    className={`pb-2 px-4 font-medium flex items-center gap-2 ${activeTab === 'leads' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users size={18}/> Database Calon Jemaah (Leads)
                </button>
                <button 
                    onClick={() => setActiveTab('campaigns')}
                    className={`pb-2 px-4 font-medium flex items-center gap-2 ${activeTab === 'campaigns' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Megaphone size={18}/> Kampanye Iklan
                </button>
            </div>

            {/* KONTEN TAB LEADS */}
            {activeTab === 'leads' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => { setLeadForm({source: 'ig', status: 'new'}); setLeadMode('create'); setIsLeadModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow">
                            <Plus size={18} /> Tambah Prospek
                        </button>
                    </div>
                    <CrudTable
                        columns={leadColumns}
                        data={leads}
                        loading={loadingLeads}
                        onEdit={(item) => { setLeadForm(item); setLeadMode('edit'); setIsLeadModalOpen(true); }}
                        onDelete={(item) => handleDeleteLead(item.id)}
                        userCapabilities={user?.role}
                    />
                </>
            )}

            {/* KONTEN TAB CAMPAIGNS */}
            {activeTab === 'campaigns' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => { setCampForm({ platform: 'ig', status: 'active', budget: 0 }); setCampMode('create'); setIsCampModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow">
                            <Plus size={18} /> Buat Kampanye
                        </button>
                    </div>
                    <CrudTable
                        columns={campaignColumns}
                        data={campaigns}
                        loading={loadingCamp}
                        onEdit={(item) => { setCampForm(item); setCampMode('edit'); setIsCampModalOpen(true); }}
                        onDelete={deleteItem}
                        userCapabilities={user?.role}
                    />
                </>
            )}

            {/* MODAL LEADS */}
            <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title={leadMode === 'create' ? 'Input Calon Jemaah' : 'Update Status'}>
                <form onSubmit={handleSaveLead} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text" className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" value={leadForm.name || ''} onChange={e => setLeadForm({...leadForm, name: e.target.value})} required placeholder="Contoh: Bpk. Ahmad"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
                        <input type="text" className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" value={leadForm.phone || ''} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} required placeholder="0812xxxx"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sumber</label>
                            <select className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" value={leadForm.source || 'ig'} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                                <option value="ig">Instagram Ads</option>
                                <option value="fb">Facebook Ads</option>
                                <option value="wa">WhatsApp Langsung</option>
                                <option value="website">Website</option>
                                <option value="walk_in">Datang ke Kantor</option>
                                <option value="referral">Referral / Teman</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Follow Up</label>
                            <select className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" value={leadForm.status || 'new'} onChange={e => setLeadForm({...leadForm, status: e.target.value})}>
                                <option value="new">Baru Masuk</option>
                                <option value="contacting">Sedang Dikontak</option>
                                <option value="interested">Tertarik / Tanya Harga</option>
                                <option value="closing">Closing (Jadi Daftar)</option>
                                <option value="lost">Batal / Tidak Respon</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Catatan Follow Up</label>
                        <textarea className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" rows="3" value={leadForm.notes || ''} onChange={e => setLeadForm({...leadForm, notes: e.target.value})} placeholder="Misal: Minta dikabari lagi minggu depan..."></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsLeadModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan Data</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL CAMPAIGNS (LENGKAP) */}
            <Modal isOpen={isCampModalOpen} onClose={() => setIsCampModalOpen(false)} title={campMode === 'create' ? 'Buat Kampanye Baru' : 'Edit Kampanye'}>
                <form onSubmit={handleSaveCampaign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Kampanye</label>
                        <input 
                            type="text" 
                            className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={campForm.title || ''} 
                            onChange={e => setCampForm({...campForm, title: e.target.value})} 
                            required 
                            placeholder="Contoh: Promo Ramadhan 2024"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Platform</label>
                            <select 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={campForm.platform || 'ig'} 
                                onChange={e => setCampForm({...campForm, platform: e.target.value})}
                            >
                                <option value="ig">Instagram Ads</option>
                                <option value="fb">Facebook Ads</option>
                                <option value="google">Google Ads</option>
                                <option value="tiktok">TikTok Ads</option>
                                <option value="offline">Offline / Brosur</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={campForm.status || 'active'} 
                                onChange={e => setCampForm({...campForm, status: e.target.value})}
                            >
                                <option value="active">Aktif Berjalan</option>
                                <option value="paused">Dijeda (Paused)</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Anggaran Iklan (Budget)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                            <input 
                                type="number" 
                                className="w-full border rounded p-2 pl-8 focus:ring-blue-500 focus:border-blue-500"
                                value={campForm.budget || ''} 
                                onChange={e => setCampForm({...campForm, budget: e.target.value})} 
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Mulai</label>
                            <input 
                                type="date" 
                                className="w-full border rounded p-1 text-sm"
                                value={campForm.start_date || ''} 
                                onChange={e => setCampForm({...campForm, start_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Selesai</label>
                            <input 
                                type="date" 
                                className="w-full border rounded p-1 text-sm"
                                value={campForm.end_date || ''} 
                                onChange={e => setCampForm({...campForm, end_date: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsCampModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {campMode === 'create' ? 'Buat Kampanye' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>

        </Layout>
    );
};

export default Marketing;
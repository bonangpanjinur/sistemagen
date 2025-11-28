import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Megaphone, Users, Instagram, Facebook, Globe, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Marketing = () => {
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'campaigns'

    // --- HOOKS DATA ---
    // Pastikan endpoint backend tersedia: /wp-json/umh/v1/leads dan /wp-json/umh/v1/marketing
    const { 
        data: leads, 
        loading: loadingLeads, 
        fetchData: fetchLeads,
        createItem: createLead, 
        updateItem: updateLead, 
        deleteItem: deleteLead 
    } = useCRUD('umh/v1/leads');

    const { 
        data: campaigns, 
        loading: loadingCamp, 
        fetchData: fetchCamp,
        createItem: createCamp, 
        updateItem: updateCamp, 
        deleteItem: deleteCamp 
    } = useCRUD('umh/v1/marketing');

    // Load data saat tab berubah
    useEffect(() => {
        if (activeTab === 'leads') fetchLeads();
        else fetchCamp();
    }, [activeTab, fetchLeads, fetchCamp]);

    // --- STATE MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // --- HANDLERS ---
    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        if (activeTab === 'leads') {
            setFormData(item || { 
                name: '', 
                phone: '', 
                source: 'ig', 
                status: 'new', 
                notes: '' 
            });
        } else {
            // Default tanggal hari ini untuk kampanye
            const today = new Date().toISOString().split('T')[0];
            setFormData(item ? {
                ...item,
                // Pastikan format tanggal aman untuk input date
                start_date: item.start_date ? item.start_date.split('T')[0] : today,
                end_date: item.end_date ? item.end_date.split('T')[0] : today
            } : { 
                title: '', 
                platform: 'ig', 
                budget: 0, 
                start_date: today, 
                end_date: today, 
                status: 'active' 
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        
        if (activeTab === 'leads') {
            success = modalMode === 'create' 
                ? await createLead(formData) 
                : await updateLead(currentItem.id, formData);
        } else {
            success = modalMode === 'create' 
                ? await createCamp(formData) 
                : await updateCamp(currentItem.id, formData);
        }

        if (success) {
            setIsModalOpen(false);
            // Refresh data setelah simpan
            if (activeTab === 'leads') fetchLeads(); else fetchCamp();
        }
    };

    // --- DEFINISI KOLOM ---
    const leadColumns = [
        { 
            header: 'Nama Calon Jemaah', 
            accessor: 'name', 
            sortable: true,
            render: (row) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    {row.notes && <div className="text-xs text-gray-500 truncate w-40">{row.notes}</div>}
                </div>
            )
        },
        { 
            header: 'Kontak', 
            accessor: 'phone',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm">
                   <MessageCircle size={14} className="text-green-600"/> {row.phone}
                </div>
            )
        },
        { 
            header: 'Sumber', 
            accessor: 'source', 
            render: r => <span className="uppercase text-xs font-bold bg-gray-100 px-2 py-1 rounded">{r.source}</span> 
        },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: r => {
                const colors = {
                    new: 'bg-blue-100 text-blue-700',
                    contacted: 'bg-yellow-100 text-yellow-700',
                    closing: 'bg-green-100 text-green-700',
                    lost: 'bg-red-100 text-red-700'
                };
                return <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${colors[r.status] || 'bg-gray-100'}`}>{r.status}</span>;
            } 
        }
    ];

    const campColumns = [
        { header: 'Nama Kampanye', accessor: 'title', sortable: true },
        { 
            header: 'Platform', 
            accessor: 'platform', 
            render: r => {
                const icons = {
                    ig: <Instagram size={14}/>,
                    fb: <Facebook size={14}/>,
                    google: <Globe size={14}/>,
                    tiktok: <span className="font-bold text-xs">TT</span>
                };
                return (
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-purple-50 text-purple-700 w-fit">
                        {icons[r.platform] || <Megaphone size={14}/>} 
                        <span className="uppercase text-xs font-bold">{r.platform}</span>
                    </div>
                );
            } 
        },
        { header: 'Budget', accessor: 'budget', render: r => formatCurrency(r.budget) },
        { 
            header: 'Periode', 
            accessor: 'start_date', 
            render: r => (
                <div className="text-xs text-gray-600">
                    <div>Mulai: {formatDate(r.start_date)}</div>
                    <div>Selesai: {formatDate(r.end_date)}</div>
                </div>
            ) 
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: r => (
                <span className={`badge ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {r.status === 'active' ? 'Berjalan' : 'Selesai'}
                </span>
            )
        }
    ];

    return (
        <Layout title="Marketing & Sales">
            {/* Tab Navigation */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('leads')} 
                    className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Users size={18}/> Database Leads (Calon Jemaah)
                </button>
                <button 
                    onClick={() => setActiveTab('campaigns')} 
                    className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === 'campaigns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Megaphone size={18}/> Manajemen Iklan
                </button>
            </div>

            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => openModal('create')} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> {activeTab === 'leads' ? 'Tambah Lead Manual' : 'Buat Kampanye Baru'}
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'leads' ? (
                <CrudTable 
                    columns={leadColumns} 
                    data={leads} 
                    loading={loadingLeads} 
                    onEdit={item => openModal('edit', item)} 
                    onDelete={deleteLead} 
                />
            ) : (
                <CrudTable 
                    columns={campColumns} 
                    data={campaigns} 
                    loading={loadingCamp} 
                    onEdit={item => openModal('edit', item)} 
                    onDelete={deleteCamp} 
                />
            )}

            {/* Modal Form */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={activeTab === 'leads' ? 'Form Data Calon Jemaah' : 'Setup Kampanye Iklan'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'leads' ? (
                        // FORM LEADS
                        <>
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input 
                                    className="input-field" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="Contoh: Bpk. Ahmad"
                                />
                            </div>
                            <div>
                                <label className="label">No. WhatsApp</label>
                                <input 
                                    className="input-field" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    required 
                                    placeholder="0812..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Sumber Datang</label>
                                    <select 
                                        className="input-field" 
                                        value={formData.source} 
                                        onChange={e => setFormData({...formData, source: e.target.value})}
                                    >
                                        <option value="ig">Instagram</option>
                                        <option value="fb">Facebook</option>
                                        <option value="wa">WhatsApp</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="walk_in">Datang Langsung</option>
                                        <option value="referral">Rekomendasi Teman</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Status Prospek</label>
                                    <select 
                                        className="input-field" 
                                        value={formData.status} 
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="new">Baru Masuk</option>
                                        <option value="contacted">Sudah Dihubungi</option>
                                        <option value="interested">Tertarik / Tanya Harga</option>
                                        <option value="closing">Closing (Jadi Daftar)</option>
                                        <option value="lost">Batal / Tidak Minat</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Catatan Tambahan</label>
                                <textarea 
                                    className="input-field" 
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Kebutuhan khusus atau catatan follow up..."
                                ></textarea>
                            </div>
                        </>
                    ) : (
                        // FORM CAMPAIGNS
                        <>
                            <div>
                                <label className="label">Judul Kampanye</label>
                                <input 
                                    className="input-field" 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    required 
                                    placeholder="Contoh: Promo Awal Tahun 2025"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Platform</label>
                                    <select 
                                        className="input-field" 
                                        value={formData.platform} 
                                        onChange={e => setFormData({...formData, platform: e.target.value})}
                                    >
                                        <option value="ig">Instagram Ads</option>
                                        <option value="fb">Facebook Ads</option>
                                        <option value="google">Google Ads</option>
                                        <option value="tiktok">TikTok Ads</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Budget Iklan (Rp)</label>
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        value={formData.budget} 
                                        onChange={e => setFormData({...formData, budget: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tanggal Mulai</label>
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        value={formData.start_date} 
                                        onChange={e => setFormData({...formData, start_date: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="label">Tanggal Selesai</label>
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        value={formData.end_date} 
                                        onChange={e => setFormData({...formData, end_date: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Status</label>
                                <select 
                                    className="input-field" 
                                    value={formData.status} 
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="active">Aktif (Sedang Jalan)</option>
                                    <option value="paused">Jeda (Paused)</option>
                                    <option value="completed">Selesai</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button type="submit" className="btn-primary">
                            Simpan Data
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Marketing;
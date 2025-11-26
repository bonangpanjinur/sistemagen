import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Megaphone, UserPlus, Target, ArrowLeft, Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

// --- Campaigns Component ---
const Campaigns = () => {
    const { data, loading, pagination, handlePageChange, createItem, updateItem, deleteItem, fetchItems } = useCRUD('marketing/campaigns');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'Nama Kampanye', accessor: 'name', className: 'font-bold' },
        { Header: 'Tipe', accessor: 'type' },
        { Header: 'Mulai', accessor: 'start_date', render: (val) => formatDate(val) },
        { Header: 'Selesai', accessor: 'end_date', render: (val) => formatDate(val) },
        { Header: 'Budget', accessor: 'budget', render: (val) => formatCurrency(val) },
        { Header: 'Status', accessor: 'status', render: (val) => <span className={`px-2 py-1 rounded text-xs font-medium ${val === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{val}</span> },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.id ? await updateItem(formData.id, formData) : await createItem(formData);
        setIsModalOpen(false); fetchItems();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Kampanye Marketing</h2>
                <button onClick={() => { setFormData({ status: 'planned', budget: 0 }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-1"/> Buat Kampanye</button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} onEdit={(item) => { setFormData({...item, start_date: formatDateForInput(item.start_date), end_date: formatDateForInput(item.end_date)}); setIsModalOpen(true); }} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title="Kelola Kampanye" show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm">Nama Kampanye</label><input type="text" className="w-full border p-2 rounded" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                    <div><label className="block text-sm">Tipe (e.g., Facebook Ads, Event)</label><input type="text" className="w-full border p-2 rounded" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Tgl Mulai</label><input type="date" className="w-full border p-2 rounded" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} required /></div>
                        <div><label className="block text-sm">Tgl Selesai</label><input type="date" className="w-full border p-2 rounded" value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Budget</label><input type="number" className="w-full border p-2 rounded" value={formData.budget || 0} onChange={e => setFormData({...formData, budget: e.target.value})} /></div>
                        <div><label className="block text-sm">Status</label><select className="w-full border p-2 rounded" value={formData.status || 'planned'} onChange={e => setFormData({...formData, status: e.target.value})}><option value="planned">Direncanakan</option><option value="active">Aktif</option><option value="completed">Selesai</option></select></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
                </form>
            </Modal>
        </div>
    );
};

// --- Leads Component ---
const Leads = () => {
    const { data, loading, pagination, handlePageChange, createItem, updateItem, deleteItem, fetchItems } = useCRUD('marketing/leads');
    const [campaigns, setCampaigns] = useState([]); // Local state for campaigns dropdown
    const { users } = useData(); // For assigning leads
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Load campaigns for dropdown
    useEffect(() => {
        // Assuming useCRUD exposes fetch or we can use api util. Using a quick fetch here.
        // In a real app, you might want to put this in DataContext if used globally
        import('../utils/api').then(module => {
            module.default.get('marketing/campaigns?per_page=-1').then(res => {
                setCampaigns(res.data.items || []);
            });
        });
    }, []);

    const columns = [
        { Header: 'Nama Prospek', accessor: 'full_name' },
        { Header: 'Kontak', accessor: 'phone', render: (val, row) => <div>{val}<br/><span className="text-xs text-gray-500">{row.email}</span></div> },
        { Header: 'Sumber', accessor: 'source' },
        { Header: 'Kampanye', accessor: 'campaign_name' },
        { Header: 'Status', accessor: 'status', render: (val) => <span className={`px-2 py-1 text-xs rounded uppercase font-bold ${val === 'converted' ? 'bg-green-200 text-green-900' : 'bg-blue-100 text-blue-800'}`}>{val}</span> },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.id ? await updateItem(formData.id, formData) : await createItem(formData);
        setIsModalOpen(false); fetchItems();
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Leads (Calon Jamaah)</h2>
                <button onClick={() => { setFormData({ status: 'new', source: 'Manual' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-1"/> Tambah Lead</button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} onEdit={(item) => { setFormData(item); setIsModalOpen(true); }} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title="Kelola Lead" show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm">Nama Lengkap</label><input type="text" className="w-full border p-2 rounded" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                         <div><label className="block text-sm">Email</label><input type="email" className="w-full border p-2 rounded" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                         <div><label className="block text-sm">Telepon</label><input type="text" className="w-full border p-2 rounded" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Sumber</label><input type="text" className="w-full border p-2 rounded" value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})} /></div>
                        <div>
                            <label className="block text-sm">Kampanye</label>
                            <select className="w-full border p-2 rounded" value={formData.campaign_id || ''} onChange={e => setFormData({...formData, campaign_id: e.target.value})}>
                                <option value="">-- Tidak Ada --</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm">Assign ke Staff</label>
                            <select className="w-full border p-2 rounded" value={formData.assigned_to_user_id || ''} onChange={e => setFormData({...formData, assigned_to_user_id: e.target.value})}>
                                <option value="">-- Pilih Staff --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm">Status</label>
                            <select className="w-full border p-2 rounded" value={formData.status || 'new'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="new">Baru</option>
                                <option value="contacted">Dihubungi</option>
                                <option value="qualified">Potensial</option>
                                <option value="converted">Jadi Jamaah</option>
                                <option value="unqualified">Gagal</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
                </form>
            </Modal>
        </div>
    );
};

const MarketingDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Marketing Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/marketing/campaigns" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition border border-gray-100">
                <div className="flex items-center mb-2"><Megaphone className="text-blue-600 mr-2" size={24} /><h3 className="font-bold text-gray-800">Kampanye</h3></div>
                <p className="text-sm text-gray-500">Kelola iklan, event promosi, dan anggaran marketing.</p>
            </Link>
            <Link to="/marketing/leads" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition border border-gray-100">
                <div className="flex items-center mb-2"><Target className="text-green-600 mr-2" size={24} /><h3 className="font-bold text-gray-800">Leads & Prospek</h3></div>
                <p className="text-sm text-gray-500">Database calon jamaah dari berbagai sumber.</p>
            </Link>
        </div>
    </div>
);

const Marketing = ({ userCapabilities }) => {
    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link to="/marketing" className="text-sm text-blue-600 hover:underline flex items-center"><ArrowLeft size={14} className="mr-1"/> Menu Marketing</Link>
            </div>
            <Routes>
                <Route path="/" element={<MarketingDashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/leads" element={<Leads />} />
            </Routes>
        </div>
    );
};

export default Marketing;
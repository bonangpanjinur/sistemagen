import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { ExternalLink, Plus } from 'lucide-react';

const Marketing = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/marketing');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ title: '', platform: 'ig', ad_link: '', budget: 0 });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Judul', accessor: 'title' },
        { header: 'Platform', accessor: 'platform', render: r => <span className="uppercase badge bg-blue-50 text-blue-700">{r.platform}</span> },
        { header: 'Link Iklan', accessor: 'ad_link', render: r => r.ad_link ? <a href={r.ad_link} target="_blank" className="text-blue-600 flex items-center gap-1 text-xs hover:underline"><ExternalLink size={12}/> Lihat Post</a> : '-' },
        { header: 'Budget', accessor: 'budget' }
    ];

    const openModal = (mode, item) => {
        setModalMode(mode); setCurrentItem(item);
        setFormData(item || { title: '', platform: 'ig', ad_link: '', budget: 0 });
        setIsModalOpen(true);
    };

    return (
        <Layout title="Marketing">
            <div className="mb-4 flex justify-end"><button onClick={()=>openModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Kampanye Baru</button></div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i=>openModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Kampanye Iklan">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Judul</label><input className="input-field" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required /></div>
                    <div><label className="label">Platform</label><select className="input-field" value={formData.platform} onChange={e=>setFormData({...formData, platform: e.target.value})}><option value="ig">Instagram</option><option value="fb">Facebook</option><option value="tiktok">TikTok</option></select></div>
                    
                    {/* LINK PREVIEW */}
                    <div>
                        <label className="label">Link Postingan</label>
                        <input className="input-field" placeholder="https://..." value={formData.ad_link} onChange={e=>setFormData({...formData, ad_link: e.target.value})} />
                        {formData.ad_link && (
                            <div className="mt-2 text-xs">
                                <p className="text-gray-500 mb-1">Preview:</p>
                                <a href={formData.ad_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">{formData.ad_link}</a>
                            </div>
                        )}
                    </div>

                    <div><label className="label">Budget</label><input type="number" className="input-field" value={formData.budget} onChange={e=>setFormData({...formData, budget: e.target.value})} /></div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Marketing;
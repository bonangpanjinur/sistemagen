import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Printer, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance');
    
    // Load Data Relasi untuk Dropdown (Point 1)
    const { data: jamaahList } = useCRUD('umh/v1/jamaah'); 
    const { data: agentList } = useCRUD('umh/v1/agents'); 
    const { data: employeeList } = useCRUD('umh/v1/hr/employees'); 

    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [filterType, setFilterType] = useState('all');
    
    // Point 4: Print State
    const [printData, setPrintData] = useState(null);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const income = data.filter(d => d.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
            const expense = data.filter(d => d.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
            setSummary({ income, expense, balance: income - expense });
        }
    }, [data]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    const defaultForm = {
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'pembayaran_paket',
        description: '',
        jamaah_id: '',
        agent_id: '',     
        employee_id: '',  
        payment_method: 'transfer'
    };
    const [formData, setFormData] = useState(defaultForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item ? { ...item, date: item.date?.split('T')[0] } : defaultForm);
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = { ...formData };
        // Reset field relasi yang tidak relevan dengan kategori
        if (payload.category !== 'fee_agen') payload.agent_id = null;
        if (payload.category !== 'gaji') payload.employee_id = null;
        if (payload.type === 'expense') payload.jamaah_id = null;

        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    // Point 4: Fungsi Cetak Kwitansi
    const handlePrint = (item) => {
        setPrintData(item);
        setTimeout(() => { window.print(); }, 500);
    };

    const filteredData = filterType === 'all' ? data : data.filter(d => d.type === filterType);

    const columns = [
        { header: 'Tanggal', accessor: 'date', render: (row) => <span className="text-sm">{formatDate(row.date)}</span> },
        { header: 'Tipe', accessor: 'type', render: (row) => <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.type === 'income' ? 'Masuk' : 'Keluar'}</span> },
        { 
            header: 'Detail', 
            accessor: 'description',
            render: (row) => (
                <div>
                    <div className="text-sm font-medium">{row.category ? row.category.replace(/_/g, ' ') : '-'}</div>
                    <div className="text-xs text-gray-500">{row.description}</div>
                    {/* Point 1: Tampilkan nama relasi di tabel */}
                    {row.agent_name && <div className="text-xs text-purple-600 mt-1 flex items-center gap-1"><User size={10}/> Agen: {row.agent_name}</div>}
                    {row.employee_name && <div className="text-xs text-blue-600 mt-1 flex items-center gap-1"><User size={10}/> Staff: {row.employee_name}</div>}
                    {row.jamaah_name && <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><User size={10}/> Dari: {row.jamaah_name}</div>}
                </div>
            )
        },
        { header: 'Jumlah', accessor: 'amount', className: 'text-right', render: (row) => <span className={`font-bold ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{row.type === 'expense' ? '-' : '+'} {formatCurrency(row.amount)}</span> },
    ];

    return (
        <Layout title="Keuangan">
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #receipt-area, #receipt-area * { visibility: visible; }
                    #receipt-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="flex justify-between mb-4 no-print">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['all', 'income', 'expense'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-md text-sm capitalize ${filterType === t ? 'bg-white shadow-sm' : 'text-gray-500'}`}>{t}</button>
                    ))}
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2"><Plus size={18}/> Transaksi Baru</button>
            </div>

            <div className="no-print">
                <CrudTable 
                    columns={columns} 
                    data={filteredData} 
                    loading={loading} 
                    onEdit={(item) => handleOpenModal('edit', item)} 
                    onDelete={deleteItem}
                    renderRowActions={(row) => (
                        <button onClick={() => handlePrint(row)} className="text-gray-500 hover:text-blue-600" title="Cetak Kwitansi">
                            <Printer size={18} />
                        </button>
                    )}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Transaksi">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Jenis</label><select className="input-field" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></div>
                        <div><label className="label">Tanggal</label><input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                    </div>

                    <div>
                        <label className="label">Kategori</label>
                        <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="operasional">Operasional</option>
                            <option value="gaji">Gaji Karyawan</option>
                            <option value="fee_agen">Fee / Komisi Agen</option>
                            <option value="pembayaran_paket">Pembayaran Paket</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                    </div>

                    {/* Point 1: Dropdown Relasi Kondisional */}
                    {formData.category === 'fee_agen' && (
                        <div className="bg-purple-50 p-2 rounded">
                            <label className="label text-purple-800">Pilih Agen (Penerima Fee)</label>
                            <select className="input-field" value={formData.agent_id} onChange={e=>setFormData({...formData, agent_id: e.target.value})}><option value="">-- Pilih Agen --</option>{agentList?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                        </div>
                    )}
                    {formData.category === 'gaji' && (
                        <div className="bg-blue-50 p-2 rounded">
                            <label className="label text-blue-800">Pilih Karyawan (Penerima Gaji)</label>
                            <select className="input-field" value={formData.employee_id} onChange={e=>setFormData({...formData, employee_id: e.target.value})}><option value="">-- Pilih Karyawan --</option>{employeeList?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                        </div>
                    )}

                    <div><label className="label">Nominal</label><input type="number" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required /></div>
                    <div><label className="label">Keterangan</label><textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                    
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>

            {/* Layout Kwitansi (Point 4) */}
            <div id="receipt-area" className="hidden bg-white p-8 border max-w-xl mx-auto mt-10 font-mono text-sm">
                {printData && (
                    <div className="space-y-4">
                        <div className="text-center border-b pb-4 mb-4"><h2 className="text-2xl font-bold">KWITANSI</h2><p>Bukti Pembayaran Valid</p></div>
                        <div className="flex justify-between"><span>Tanggal:</span> <span>{formatDate(printData.date)}</span></div>
                        <div className="border-y py-4 my-4 space-y-2">
                            <div className="flex justify-between font-bold"><span>Kategori:</span> <span className="capitalize">{printData.category?.replace('_', ' ')}</span></div>
                            {printData.agent_name && <div className="flex justify-between"><span>Agen:</span> <span>{printData.agent_name}</span></div>}
                            {printData.employee_name && <div className="flex justify-between"><span>Karyawan:</span> <span>{printData.employee_name}</span></div>}
                            <div className="flex justify-between"><span>Ket:</span> <span>{printData.description}</span></div>
                        </div>
                        <div className="flex justify-between text-xl font-bold mt-4"><span>TOTAL:</span><span>{formatCurrency(printData.amount)}</span></div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
export default Finance;
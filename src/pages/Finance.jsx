import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Wallet, Printer, Download, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Finance = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/finance');
    
    // Load Data Relasi
    const { data: jamaahList } = useCRUD('umh/v1/jamaah'); 
    const { data: agentList } = useCRUD('umh/v1/agents'); 
    const { data: employeeList } = useCRUD('umh/v1/hr/employees'); 

    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [filterType, setFilterType] = useState('all');
    
    // Print State
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();

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
        agent_id: '',     // New
        employee_id: '',  // New
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
        // Cleanup foreign keys based on category
        if (payload.category !== 'fee_agen') payload.agent_id = null;
        if (payload.category !== 'gaji') payload.employee_id = null;
        if (payload.type === 'expense') payload.jamaah_id = null;

        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    const handlePrint = (item) => {
        setPrintData(item);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const filteredData = filterType === 'all' ? data : data.filter(d => d.type === filterType);

    const columns = [
        { header: 'Tanggal', accessor: 'date', render: (row) => <span className="text-sm">{formatDate(row.date)}</span> },
        { header: 'Tipe', accessor: 'type', render: (row) => <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.type === 'income' ? 'Masuk' : 'Keluar'}</span> },
        { header: 'Kategori', accessor: 'category', render: (row) => <span className="capitalize">{row.category ? row.category.replace(/_/g, ' ') : '-'}</span> },
        { 
            header: 'Detail / Penerima', 
            accessor: 'description',
            render: (row) => (
                <div>
                    <div className="text-sm text-gray-800">{row.description || '-'}</div>
                    <div className="text-xs text-gray-500">
                        {row.jamaah_name && <><User size={10} className="inline"/> Dari: {row.jamaah_name}</>}
                        {row.agent_name && <><User size={10} className="inline"/> Agen: {row.agent_name}</>}
                        {row.employee_name && <><User size={10} className="inline"/> Karyawan: {row.employee_name}</>}
                    </div>
                </div>
            )
        },
        { header: 'Jumlah', accessor: 'amount', className: 'text-right', render: (row) => <span className={`font-bold ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{row.type === 'expense' ? '-' : '+'} {formatCurrency(row.amount)}</span> },
    ];

    return (
        <Layout title="Keuangan & Arus Kas">
            {/* Style Khusus Print */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #receipt-area, #receipt-area * { visibility: visible; }
                    #receipt-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                    <p className="text-gray-500 text-sm font-medium">Sisa Saldo</p>
                    <h3 className="text-2xl font-bold text-blue-700">{formatCurrency(summary.balance)}</h3>
                </div>
                {/* ... Card lain sama ... */}
            </div>

            <div className="flex justify-between mb-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['all', 'income', 'expense'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-md text-sm capitalize ${filterType === t ? 'bg-white shadow-sm' : 'text-gray-500'}`}>{t}</button>
                    ))}
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2"><Plus size={18}/> Transaksi Baru</button>
            </div>

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

            {/* MODAL FORM */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tambah Transaksi' : 'Edit Transaksi'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis</label>
                            <select className="input-field" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, category: e.target.value === 'income' ? 'pembayaran_paket' : 'operasional' })}>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>
                        <div><label className="label">Tanggal</label><input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                    </div>

                    <div>
                        <label className="label">Kategori</label>
                        <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {formData.type === 'income' ? (
                                <>
                                    <option value="pembayaran_paket">Pembayaran Paket</option>
                                    <option value="dp">DP Umrah</option>
                                    <option value="lainnya">Lainnya</option>
                                </>
                            ) : (
                                <>
                                    <optgroup label="Operasional">
                                        <option value="operasional">Operasional Kantor</option>
                                        <option value="gaji">Gaji Karyawan</option>
                                        <option value="fee_agen">Komisi/Fee Agen</option>
                                    </optgroup>
                                    <optgroup label="Vendor">
                                        <option value="vendor_hotel">Bayar Hotel</option>
                                        <option value="vendor_tiket">Bayar Tiket</option>
                                        <option value="vendor_visa">Bayar Visa</option>
                                    </optgroup>
                                </>
                            )}
                        </select>
                    </div>

                    {/* DYNAMIC RECIPIENT FIELDS */}
                    {formData.type === 'income' && (
                        <div><label className="label">Jemaah</label><select className="input-field" value={formData.jamaah_id} onChange={e=>setFormData({...formData, jamaah_id: e.target.value})}><option value="">-- Pilih Jemaah --</option>{jamaahList?.map(j => <option key={j.id} value={j.id}>{j.full_name}</option>)}</select></div>
                    )}

                    {formData.category === 'fee_agen' && (
                        <div><label className="label">Agen Penerima</label><select className="input-field" value={formData.agent_id} onChange={e=>setFormData({...formData, agent_id: e.target.value})}><option value="">-- Pilih Agen --</option>{agentList?.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}</select></div>
                    )}

                    {formData.category === 'gaji' && (
                        <div><label className="label">Karyawan</label><select className="input-field" value={formData.employee_id} onChange={e=>setFormData({...formData, employee_id: e.target.value})}><option value="">-- Pilih Karyawan --</option>{employeeList?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    )}

                    <div><label className="label">Nominal (Rp)</label><input type="number" className="input-field font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required /></div>
                    <div><label className="label">Keterangan</label><textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Gaji Bulan November" /></div>
                    
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Simpan</button></div>
                </form>
            </Modal>

            {/* HIDDEN RECEIPT FOR PRINTING */}
            <div id="receipt-area" className="hidden bg-white p-8 border border-gray-300 max-w-xl mx-auto mt-10">
                {printData && (
                    <div className="space-y-4 font-mono">
                        <div className="text-center border-b-2 border-dashed pb-4 mb-4">
                            <h2 className="text-2xl font-bold">KWITANSI PEMBAYARAN</h2>
                            <p className="text-sm text-gray-500">Travel Umroh & Haji</p>
                        </div>
                        <div className="flex justify-between"><span>Tanggal:</span> <span>{formatDate(printData.date)}</span></div>
                        <div className="flex justify-between"><span>No. Transaksi:</span> <span>#{printData.id}</span></div>
                        <div className="border-t border-b border-dashed py-4 my-4">
                            <div className="flex justify-between mb-2"><span className="font-bold">Kategori:</span> <span className="capitalize">{printData.category?.replace('_', ' ')}</span></div>
                            <div className="flex justify-between mb-2"><span className="font-bold">Keterangan:</span> <span>{printData.description}</span></div>
                            {printData.jamaah_name && <div className="flex justify-between mb-2"><span className="font-bold">Jemaah:</span> <span>{printData.jamaah_name}</span></div>}
                            {printData.agent_name && <div className="flex justify-between mb-2"><span className="font-bold">Agen:</span> <span>{printData.agent_name}</span></div>}
                        </div>
                        <div className="flex justify-between text-xl font-bold mt-4">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(printData.amount)}</span>
                        </div>
                        <div className="pt-8 text-center text-xs text-gray-400">Dicetak otomatis oleh sistem.</div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
export default Finance;
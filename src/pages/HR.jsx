import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';
import { Users, CreditCard, Search } from 'lucide-react';

const HR = () => {
    const [activeTab, setActiveTab] = useState('employees'); // employees | loans
    const endpoint = activeTab === 'employees' ? 'umh/v1/hr/profiles' : 'umh/v1/hr/loans';
    const { data, loading, fetchData, createItem } = useCRUD(endpoint);

    // State khusus untuk pencarian karyawan di form Kasbon
    const [employeesList, setEmployeesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { 
        fetchData(); 
        // Load semua karyawan untuk dropdown
        if (activeTab === 'loans') {
            api.get('umh/v1/hr/profiles').then(res => setEmployeesList(res.data || []));
        }
    }, [activeTab, fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Filter Karyawan untuk Kasbon
    const filteredEmployees = employeesList.filter(e => 
        e.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectEmployee = (emp) => {
        setFormData({ ...formData, employee_id: emp.id, employee_name: emp.full_name });
        setSearchTerm(emp.full_name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (await createItem(formData)) {
            setIsModalOpen(false);
            setFormData({});
            setSearchTerm('');
        }
    };

    const columns = activeTab === 'employees' ? [
        { header: 'Nama Lengkap', accessor: 'full_name', className: 'font-bold' },
        { header: 'Jabatan', accessor: 'position' },
        { header: 'Departemen', accessor: 'department' },
        { header: 'Gaji Pokok', accessor: 'salary', render: r => formatCurrency(r.salary) },
        { header: 'Tgl Masuk', accessor: 'join_date' }
    ] : [
        { header: 'Nama Karyawan', accessor: 'employee_name', className: 'font-bold' },
        { header: 'Tgl Kasbon', accessor: 'loan_date' },
        { header: 'Keterangan', accessor: 'description' },
        { header: 'Nominal', accessor: 'amount', render: r => <span className="text-red-600 font-bold">{formatCurrency(r.amount)}</span> },
        { header: 'Status', accessor: 'status', render: r => <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{r.status}</span> }
    ];

    return (
        <Layout title="HR & Payroll">
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 text-sm rounded-md flex gap-2 items-center transition ${activeTab === 'employees' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>
                        <Users size={16} /> Data Karyawan
                    </button>
                    <button onClick={() => setActiveTab('loans')} className={`px-4 py-2 text-sm rounded-md flex gap-2 items-center transition ${activeTab === 'loans' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>
                        <CreditCard size={16} /> Data Kasbon
                    </button>
                </div>
                <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                    + {activeTab === 'employees' ? 'Karyawan Baru' : 'Catat Kasbon'}
                </button>
            </div>

            {loading ? <Spinner /> : <CrudTable columns={columns} data={data} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'employees' ? "Tambah Karyawan Baru" : "Form Pengajuan Kasbon"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* FORM KARYAWAN */}
                    {activeTab === 'employees' && (
                        <>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label><input className="w-full border p-2 rounded" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Jabatan</label><input className="w-full border p-2 rounded" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Departemen</label><input className="w-full border p-2 rounded" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Finance/Ops/dll" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Gaji Pokok</label><input type="number" className="w-full border p-2 rounded" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} /></div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tanggal Mulai Bekerja</label>
                                    <input type="date" className="w-full border p-2 rounded" value={formData.join_date || ''} onChange={e => setFormData({...formData, join_date: e.target.value})} />
                                    <p className="text-xs text-gray-400 mt-1">Tanggal resmi bergabung.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* FORM KASBON (SEARCHABLE) */}
                    {activeTab === 'loans' && (
                        <>
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-500 uppercase">Cari Karyawan</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        className="w-full border p-2 pl-10 rounded" 
                                        placeholder="Ketik nama..." 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)} 
                                    />
                                </div>
                                {searchTerm && searchTerm !== formData.employee_name && (
                                    <div className="absolute z-10 bg-white border shadow-lg w-full max-h-40 overflow-y-auto rounded mt-1">
                                        {filteredEmployees.map(emp => (
                                            <div key={emp.id} onClick={() => selectEmployee(emp)} className="p-2 hover:bg-blue-50 cursor-pointer border-b text-sm">
                                                <strong>{emp.full_name}</strong> <span className="text-gray-500 text-xs">({emp.position})</span>
                                            </div>
                                        ))}
                                        {filteredEmployees.length === 0 && <div className="p-2 text-gray-500 text-sm">Tidak ditemukan.</div>}
                                    </div>
                                )}
                            </div>

                            <div><label className="text-xs font-bold text-gray-500 uppercase">Tanggal Kasbon</label><input type="date" className="w-full border p-2 rounded" value={formData.loan_date || ''} onChange={e => setFormData({...formData, loan_date: e.target.value})} required /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Jumlah (Rp)</label><input type="number" className="w-full border p-2 rounded font-bold" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} required /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Keterangan</label><textarea className="w-full border p-2 rounded" rows="2" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Keperluan..." /></div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Batal</button>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded shadow">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default HR;
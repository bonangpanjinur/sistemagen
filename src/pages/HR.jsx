import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Users, Calendar, DollarSign, CheckSquare, Wallet, Save, User } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../utils/api'; 

const HR = () => {
    const { user } = useData();
    const [activeTab, setActiveTab] = useState('employees'); 
    
    const { data: employees, createItem: createEmp, updateItem: updateEmp, deleteItem: deleteEmp } = useCRUD('umh/v1/hr/employees');
    const { data: attendance, fetchData: fetchAttendance } = useCRUD('umh/v1/hr/attendance');
    const { data: loans, createItem: createLoan, updateItem: updateLoan, deleteItem: deleteLoan } = useCRUD('umh/v1/hr/loans');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceList, setAttendanceList] = useState({}); 

    const handleAttendanceChange = (empId, status) => {
        setAttendanceList(prev => ({ ...prev, [empId]: status }));
    };

    const saveBulkAttendance = async () => {
        const toastId = toast.loading('Menyimpan absensi...');
        try {
            const payload = employees.map(emp => ({
                employee_id: emp.id,
                date: attendanceDate,
                status: attendanceList[emp.id] || 'present'
            }));
            await api.post('umh/v1/hr/attendance/bulk', { date: attendanceDate, items: payload });
            toast.success('Absensi berhasil disimpan!', { id: toastId });
            fetchAttendance();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan absensi', { id: toastId });
        }
    };
    
    useEffect(() => {
        if (attendance && attendance.length > 0) {
            const todayRecords = attendance.filter(a => a.date === attendanceDate);
            const currentStatus = {};
            todayRecords.forEach(r => { currentStatus[r.employee_id] = r.status; });
            setAttendanceList(currentStatus);
        } else {
            setAttendanceList({}); 
        }
    }, [attendanceDate, attendance]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        if (activeTab === 'employees') setFormData(item || { status: 'active' });
        else if (activeTab === 'loans') setFormData(item || { date: new Date().toISOString().split('T')[0], amount: 0, status: 'unpaid' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        if (activeTab === 'employees') success = modalMode === 'create' ? await createEmp(formData) : await updateEmp(currentItem.id, formData);
        else if (activeTab === 'loans') success = modalMode === 'create' ? await createLoan(formData) : await updateLoan(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const employeeColumns = [
        { header: 'Nama', accessor: 'name', sortable: true, render: row => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {row.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900">{row.name}</span>
            </div>
        )},
        { header: 'Posisi', accessor: 'position' },
        { header: 'Gaji Pokok', accessor: 'salary', render: row => formatCurrency(row.salary) },
        { header: 'Status', accessor: 'status', render: row => <span className={`px-2 py-1 rounded text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.status}</span> }
    ];

    const loanColumns = [
        { header: 'Tanggal', accessor: 'date' },
        { header: 'Nama', accessor: 'employee_id', render: row => employees.find(e => e.id == row.employee_id)?.name || '-' },
        { header: 'Nominal', accessor: 'amount', render: row => formatCurrency(row.amount) },
        { header: 'Status', accessor: 'status', render: row => <span className={`px-2 py-1 rounded text-xs ${row.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{row.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</span> }
    ];

    // Logic perhitungan gaji sederhana (dummy)
    const payrollColumns = [
        { header: 'Nama', accessor: 'name' },
        { header: 'Gaji Pokok', accessor: 'salary', render: row => formatCurrency(row.salary) },
        { header: 'Potongan', accessor: 'deduction', render: () => <span className="text-red-500">-Rp 0</span> }, 
        { header: 'Gaji Bersih', accessor: 'net', render: row => <span className="font-bold text-green-600">{formatCurrency(row.salary)}</span> },
    ];

    return (
        <Layout title="Human Resources (HR)">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {['employees', 'attendance', 'loans', 'payroll'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} 
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === tab ? 'text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                            {tab === 'employees' && <span className="flex items-center justify-center gap-2"><Users size={18}/> Karyawan</span>}
                            {tab === 'attendance' && <span className="flex items-center justify-center gap-2"><CheckSquare size={18}/> Absensi</span>}
                            {tab === 'loans' && <span className="flex items-center justify-center gap-2"><Wallet size={18}/> Kasbon</span>}
                            {tab === 'payroll' && <span className="flex items-center justify-center gap-2"><DollarSign size={18}/> Penggajian</span>}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'employees' && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Data Karyawan</h3>
                                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"><Plus size={16}/> Tambah Karyawan</button>
                            </div>
                            <CrudTable columns={employeeColumns} data={employees} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteEmp} />
                        </>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded shadow-sm border">
                                        <Calendar className="text-blue-500" size={20}/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 mb-1">Pilih Tanggal Absensi</label>
                                        <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="border p-1 rounded text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-300 outline-none" />
                                    </div>
                                </div>
                                <button onClick={saveBulkAttendance} className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm transition-all text-sm font-medium">
                                    <Save size={18}/> Simpan Absensi
                                </button>
                            </div>

                            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Karyawan</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Hadir</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Izin</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Alpha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {employees.map(emp => {
                                            const status = attendanceList[emp.id] || 'present';
                                            return (
                                                <tr key={emp.id} className="hover:bg-blue-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={16}/></div>
                                                        {emp.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <label className="cursor-pointer flex justify-center items-center h-full w-full">
                                                            <input type="radio" name={`att_${emp.id}`} checked={status === 'present'} onChange={() => handleAttendanceChange(emp.id, 'present')} className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer" />
                                                        </label>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <label className="cursor-pointer flex justify-center items-center h-full w-full">
                                                            <input type="radio" name={`att_${emp.id}`} checked={status === 'permission'} onChange={() => handleAttendanceChange(emp.id, 'permission')} className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 cursor-pointer" />
                                                        </label>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <label className="cursor-pointer flex justify-center items-center h-full w-full">
                                                            <input type="radio" name={`att_${emp.id}`} checked={status === 'absent'} onChange={() => handleAttendanceChange(emp.id, 'absent')} className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer" />
                                                        </label>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'loans' && (
                        <>
                            <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"><Plus size={16}/> Ajukan Kasbon</button></div>
                            <CrudTable columns={loanColumns} data={loans} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteLoan} />
                        </>
                    )}

                    {activeTab === 'payroll' && (
                        <div>
                            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">Fitur penggajian otomatis sedang dalam pengembangan. Menampilkan data gaji pokok.</div>
                            <CrudTable columns={payrollColumns} data={employees} />
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'employees' ? 'Form Karyawan' : 'Form Kasbon'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'employees' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input className="mt-1 w-full border rounded p-2" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Posisi / Jabatan</label>
                                <input className="mt-1 w-full border rounded p-2" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gaji Pokok (Rp)</label>
                                <input className="mt-1 w-full border rounded p-2" type="number" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} required />
                            </div>
                        </>
                    ) : (
                        <>
                            <select className="w-full border rounded p-2" value={formData.employee_id || ''} onChange={e => setFormData({...formData, employee_id: e.target.value})} required>
                                <option value="">Pilih Karyawan</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            <input type="date" className="w-full border rounded p-2" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} required />
                            <input className="w-full border rounded p-2" type="number" placeholder="Nominal Kasbon (Rp)" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                            <select className="w-full border rounded p-2" value={formData.status || 'unpaid'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="unpaid">Belum Lunas</option>
                                <option value="paid">Lunas</option>
                            </select>
                        </>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-100 px-4 py-2 rounded text-gray-700">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default HR;
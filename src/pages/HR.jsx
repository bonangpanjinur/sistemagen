import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Users, Calendar, DollarSign, CheckSquare, Wallet, Save } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../utils/api'; // Direct API for bulk save

const HR = () => {
    const { user } = useData();
    const [activeTab, setActiveTab] = useState('employees'); 
    
    // DATA
    const { data: employees, createItem: createEmp, updateItem: updateEmp, deleteItem: deleteEmp } = useCRUD('umh/v1/hr/employees');
    const { data: attendance, fetchData: fetchAttendance } = useCRUD('umh/v1/hr/attendance');
    const { data: loans, createItem: createLoan, updateItem: updateLoan, deleteItem: deleteLoan } = useCRUD('umh/v1/hr/loans');

    // MODAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // ABSENSI CHECKLIST STATE
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceList, setAttendanceList] = useState({}); // { empId: 'present' | 'absent' }

    // --- LOGIC ABSENSI CHECKLIST ---
    const handleAttendanceChange = (empId, status) => {
        setAttendanceList(prev => ({
            ...prev,
            [empId]: status
        }));
    };

    const saveBulkAttendance = async () => {
        const toastId = toast.loading('Menyimpan absensi...');
        try {
            // Ubah object ke array payload
            const payload = employees.map(emp => ({
                employee_id: emp.id,
                date: attendanceDate,
                status: attendanceList[emp.id] || 'present' // Default hadir
            }));
            
            // Kirim ke endpoint bulk (perlu dibuat di backend, atau loop di frontend)
            // Untuk MVP kita loop axios call atau kirim array jika backend support
            // Disini saya asumsikan backend terima array di endpoint baru atau kita loop
            
            await api.post('umh/v1/hr/attendance/bulk', { date: attendanceDate, items: payload });
            
            toast.success('Absensi berhasil disimpan!', { id: toastId });
            fetchAttendance(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan absensi', { id: toastId });
        }
    };
    
    // Load existing attendance for selected date
    React.useEffect(() => {
        if (attendance && attendance.length > 0) {
            const todayRecords = attendance.filter(a => a.date === attendanceDate);
            const currentStatus = {};
            todayRecords.forEach(r => {
                currentStatus[r.employee_id] = r.status;
            });
            setAttendanceList(currentStatus);
        } else {
            setAttendanceList({}); // Reset jika tanggal baru belum ada data
        }
    }, [attendanceDate, attendance]);


    // --- LOGIC PENGGAJIAN ---
    const payrollData = useMemo(() => {
        if (!employees) return [];
        return employees.map(emp => {
            const empAbsence = attendance ? attendance.filter(a => a.employee_id === emp.id && a.status === 'absent').length : 0;
            const deductionPerDay = 100000; 
            const totalDeduction = empAbsence * deductionPerDay;
            
            const empLoans = loans ? loans.filter(l => l.employee_id === emp.id && l.status === 'unpaid') : [];
            const totalCashbon = empLoans.reduce((sum, loan) => sum + parseInt(loan.amount || 0), 0);
            const baseSalary = parseInt(emp.salary) || 0;
            
            return {
                ...emp,
                total_absence: empAbsence,
                total_deduction: totalDeduction,
                cashbon_current: totalCashbon,
                net_salary: baseSalary - totalDeduction - totalCashbon
            };
        });
    }, [employees, attendance, loans]);

    // HANDLERS UMUM
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
        { header: 'Nama', accessor: 'name' },
        { header: 'Posisi', accessor: 'position' },
        { header: 'Gaji Pokok', accessor: 'salary', render: row => formatCurrency(row.salary) },
        { header: 'Status', accessor: 'status', render: row => <span className={`badge ${row.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>{row.status}</span> }
    ];

    const loanColumns = [
        { header: 'Tanggal', accessor: 'date' },
        { header: 'Nama', accessor: 'employee_id', render: row => employees.find(e => e.id == row.employee_id)?.name || '-' },
        { header: 'Nominal', accessor: 'amount', render: row => formatCurrency(row.amount) },
        { header: 'Status', accessor: 'status', render: row => row.status === 'paid' ? 'Lunas' : 'Belum Lunas' }
    ];

    const payrollColumns = [
        { header: 'Nama', accessor: 'name' },
        { header: 'Gaji Pokok', accessor: 'salary', render: row => formatCurrency(row.salary) },
        { header: 'Potongan Absen', accessor: 'total_deduction', render: row => <span className="text-red-600">-{formatCurrency(row.total_deduction)}</span> },
        { header: 'Kasbon', accessor: 'cashbon_current', render: row => <span className="text-orange-600">-{formatCurrency(row.cashbon_current)}</span> },
        { header: 'Gaji Bersih', accessor: 'net_salary', render: row => <span className="font-bold text-green-700">{formatCurrency(row.net_salary)}</span> },
    ];

    return (
        <Layout title="Manajemen SDM (HR)">
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                {['employees', 'attendance', 'loans', 'payroll'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} 
                        className={`pb-2 px-4 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>
                        {tab === 'employees' ? 'Data Karyawan' : tab === 'loans' ? 'Kasbon' : tab === 'payroll' ? 'Gaji' : 'Absensi'}
                    </button>
                ))}
            </div>

            {activeTab === 'employees' && (
                <>
                    <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal('create')} className="btn-primary"><Plus size={18}/> Tambah Karyawan</button></div>
                    <CrudTable columns={employeeColumns} data={employees} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteEmp} />
                </>
            )}

            {activeTab === 'attendance' && (
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <label className="font-bold text-gray-700">Tanggal Absensi:</label>
                            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="border p-2 rounded" />
                        </div>
                        <button onClick={saveBulkAttendance} className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                            <Save size={18}/> Simpan Semua Absensi
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Karyawan</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hadir</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sakit / Izin</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alpha (Absen)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map(emp => {
                                    const status = attendanceList[emp.id] || 'present';
                                    return (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{emp.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="radio" name={`att_${emp.id}`} checked={status === 'present'} onChange={() => handleAttendanceChange(emp.id, 'present')} className="w-5 h-5 text-green-600" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="radio" name={`att_${emp.id}`} checked={status === 'permission'} onChange={() => handleAttendanceChange(emp.id, 'permission')} className="w-5 h-5 text-yellow-600" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="radio" name={`att_${emp.id}`} checked={status === 'absent'} onChange={() => handleAttendanceChange(emp.id, 'absent')} className="w-5 h-5 text-red-600" />
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
                    <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal('create')} className="btn-primary"><Wallet size={18}/> Ajukan Kasbon</button></div>
                    <CrudTable columns={loanColumns} data={loans} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteLoan} />
                </>
            )}

            {activeTab === 'payroll' && (
                <div className="bg-white p-4 rounded shadow">
                    <CrudTable columns={payrollColumns} data={payrollData} />
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'employees' ? 'Form Karyawan' : 'Form Kasbon'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'employees' ? (
                        <>
                            <input className="input-field" placeholder="Nama Lengkap" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input className="input-field" placeholder="Posisi" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} required />
                            <input className="input-field" type="number" placeholder="Gaji Pokok (Rp)" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} required />
                        </>
                    ) : (
                        <>
                            <select className="input-field" value={formData.employee_id || ''} onChange={e => setFormData({...formData, employee_id: e.target.value})} required>
                                <option value="">Pilih Karyawan</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            <input type="date" className="input-field" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} required />
                            <input className="input-field" type="number" placeholder="Nominal (Rp)" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                            <select className="input-field" value={formData.status || 'unpaid'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="unpaid">Belum Lunas</option>
                                <option value="paid">Lunas</option>
                            </select>
                        </>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default HR;
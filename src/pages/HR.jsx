import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, Users, Calendar, DollarSign, CheckSquare, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

const HR = () => {
    const { user } = useData();
    // Tab State: employees, attendance, loans (kasbon), payroll
    const [activeTab, setActiveTab] = useState('employees'); 
    
    // --- STATE & CRUD ---
    // 1. Data Karyawan
    const { 
        data: employees, 
        loading: loadingEmp, 
        createItem: createEmp, 
        updateItem: updateEmp, 
        deleteItem: deleteEmp 
    } = useCRUD('umh/v1/hr/employees');

    // 2. Data Absensi
    const {
        data: attendance,
        loading: loadingAtt,
        createItem: createAtt
    } = useCRUD('umh/v1/hr/attendance');

    // 3. Data Kasbon (DIPISAHKAN DARI DATA KARYAWAN)
    const {
        data: loans,
        loading: loadingLoans,
        createItem: createLoan,
        updateItem: updateLoan,
        deleteItem: deleteLoan
    } = useCRUD('umh/v1/hr/loans');

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    // --- LOGIC PENGGAJIAN (PAYROLL) ---
    const payrollData = useMemo(() => {
        if (!employees) return [];
        return employees.map(emp => {
            // Hitung Absensi
            const empAbsence = attendance.filter(a => a.employee_id === emp.id && a.status === 'absent').length;
            const deductionPerDay = 100000; // Contoh potongan absen
            const totalDeduction = empAbsence * deductionPerDay;

            // Hitung Total Kasbon Belum Lunas (Logic Sederhana MVP)
            // Mengambil data kasbon milik karyawan ini
            const empLoans = loans.filter(l => l.employee_id === emp.id && l.status === 'unpaid');
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

    // --- HANDLERS ---
    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        
        // Reset form sesuai tab aktif
        if (activeTab === 'employees') {
            setFormData(item || { status: 'active' });
        } else if (activeTab === 'attendance') {
            setFormData({ date: new Date().toISOString().split('T')[0], status: 'present' });
        } else if (activeTab === 'loans') {
            setFormData(item || { date: new Date().toISOString().split('T')[0], amount: 0, status: 'unpaid' });
        }
        
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        
        if (activeTab === 'employees') {
            if (modalMode === 'create') success = await createEmp(formData);
            else success = await updateEmp(currentItem.id, formData);
        } else if (activeTab === 'attendance') {
            success = await createAtt(formData);
        } else if (activeTab === 'loans') {
            if (modalMode === 'create') success = await createLoan(formData);
            else success = await updateLoan(currentItem.id, formData);
        }

        if (success) setIsModalOpen(false);
    };

    // --- COLUMNS ---
    const employeeColumns = [
        { header: 'Nama', accessor: 'name', sortable: true },
        { header: 'Posisi', accessor: 'position', sortable: true },
        { header: 'Telepon', accessor: 'phone' },
        { header: 'Gaji Pokok', accessor: 'salary', render: (row) => formatCurrency(row.salary) },
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
    ];

    const attendanceColumns = [
        { header: 'Tanggal', accessor: 'date' },
        { header: 'Nama Karyawan', accessor: 'employee_name', render: (row) => {
            const emp = employees.find(e => e.id === row.employee_id);
            return emp ? emp.name : 'Unknown';
        }},
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status === 'present' ? 'Hadir' : row.status === 'permission' ? 'Izin' : 'Alpa'}
            </span>
        )},
        { header: 'Keterangan', accessor: 'notes' }
    ];

    const loanColumns = [
        { header: 'Tanggal', accessor: 'date' },
        { header: 'Nama Karyawan', accessor: 'employee_id', render: (row) => {
            const emp = employees.find(e => e.id == row.employee_id);
            return emp ? emp.name : '-';
        }},
        { header: 'Nominal', accessor: 'amount', render: (row) => formatCurrency(row.amount) },
        { header: 'Keterangan', accessor: 'description' },
        { header: 'Status', accessor: 'status', render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {row.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
            </span>
        )}
    ];

    const payrollColumns = [
        { header: 'Nama', accessor: 'name' },
        { header: 'Gaji Pokok', accessor: 'salary', render: (row) => formatCurrency(row.salary) },
        { header: 'Potongan Absen', accessor: 'total_deduction', render: (row) => <span className="text-red-600">-{formatCurrency(row.total_deduction)}</span> },
        { header: 'Potongan Kasbon', accessor: 'cashbon_current', render: (row) => <span className="text-orange-600">-{formatCurrency(row.cashbon_current)}</span> },
        { header: 'Gaji Bersih', accessor: 'net_salary', render: (row) => <span className="font-bold text-green-700">{formatCurrency(row.net_salary)}</span> },
    ];

    return (
        <Layout title="Manajemen SDM (HR)">
            {/* TABS NAVIGATION */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
                <button onClick={() => setActiveTab('employees')}
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'employees' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2"><Users size={18}/> Data Karyawan</div>
                </button>
                <button onClick={() => setActiveTab('attendance')}
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'attendance' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2"><CheckSquare size={18}/> Absensi</div>
                </button>
                <button onClick={() => setActiveTab('loans')}
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'loans' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2"><Wallet size={18}/> Kasbon</div>
                </button>
                <button onClick={() => setActiveTab('payroll')}
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'payroll' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2"><DollarSign size={18}/> Rekap Gaji</div>
                </button>
            </div>

            {/* ACTION BUTTON */}
            {activeTab !== 'payroll' && (
                <div className="mb-4 flex justify-end">
                    <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Plus size={20} />
                        {activeTab === 'employees' && 'Tambah Karyawan'}
                        {activeTab === 'attendance' && 'Input Absensi'}
                        {activeTab === 'loans' && 'Ajukan Kasbon'}
                    </button>
                </div>
            )}

            {/* CONTENT RENDER */}
            {activeTab === 'employees' && (
                <CrudTable
                    columns={employeeColumns}
                    data={employees}
                    loading={loadingEmp}
                    onEdit={(item) => handleOpenModal('edit', item)}
                    onDelete={deleteEmp}
                />
            )}

            {activeTab === 'attendance' && (
                <CrudTable
                    columns={attendanceColumns}
                    data={attendance}
                    loading={loadingAtt}
                    onDelete={deleteEmp} // Opsi hapus absensi
                />
            )}

            {activeTab === 'loans' && (
                <CrudTable
                    columns={loanColumns}
                    data={loans}
                    loading={loadingLoans}
                    onEdit={(item) => handleOpenModal('edit', item)}
                    onDelete={deleteLoan}
                />
            )}

            {activeTab === 'payroll' && (
                <div className="bg-white p-4 rounded shadow">
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded">
                        Info: Gaji Bersih = Gaji Pokok - Potongan Absen - Kasbon (Status Belum Lunas).
                    </div>
                    <CrudTable
                        columns={payrollColumns}
                        data={payrollData}
                        loading={loadingEmp}
                    />
                </div>
            )}

            {/* MODAL FORM */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    activeTab === 'employees' ? (modalMode === 'create' ? 'Tambah Karyawan' : 'Edit Karyawan') :
                    activeTab === 'loans' ? 'Formulir Kasbon' :
                    'Input Absensi'
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* --- FORM KARYAWAN --- */}
                    {activeTab === 'employees' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input type="text" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Posisi</label>
                                <input type="text" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                                <input type="text" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gaji Pokok (Rp)</label>
                                <input type="number" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} required />
                            </div>
                        </>
                    )}

                    {/* --- FORM ABSENSI --- */}
                    {activeTab === 'attendance' && (
                        <>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Karyawan</label>
                                <select className="mt-1 block w-full rounded border p-2"
                                    value={formData.employee_id || ''} onChange={e => setFormData({...formData, employee_id: e.target.value})} required>
                                    <option value="">-- Pilih Karyawan --</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select className="mt-1 block w-full rounded border p-2"
                                    value={formData.status || 'present'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="present">Hadir</option>
                                    <option value="absent">Tidak Hadir (Potong Gaji)</option>
                                    <option value="permission">Izin</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                                <input type="text" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
                            </div>
                        </>
                    )}

                    {/* --- FORM KASBON (BARU) --- */}
                    {activeTab === 'loans' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Karyawan</label>
                                <select className="mt-1 block w-full rounded border p-2"
                                    value={formData.employee_id || ''} onChange={e => setFormData({...formData, employee_id: e.target.value})} required 
                                    disabled={modalMode === 'edit'}>
                                    <option value="">-- Pilih Karyawan --</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pengajuan</label>
                                <input type="date" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nominal Kasbon (Rp)</label>
                                <input type="number" className="mt-1 block w-full rounded border p-2" 
                                    value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Keterangan / Keperluan</label>
                                <textarea className="mt-1 block w-full rounded border p-2" 
                                    value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                                <select className="mt-1 block w-full rounded border p-2"
                                    value={formData.status || 'unpaid'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="unpaid">Belum Lunas (Potong Gaji)</option>
                                    <option value="paid">Lunas</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default HR;